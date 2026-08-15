const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Member = require('../models/Member');
const Group = require('../models/Group');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const LoanType = require('../models/LoanType');
const Loan = require('../models/Loan');
const LoanReview = require('../models/LoanReview');
const AuditLog = require('../models/AuditLog');
const Role = require('../models/Role'); // For checking system roles

// Import Data
const { organizations } = require('./data/organizations');
const { branches } = require('./data/branches');
const { users } = require('./data/users');
const { members } = require('./data/members');
const { groups } = require('./data/groups');
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
    const isReset = process.argv.includes('--reset');

    if (isReset) {
      console.log('Clearing existing seed data...');
      // Extract IDs to safely delete only seed data to prevent destroying real prod data
      const orgIds = organizations.map(o => o._id);
      
      await AuditLog.deleteMany({});
      await LoanReview.deleteMany({ organizationId: { $in: orgIds } });
      await Loan.deleteMany({ organizationId: { $in: orgIds } });
      await LoanType.deleteMany({ organizationId: { $in: orgIds } });
      await SavingsTransaction.deleteMany({ organizationId: { $in: orgIds } });
      await SavingsAccount.deleteMany({ organizationId: { $in: orgIds } });
      await Group.deleteMany({ organizationId: { $in: orgIds } });
      await Member.deleteMany({ organizationId: { $in: orgIds } });
      
      const usernames = users.map(u => u.username);
      await User.deleteMany({ username: { $in: usernames } });
      
      await Branch.deleteMany({ organizationId: { $in: orgIds } });
      await Organization.deleteMany({ _id: { $in: orgIds } });
      
      console.log('Seed data cleared.');
    }

    console.log('Starting seed insertion...');

    // Dependency order: Orgs -> Branches -> Users -> Members -> Groups -> Savings -> LoanTypes -> Loans -> Reviews -> Audit
    await Organization.insertMany(organizations);
    console.log(`Organizations inserted: ${organizations.length}`);

    await Branch.insertMany(branches);
    console.log(`Branches inserted: ${branches.length}`);

    // Users have pre-save hook for passwords if created via .create()
    for (const user of users) {
      await User.create(user);
    }
    console.log(`Users inserted: ${users.length}`);

    await Member.insertMany(members);
    console.log(`Members inserted: ${members.length}`);

    await Group.insertMany(groups);
    console.log(`Groups inserted: ${groups.length}`);

    await SavingsAccount.insertMany(savingsAccounts);
    console.log(`Savings accounts inserted: ${savingsAccounts.length}`);

    await SavingsTransaction.insertMany(savingsTransactions);
    console.log(`Savings transactions inserted: ${savingsTransactions.length}`);

    await LoanType.insertMany(loanTypes);
    console.log(`Loan types inserted: ${loanTypes.length}`);

    await Loan.insertMany(loans);
    console.log(`Loans inserted: ${loans.length}`);

    await LoanReview.insertMany(loanReviews);
    console.log(`Loan reviews inserted: ${loanReviews.length}`);

    await AuditLog.insertMany(auditLogs);
    console.log(`Audit logs inserted: ${auditLogs.length}`);

    console.log('==================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seed data: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(importData);
