const mongoose = require('mongoose');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const Group = require('../models/Group');
const Member = require('../models/Member');

/**
 * Automatically ensures a member has a dedicated SavingsAccount and initial opening passbook deposit
 * for a specific group they are enrolled in.
 */
const ensureMemberGroupSavingsAccount = async (memberId, groupId, orgId, branchId, userId) => {
  try {
    if (!memberId || !groupId) return null;

    let existingAccount = await SavingsAccount.findOne({ memberId, groupId });
    if (existingAccount) return existingAccount;

    const [memberDoc, groupDoc] = await Promise.all([
      Member.findById(memberId),
      Group.findById(groupId)
    ]);

    if (!memberDoc || !groupDoc) return null;

    const effectiveOrgId = orgId || groupDoc.organizationId || memberDoc.organizationId;
    const effectiveBranchId = branchId || groupDoc.branchId || memberDoc.branchId;
    const effectiveUserId = userId || memberDoc.userId;

    const grpCode = groupDoc.groupCode || 'GRP';
    const memCode = memberDoc.memberId || `MEM-${memberDoc._id.toString().slice(-4)}`;
    const baseAccountNum = `SAV-${grpCode}-${memCode}`;

    // Ensure unique account number
    const count = await SavingsAccount.countDocuments({ organizationId: effectiveOrgId });
    const uniqueAccountNum = `SAV-${grpCode}-${memCode}-${(count + 1).toString().padStart(4, '0')}`;

    const openingBalance = 15000;
    const newAccount = await SavingsAccount.create({
      organizationId: effectiveOrgId,
      branchId: effectiveBranchId,
      memberId: memberDoc._id,
      groupId: groupDoc._id,
      accountNumber: uniqueAccountNum,
      accountType: 'Regular Savings',
      openingBalance,
      currentBalance: openingBalance,
      minimumBalance: 500,
      interestRate: 4.5,
      status: 'Active',
      openedAt: new Date(),
      lastTransactionDate: new Date(),
      createdBy: effectiveUserId,
    });

    // Create Initial Opening Deposit Transaction
    const txnNum = Math.floor(100000 + Math.random() * 900000);
    await SavingsTransaction.create({
      organizationId: effectiveOrgId,
      branchId: effectiveBranchId,
      savingsAccountId: newAccount._id,
      memberId: memberDoc._id,
      groupId: groupDoc._id,
      transactionId: `TRX-${grpCode}-${txnNum}`,
      transactionType: 'Deposit',
      amount: openingBalance,
      paymentMethod: 'Cash',
      balanceAfterTransaction: openingBalance,
      transactionDate: new Date(),
      status: 'Completed',
      createdBy: effectiveUserId,
      remarks: `Opening savings thrift deposit for ${groupDoc.groupName}`
    });

    console.log(`[Auto Group Savings] Created account ${uniqueAccountNum} for member ${memberDoc.fullName} in group ${groupDoc.groupName}`);
    return newAccount;
  } catch (err) {
    console.warn(`[Auto Group Savings Error]: ${err.message}`);
    return null;
  }
};

module.exports = {
  ensureMemberGroupSavingsAccount,
};
