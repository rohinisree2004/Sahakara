const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');
const GroupMembership = require('../models/GroupMembership');
const Member = require('../models/Member');
const Group = require('../models/Group');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const LoanType = require('../models/LoanType');
const Loan = require('../models/Loan');
const LoanReview = require('../models/LoanReview');
const AuditLog = require('../models/AuditLog');
const OTP = require('../models/OTP');

// Import Data
const { organizations, orgIds } = require('./data/organizations');
const { branches, branchIds } = require('./data/branches');
const { users, userIds } = require('./data/users');
const { members, memberIds } = require('./data/members');
const { groups, groupIds } = require('./data/groups');
const { savingsAccounts, savingsTransactions } = require('./data/savings');
const { loanTypes } = require('./data/loanTypes');
const { loans, loanReviews } = require('./data/loans');
const { auditLogs } = require('./data/auditLogs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sahakara_erp', {});
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    console.log('Clearing all existing database collections...');
    
    // Completely wipe all relevant collections for clean state
    await Promise.all([
      AuditLog.deleteMany({}),
      OTP.deleteMany({}),
      LoanReview.deleteMany({}),
      Loan.deleteMany({}),
      LoanType.deleteMany({}),
      SavingsTransaction.deleteMany({}),
      SavingsAccount.deleteMany({}),
      GroupMembership.deleteMany({}),
      Group.deleteMany({}),
      Member.deleteMany({}),
      RoleAssignment.deleteMany({}),
      User.deleteMany({}),
      Branch.deleteMany({}),
      Organization.deleteMany({}),
    ]);
    
    console.log('All collections cleared successfully.');
    try {
      await SavingsAccount.collection.dropIndexes();
      await SavingsAccount.syncIndexes();
      await SavingsTransaction.collection.dropIndexes();
      await SavingsTransaction.syncIndexes();
    } catch (e) {
      console.log('Index sync notice:', e.message);
    }
    console.log('Starting seed insertion with correct branch staff and group-elected executives...');

    // 1. Insert Organizations
    await Organization.insertMany(organizations);
    console.log(`✓ Organizations inserted: ${organizations.length}`);

    // 2. Insert Branches
    await Branch.insertMany(branches);
    console.log(`✓ Branches inserted: ${branches.length}`);

    // 3. Insert Users (Staff & Members)
    for (const user of users) {
      const createdUser = await User.create(user);

      // Create branch/organization level RoleAssignments ONLY for Staff (Super Admin, Org Admin, Branch Manager, Employee)
      if (['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'].includes(user.role)) {
        await RoleAssignment.create({
          userId: createdUser._id,
          role: user.role,
          organizationId: user.organizationId || null,
          branchId: user.branchId || null,
          groupId: null,
          status: 'Active',
        });
      }
    }
    console.log(`✓ Users created & Branch Staff RoleAssignments assigned: ${users.length}`);

    // 4. Insert Members
    await Member.insertMany(members);
    console.log(`✓ Members inserted: ${members.length}`);

    // 5. Group Roster Mapping & Group Leadership Election
    const groupMemberMap = {};
    for (const m of members) {
      const gList = m.groupIds || (m.groupId ? [m.groupId] : []);
      for (const gid of gList) {
        const key = gid.toString();
        if (!groupMemberMap[key]) groupMemberMap[key] = [];
        groupMemberMap[key].push(m);
      }
    }

    for (const group of groups) {
      const gMembers = groupMemberMap[group._id.toString()] || [];
      const memberDocIds = gMembers.map(m => m._id);

      // Elect President, Secretary, and Treasurer from the members of this group!
      const electedPresident = gMembers[0] || null;
      const electedSecretary = gMembers[1] || gMembers[0] || null;
      const electedTreasurer = gMembers[2] || gMembers[0] || null;

      const createdGroup = await Group.create({
        ...group,
        leaderId: electedPresident ? electedPresident._id : null,
        presidentId: electedPresident ? electedPresident._id : null,
        secretaryId: electedSecretary ? electedSecretary._id : null,
        treasurerId: electedTreasurer ? electedTreasurer._id : null,
        memberIds: memberDocIds,
        totalMembers: memberDocIds.length,
      });

      // 6. Create GroupMembership & Group-level Executive RoleAssignments for this group
      for (let i = 0; i < gMembers.length; i++) {
        const m = gMembers[i];
        if (!m.userId) continue;

        // Determine group-specific elected role
        let electedRole = 'Member';
        if (i === 0) electedRole = 'President';
        else if (i === 1) electedRole = 'Secretary';
        else if (i === 2) electedRole = 'Treasurer';

        // Group Membership
        await GroupMembership.create({
          userId: m.userId,
          groupId: createdGroup._id,
          organizationId: createdGroup.organizationId,
          branchId: createdGroup.branchId,
          memberId: m.memberId,
          status: 'Active',
          joinedAt: m.joiningDate || new Date(),
        });

        // Group Role Assignment
        await RoleAssignment.create({
          userId: m.userId,
          role: electedRole,
          organizationId: createdGroup.organizationId,
          branchId: createdGroup.branchId,
          groupId: createdGroup._id,
          status: 'Active',
        });
      }
    }
    console.log(`✓ Groups created with elected Presidents, Secretaries, and Treasurers: ${groups.length}`);

    // 7. Insert Financial Accounts & Types
    await SavingsAccount.insertMany(savingsAccounts);
    console.log(`✓ Savings accounts inserted: ${savingsAccounts.length}`);

    await SavingsTransaction.insertMany(savingsTransactions);
    console.log(`✓ Savings transactions inserted: ${savingsTransactions.length}`);

    await LoanType.insertMany(loanTypes);
    console.log(`✓ Loan types inserted: ${loanTypes.length}`);

    await Loan.insertMany(loans);
    console.log(`✓ Loans inserted: ${loans.length}`);

    await LoanReview.insertMany(loanReviews);
    console.log(`✓ Loan reviews inserted: ${loanReviews.length}`);

    await AuditLog.insertMany(auditLogs);
    console.log(`✓ Audit logs inserted: ${auditLogs.length}`);

    console.log('====================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY WITH ACCURATE ROLES! ');
    console.log(' - Branches managed by Branch Managers & Employees');
    console.log(' - Groups belong to Branches & Organizations');
    console.log(' - Presidents, Secretaries, Treasurers are elected from group members');
    console.log(' - Members belong to 1 to 4 groups with login credentials');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seed data: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(importData);
