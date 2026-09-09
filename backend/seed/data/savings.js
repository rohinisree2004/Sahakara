const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { members } = require('./members');
const { groups } = require('./groups');
const { userIds } = require('./users');

const savingsAccounts = [];
const savingsTransactions = [];

const groupMap = {};
for (const g of groups) {
  groupMap[g._id.toString()] = g;
}

// Generate dedicated group savings account and passbook ledger for every member for every group they belong to!
let accCounter = 1000;
let txnCounter = 5000;

for (const member of members) {
  const gList = member.groupIds && member.groupIds.length > 0 
    ? member.groupIds 
    : (member.groupId ? [member.groupId] : []);

  for (let gIdx = 0; gIdx < gList.length; gIdx++) {
    const gid = gList[gIdx];
    const groupDoc = groupMap[gid.toString()];
    if (!groupDoc) continue;

    accCounter++;
    const accountId = new mongoose.Types.ObjectId();
    const grpCode = groupDoc.groupCode || `GRP${gIdx + 1}`;
    const memCode = member.memberId || `MEM${member._id.toString().slice(-4)}`;
    const accountNumber = `SAV-${grpCode}-${memCode}`;

    // Stagger balances between 12,000 and 28,000 for realistic data
    const baseOpen = 5000 + ((member._id.toString().charCodeAt(member._id.toString().length - 1) % 4) * 1000);
    const deposit1 = 3000 + (gIdx * 500);
    const deposit2 = 4500;
    const deposit3 = 2500;
    const totalBal = baseOpen + deposit1 + deposit2 + deposit3;

    savingsAccounts.push({
      _id: accountId,
      organizationId: member.organizationId || groupDoc.organizationId,
      branchId: groupDoc.branchId || member.branchId,
      memberId: member._id,
      groupId: groupDoc._id,
      accountNumber: accountNumber,
      accountType: 'Regular Savings',
      openingBalance: baseOpen,
      currentBalance: totalBal,
      minimumBalance: 500,
      interestRate: 4.5,
      status: 'Active',
      openedAt: new Date(2025, 0, 15),
      lastTransactionDate: new Date(2025, 3, 20),
      createdBy: member.createdBy || userIds.kuAdmin,
    });

    // 1. Opening Deposit Transaction
    txnCounter++;
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: member.organizationId || groupDoc.organizationId,
      branchId: groupDoc.branchId || member.branchId,
      savingsAccountId: accountId,
      memberId: member._id,
      groupId: groupDoc._id,
      transactionId: `TRX-${grpCode}-${txnCounter}`,
      transactionType: 'Deposit',
      amount: baseOpen,
      paymentMethod: 'Cash',
      balanceAfterTransaction: baseOpen,
      transactionDate: new Date(2025, 0, 15),
      status: 'Completed',
      createdBy: member.createdBy || userIds.kuAdmin,
      remarks: `Opening savings deposit for ${groupDoc.groupName}`
    });

    // 2. Monthly Thrift Contribution 1
    txnCounter++;
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: member.organizationId || groupDoc.organizationId,
      branchId: groupDoc.branchId || member.branchId,
      savingsAccountId: accountId,
      memberId: member._id,
      groupId: groupDoc._id,
      transactionId: `TRX-${grpCode}-${txnCounter}`,
      transactionType: 'Deposit',
      amount: deposit1,
      paymentMethod: 'UPI',
      referenceNumber: `UPI${txnCounter}948`,
      balanceAfterTransaction: baseOpen + deposit1,
      transactionDate: new Date(2025, 1, 15),
      status: 'Completed',
      createdBy: member.createdBy || userIds.kuAdmin,
      remarks: `Monthly thrift installment - Feb 2025 (${groupDoc.groupName})`
    });

    // 3. Monthly Thrift Contribution 2
    txnCounter++;
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: member.organizationId || groupDoc.organizationId,
      branchId: groupDoc.branchId || member.branchId,
      savingsAccountId: accountId,
      memberId: member._id,
      groupId: groupDoc._id,
      transactionId: `TRX-${grpCode}-${txnCounter}`,
      transactionType: 'Deposit',
      amount: deposit2,
      paymentMethod: 'Cash',
      balanceAfterTransaction: baseOpen + deposit1 + deposit2,
      transactionDate: new Date(2025, 2, 15),
      status: 'Completed',
      createdBy: member.createdBy || userIds.kuAdmin,
      remarks: `Monthly thrift installment - Mar 2025 (${groupDoc.groupName})`
    });

    // 4. Special Group Deposit 3
    txnCounter++;
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: member.organizationId || groupDoc.organizationId,
      branchId: groupDoc.branchId || member.branchId,
      savingsAccountId: accountId,
      memberId: member._id,
      groupId: groupDoc._id,
      transactionId: `TRX-${grpCode}-${txnCounter}`,
      transactionType: 'Deposit',
      amount: deposit3,
      paymentMethod: 'Bank Transfer',
      referenceNumber: `NEFT${txnCounter}331`,
      balanceAfterTransaction: totalBal,
      transactionDate: new Date(2025, 3, 20),
      status: 'Completed',
      createdBy: member.createdBy || userIds.kuAdmin,
      remarks: `Seasonal thrift deposit (${groupDoc.groupName})`
    });
  }
}

module.exports = { savingsAccounts, savingsTransactions };
