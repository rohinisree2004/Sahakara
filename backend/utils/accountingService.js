const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const FinancialTransaction = require('../models/FinancialTransaction');

/**
 * Ensures standard accounts exist for an organization
 */
const ensureDefaultAccounts = async (organizationId, userId) => {
  const defaultAccounts = [
    { code: '1000', name: 'Cash on Hand', type: 'Asset', normalBalance: 'Debit' },
    { code: '1100', name: 'Bank Account', type: 'Asset', normalBalance: 'Debit' },
    { code: '1200', name: 'Loan Receivable', type: 'Asset', normalBalance: 'Debit' },
    { code: '2000', name: 'Member Savings Payable', type: 'Liability', normalBalance: 'Credit' },
    { code: '3000', name: 'Retained Earnings', type: 'Equity', normalBalance: 'Credit' },
    { code: '4000', name: 'Interest Income', type: 'Income', normalBalance: 'Credit' },
    { code: '4100', name: 'Fee Income', type: 'Income', normalBalance: 'Credit' },
    { code: '5000', name: 'General Expense', type: 'Expense', normalBalance: 'Debit' },
  ];

  const existingAccounts = await ChartOfAccount.find({ organizationId });
  const existingCodes = existingAccounts.map(a => a.accountCode);

  const missingAccounts = defaultAccounts.filter(a => !existingCodes.includes(a.code));

  if (missingAccounts.length > 0) {
    const accountsToInsert = missingAccounts.map(a => ({
      organizationId,
      accountCode: a.code,
      accountName: a.name,
      accountType: a.type,
      normalBalance: a.normalBalance,
      createdBy: userId
    }));
    await ChartOfAccount.insertMany(accountsToInsert);
  }
};

/**
 * Get an account by code
 */
const getAccountByCode = async (organizationId, code) => {
  return await ChartOfAccount.findOne({ organizationId, accountCode: code });
};

/**
 * Post a balanced journal entry
 */
const postJournalEntry = async ({ organizationId, branchId, date, description, referenceType, referenceId, lines, userId }) => {
  // Validate balancing
  let totalDebit = 0;
  let totalCredit = 0;

  for (let line of lines) {
    totalDebit += line.debit || 0;
    totalCredit += line.credit || 0;
  }

  // Use a small epsilon for floating point issues
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Journal entry is unbalanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  if (totalDebit <= 0) {
    throw new Error('Journal entry must have a non-zero amount.');
  }

  const entryNumber = 'JE' + Date.now().toString();

  const entry = await JournalEntry.create({
    organizationId,
    branchId,
    entryNumber,
    entryDate: date || new Date(),
    description,
    referenceType,
    referenceId,
    createdBy: userId
  });

  const lineDocs = lines.map(line => ({
    journalEntryId: entry._id,
    organizationId,
    accountId: line.accountId,
    debit: line.debit || 0,
    credit: line.credit || 0,
    description: line.description || description
  }));

  await JournalLine.insertMany(lineDocs);

  return entry;
};

/**
 * Record a high-level financial transaction + journal entry
 */
const recordTransaction = async ({
  organizationId,
  branchId,
  memberId,
  sourceModule,
  sourceId,
  transactionType, // Inflow, Outflow, Adjustment
  amount,
  paymentMethod,
  date,
  description,
  userId,
  status = 'Completed',
  journalLines // Array of { accountId, debit, credit, description }
}) => {
  // 1. Post Journal Entry
  const journalEntry = await postJournalEntry({
    organizationId,
    branchId,
    date,
    description,
    referenceType: sourceModule,
    referenceId: sourceId,
    lines: journalLines,
    userId
  });

  // 2. Record Financial Transaction (Audit Level)
  const transactionId = 'FTX' + Date.now().toString();
  
  const finTxn = await FinancialTransaction.create({
    organizationId,
    branchId,
    memberId,
    transactionId,
    sourceModule,
    sourceId,
    journalEntryId: journalEntry._id,
    transactionType,
    amount,
    paymentMethod,
    transactionDate: date || new Date(),
    description,
    status,
    createdBy: userId
  });

  return finTxn;
};

module.exports = {
  ensureDefaultAccounts,
  getAccountByCode,
  postJournalEntry,
  recordTransaction
};
