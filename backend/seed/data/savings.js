const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { memberIds } = require('./members');
const { userIds } = require('./users');

const savingsAccounts = [];
const savingsTransactions = [];

const createSavingsData = (orgId, branchId, prefix, count, createdBy) => {
  for (let i = 1; i <= count; i++) {
    const memberIdKey = `${prefix}${i}`;
    const accountId = new mongoose.Types.ObjectId();
    const openingBalance = 500;
    const additionalDeposits = [1000, 1500];

    // Savings Account
    savingsAccounts.push({
      _id: accountId,
      organizationId: orgId,
      branchId: branchId,
      memberId: memberIds[memberIdKey],
      accountNumber: `SA-${prefix}-${1000 + i}`,
      accountType: 'Regular Savings',
      openingBalance: openingBalance,
      currentBalance: openingBalance + additionalDeposits[0] + additionalDeposits[1],
      minimumBalance: 100,
      interestRate: 4.5,
      status: 'Active',
      openedAt: new Date(2025, 1, 15),
      lastTransactionDate: new Date(),
      createdBy: createdBy,
    });

    // Opening Deposit Transaction
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: orgId,
      branchId: branchId,
      savingsAccountId: accountId,
      memberId: memberIds[memberIdKey],
      transactionId: `TRX-${prefix}-${2000 + (i * 3)}`,
      transactionType: 'Deposit',
      amount: openingBalance,
      paymentMethod: 'Cash',
      balanceAfterTransaction: openingBalance,
      transactionDate: new Date(2025, 1, 15),
      status: 'Completed',
      createdBy: createdBy,
      remarks: 'Opening Balance Deposit'
    });

    // Transaction 1
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: orgId,
      branchId: branchId,
      savingsAccountId: accountId,
      memberId: memberIds[memberIdKey],
      transactionId: `TRX-${prefix}-${2001 + (i * 3)}`,
      transactionType: 'Deposit',
      amount: additionalDeposits[0],
      paymentMethod: 'Cash',
      balanceAfterTransaction: openingBalance + additionalDeposits[0],
      transactionDate: new Date(2025, 2, 10),
      status: 'Completed',
      createdBy: createdBy,
      remarks: 'Monthly Deposit'
    });

    // Transaction 2
    savingsTransactions.push({
      _id: new mongoose.Types.ObjectId(),
      organizationId: orgId,
      branchId: branchId,
      savingsAccountId: accountId,
      memberId: memberIds[memberIdKey],
      transactionId: `TRX-${prefix}-${2002 + (i * 3)}`,
      transactionType: 'Deposit',
      amount: additionalDeposits[1],
      paymentMethod: 'Bank Transfer',
      balanceAfterTransaction: openingBalance + additionalDeposits[0] + additionalDeposits[1],
      transactionDate: new Date(2025, 3, 10),
      status: 'Completed',
      createdBy: createdBy,
      remarks: 'Monthly Deposit'
    });
  }
};

createSavingsData(orgIds.keralaUnity, branchIds.kottayamMain, 'KU', 6, userIds.kuAdmin);
createSavingsData(orgIds.sahodaya, branchIds.ernakulamMain, 'SA', 6, userIds.saAdmin);
createSavingsData(orgIds.greenValley, branchIds.palakkadMain, 'GV', 6, userIds.gvAdmin);
createSavingsData(orgIds.malabarWelfare, branchIds.kozhikodeMain, 'MW', 6, userIds.mwAdmin);

module.exports = { savingsAccounts, savingsTransactions };
