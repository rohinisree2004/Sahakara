const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Member = require('../models/Member');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const Loan = require('../models/Loan');
const LoanType = require('../models/LoanType');
const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const FinancialTransaction = require('../models/FinancialTransaction');

const seedAccounting100 = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://Rohini:Rohini%402004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';

    console.log('====================================================');
    console.log(' Connecting to MongoDB to Seed 100+ Accounting Data...');
    console.log('====================================================');
    await mongoose.connect(mongoUri);
    console.log('[MongoDB Connected Successfully]');

    // 1. Fetch or ensure primary organizations
    let organizations = await Organization.find({ isDeleted: false });
    if (organizations.length === 0) {
      console.log('No organizations found, creating sample cooperative society...');
      const newOrg = await Organization.create({
        name: 'Sahakara Primary Cooperative Agriculture Credit Society',
        code: 'SPCS-101',
        registrationNumber: 'REG/COOP/2024/0981',
        societyType: 'Primary Agricultural Credit Society (PACS)',
        email: 'info@sahakarapoly.coop',
        phone: '+91 98450 12345',
        state: 'Karnataka',
        district: 'Bengaluru Rural',
        address: 'Main Market Road, Doddaballapura',
        status: 'Active',
      });
      organizations = [newOrg];
    }
    const primaryOrg = organizations[0];
    const orgId = primaryOrg._id;
    console.log(`[Target Organization]: ${primaryOrg.name} (${primaryOrg.code})`);

    // 2. Fetch or create branches
    let branches = await Branch.find({ organizationId: orgId, isDeleted: false });
    if (branches.length === 0) {
      console.log('Creating sample operational branches...');
      const createdBranches = await Branch.insertMany([
        {
          organizationId: orgId,
          name: 'Main Town Branch',
          branchCode: 'BR-001',
          city: 'Doddaballapura',
          district: 'Bengaluru Rural',
          state: 'Karnataka',
          status: 'Active',
          phone: '+91 98450 11001',
          email: 'main.branch@sahakara.coop',
        },
        {
          organizationId: orgId,
          name: 'North Rural Branch',
          branchCode: 'BR-002',
          city: 'Tubagere',
          district: 'Bengaluru Rural',
          state: 'Karnataka',
          status: 'Active',
          phone: '+91 98450 11002',
          email: 'north.branch@sahakara.coop',
        },
        {
          organizationId: orgId,
          name: 'East Agricultural Hub Branch',
          branchCode: 'BR-003',
          city: 'Kasaba',
          district: 'Bengaluru Rural',
          state: 'Karnataka',
          status: 'Active',
          phone: '+91 98450 11003',
          email: 'east.branch@sahakara.coop',
        },
      ]);
      branches = createdBranches;
    }
    console.log(`[Branches Available]: ${branches.length} branches ready.`);

    // 3. Ensure Staff & Accountant Users exist
    let users = await User.find({ organizationId: orgId });
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

    if (users.length < 5) {
      console.log('Creating additional staff/accountant users...');
      const newStaffUsers = [
        {
          organizationId: orgId,
          branchId: branches[0]._id,
          name: 'Ramesh Kulkarni',
          email: 'treasurer.ramesh@sahakara.coop',
          password: defaultPasswordHash,
          role: 'Treasurer',
          phone: '+91 98451 00001',
          status: 'Active',
        },
        {
          organizationId: orgId,
          branchId: branches[0]._id,
          name: 'Suresh Bhat',
          email: 'secretary.suresh@sahakara.coop',
          password: defaultPasswordHash,
          role: 'Secretary',
          phone: '+91 98451 00002',
          status: 'Active',
        },
        {
          organizationId: orgId,
          branchId: branches[1]._id,
          name: 'Ananya Deshmukh',
          email: 'accountant.ananya@sahakara.coop',
          password: defaultPasswordHash,
          role: 'Branch Manager',
          phone: '+91 98451 00003',
          status: 'Active',
        },
        {
          organizationId: orgId,
          branchId: branches[2]._id,
          name: 'Pooja Hegde',
          email: 'cashier.pooja@sahakara.coop',
          password: defaultPasswordHash,
          role: 'Employee',
          phone: '+91 98451 00004',
          status: 'Active',
        },
      ];
      for (const u of newStaffUsers) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
          await User.create(u);
        }
      }
      users = await User.find({ organizationId: orgId });
    }
    const staffUser = users[0];
    console.log(`[Users Available]: ${users.length} users ready.`);

    // 4. Ensure Members exist
    let members = await Member.find({ organizationId: orgId });
    if (members.length < 15) {
      console.log('Seeding additional cooperative society members...');
      const sampleMemberNames = [
        'Basavaraj Gowda', 'Mallikarjun Patil', 'Laxmi Devi', 'Manjunath Swamy',
        'Shivakumar Reddy', 'Shubha Rao', 'Narasimha Murthy', 'Channamma Hiremath',
        'Devendrappa Pujar', 'Kavitha Nayak', 'Ranganath Shetty', 'Padmavathi K',
        'Girijamma S', 'Ashok Kumar', 'Veeresh Angadi', 'Renuka Prasad'
      ];
      
      const newMembersData = sampleMemberNames.map((name, idx) => {
        const branch = branches[idx % branches.length];
        return {
          organizationId: orgId,
          branchId: branch._id,
          memberId: `MEM-${1000 + idx + members.length}`,
          fullName: name,
          email: `member.${name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
          phone: `+91 98440 ${String(10000 + idx).slice(0, 5)}`,
          status: 'Active',
          kycStatus: 'Verified',
          shareCount: 10 + (idx * 5),
          shareValue: (10 + (idx * 5)) * 100,
          joiningDate: new Date(2025, (idx % 12), (idx % 25) + 1),
          address: `House #${idx + 10}, Village Cross Road`,
          district: branch.district || 'Bengaluru Rural',
          state: branch.state || 'Karnataka',
          pincode: '561203',
        };
      });

      for (const m of newMembersData) {
        const exists = await Member.findOne({ organizationId: orgId, memberId: m.memberId });
        if (!exists) {
          await Member.create(m);
        }
      }
      members = await Member.find({ organizationId: orgId });
    }
    console.log(`[Members Available]: ${members.length} members ready.`);

    // 5. Ensure Savings Accounts exist
    let savingsAccounts = await SavingsAccount.find({ organizationId: orgId });
    if (savingsAccounts.length < members.length) {
      console.log('Seeding savings accounts for members...');
      for (let i = 0; i < members.length; i++) {
        const mem = members[i];
        const exists = await SavingsAccount.findOne({ organizationId: orgId, memberId: mem._id });
        if (!exists) {
          await SavingsAccount.create({
            organizationId: orgId,
            branchId: mem.branchId || branches[0]._id,
            memberId: mem._id,
            accountNumber: `SAV-${mem.memberId || '1000' + i}`,
            accountType: 'Regular Savings',
            balance: 5000 + (i * 1250),
            status: 'Active',
            interestRate: 4.5,
            openedDate: mem.joiningDate || new Date(),
            createdBy: staffUser._id,
          });
        }
      }
      savingsAccounts = await SavingsAccount.find({ organizationId: orgId });
    }
    console.log(`[Savings Accounts Available]: ${savingsAccounts.length} savings accounts ready.`);

    // 6. Ensure Comprehensive Chart of Accounts exists
    console.log('Setting up Chart of Accounts...');
    const chartDefinitions = [
      { code: '1000', name: 'Cash on Hand (Vault / Drawer)', type: 'Asset', normalBalance: 'Debit' },
      { code: '1100', name: 'Bank Current Account - SBI Main', type: 'Asset', normalBalance: 'Debit' },
      { code: '1110', name: 'Bank Savings Account - Canara Bank', type: 'Asset', normalBalance: 'Debit' },
      { code: '1200', name: 'Member Crop Loan Receivable', type: 'Asset', normalBalance: 'Debit' },
      { code: '1210', name: 'Member Personal & Gold Loan Receivable', type: 'Asset', normalBalance: 'Debit' },
      { code: '1220', name: 'SHG / JLG Group Loan Receivable', type: 'Asset', normalBalance: 'Debit' },
      { code: '1300', name: 'Office Furniture & Computers', type: 'Asset', normalBalance: 'Debit' },
      { code: '2000', name: 'Member Regular Savings Deposit Payable', type: 'Liability', normalBalance: 'Credit' },
      { code: '2010', name: 'Member Fixed & Recurring Term Deposits', type: 'Liability', normalBalance: 'Credit' },
      { code: '2100', name: 'Compulsory Member Thrift Fund', type: 'Liability', normalBalance: 'Credit' },
      { code: '2200', name: 'Member Share Capital Pool', type: 'Liability', normalBalance: 'Credit' },
      { code: '3000', name: 'Statutory Reserve Fund', type: 'Equity', normalBalance: 'Credit' },
      { code: '3100', name: 'Undistributed Retained Surplus', type: 'Equity', normalBalance: 'Credit' },
      { code: '4000', name: 'Interest Income on Crop & Agri Loans', type: 'Income', normalBalance: 'Credit' },
      { code: '4010', name: 'Interest Income on Personal & Gold Loans', type: 'Income', normalBalance: 'Credit' },
      { code: '4100', name: 'Loan Processing & Documentation Fees', type: 'Income', normalBalance: 'Credit' },
      { code: '4110', name: 'Member Admission & Share Fees', type: 'Income', normalBalance: 'Credit' },
      { code: '4200', name: 'Penalties & Late Payment Surcharges', type: 'Income', normalBalance: 'Credit' },
      { code: '5000', name: 'Staff Salaries, Wages & Allowances', type: 'Expense', normalBalance: 'Debit' },
      { code: '5100', name: 'Branch Office Rent & Municipal Taxes', type: 'Expense', normalBalance: 'Debit' },
      { code: '5200', name: 'Electricity & Internet Broadband Utilities', type: 'Expense', normalBalance: 'Debit' },
      { code: '5300', name: 'Printing, Stationery & Member Passbooks', type: 'Expense', normalBalance: 'Debit' },
      { code: '5400', name: 'Annual Statutory Audit & Legal Fees', type: 'Expense', normalBalance: 'Debit' },
      { code: '5500', name: 'Interest Paid to Member Savings Accounts', type: 'Expense', normalBalance: 'Debit' },
      { code: '5600', name: 'Bank Service Charges & SMS Gateway Fees', type: 'Expense', normalBalance: 'Debit' },
    ];

    for (const c of chartDefinitions) {
      await ChartOfAccount.findOneAndUpdate(
        { organizationId: orgId, accountCode: c.code },
        {
          organizationId: orgId,
          accountCode: c.code,
          accountName: c.name,
          accountType: c.type,
          normalBalance: c.normalBalance,
          status: 'Active',
          createdBy: staffUser._id,
        },
        { upsert: true, new: true }
      );
    }

    const coaList = await ChartOfAccount.find({ organizationId: orgId });
    const coaMap = {};
    coaList.forEach(acc => {
      coaMap[acc.accountCode] = acc;
    });
    console.log(`[Chart of Accounts Ready]: ${coaList.length} accounts configured.`);

    // 7. Clear old generated sample journal lines & financial transactions if any to avoid duplication
    console.log('Generating 100+ fully-balanced double-entry journal records...');
    
    // We will generate 105 distinct, realistic transactions spread over the past 180 days
    const totalRecordsToGenerate = 105;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const journalEntriesToInsert = [];
    const journalLinesToInsert = [];
    const financialTxnsToInsert = [];

    // Transaction patterns
    const transactionTemplates = [
      {
        type: 'SavingsDeposit',
        sourceModule: 'Savings',
        txType: 'Inflow',
        desc: (m) => `Member cash savings deposit received from ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '1000', debit: amt, credit: 0, desc: 'Cash receipt at counter' },
          { accCode: '2000', debit: 0, credit: amt, desc: 'Member regular savings credited' },
        ],
        amountRange: [500, 15000],
        paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
      },
      {
        type: 'SavingsDepositBank',
        sourceModule: 'Savings',
        txType: 'Inflow',
        desc: (m) => `Direct bank transfer savings deposit from ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '1100', debit: amt, credit: 0, desc: 'Bank NEFT/RTGS deposit' },
          { accCode: '2000', debit: 0, credit: amt, desc: 'Member savings credited' },
        ],
        amountRange: [2000, 35000],
        paymentMethods: ['Bank Transfer', 'UPI'],
      },
      {
        type: 'SavingsWithdrawal',
        sourceModule: 'Savings',
        txType: 'Outflow',
        desc: (m) => `Cash withdrawal processed for member ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '2000', debit: amt, credit: 0, desc: 'Member savings account debited' },
          { accCode: '1000', debit: 0, credit: amt, desc: 'Cash paid out to member' },
        ],
        amountRange: [500, 10000],
        paymentMethods: ['Cash'],
      },
      {
        type: 'LoanRepayment',
        sourceModule: 'Repayment',
        txType: 'Inflow',
        desc: (m) => `Monthly EMI repayment (Principal + Interest) received from ${m.fullName}`,
        getLines: (amt) => {
          const interestPortion = Math.round(amt * 0.18);
          const principalPortion = amt - interestPortion;
          return [
            { accCode: '1000', debit: amt, credit: 0, desc: 'Cash collected for EMI' },
            { accCode: '1200', debit: 0, credit: principalPortion, desc: 'Loan principal balance reduced' },
            { accCode: '4000', debit: 0, credit: interestPortion, desc: 'Interest income on crop loan' },
          ];
        },
        amountRange: [3000, 25000],
        paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
      },
      {
        type: 'GoldLoanRepayment',
        sourceModule: 'Repayment',
        txType: 'Inflow',
        desc: (m) => `Gold loan installment and interest receipt from ${m.fullName}`,
        getLines: (amt) => {
          const interestPortion = Math.round(amt * 0.20);
          const principalPortion = amt - interestPortion;
          return [
            { accCode: '1100', debit: amt, credit: 0, desc: 'Bank receipt for gold loan repayment' },
            { accCode: '1210', debit: 0, credit: principalPortion, desc: 'Gold loan principal reduced' },
            { accCode: '4010', debit: 0, credit: interestPortion, desc: 'Interest income on gold loan' },
          ];
        },
        amountRange: [5000, 40000],
        paymentMethods: ['Bank Transfer', 'UPI'],
      },
      {
        type: 'LoanDisbursement',
        sourceModule: 'Loan',
        txType: 'Outflow',
        desc: (m) => `Agriculture crop loan sanctioned and disbursed to ${m.fullName}`,
        getLines: (amt) => {
          const processingFee = Math.round(amt * 0.015);
          const netDisbursed = amt - processingFee;
          return [
            { accCode: '1200', debit: amt, credit: 0, desc: 'Loan asset created on borrower' },
            { accCode: '1100', debit: 0, credit: netDisbursed, desc: 'Direct account transfer to member' },
            { accCode: '4100', debit: 0, credit: processingFee, desc: 'Loan documentation & processing fee' },
          ];
        },
        amountRange: [25000, 150000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        type: 'MembershipAdmission',
        sourceModule: 'Income',
        txType: 'Inflow',
        desc: (m) => `New member admission fee and share capital collection for ${m.fullName}`,
        getLines: (amt) => {
          const admissionFee = 250;
          const shareCapital = amt - admissionFee;
          return [
            { accCode: '1000', debit: amt, credit: 0, desc: 'Cash collected on admission' },
            { accCode: '4110', debit: 0, credit: admissionFee, desc: 'Admission fee income' },
            { accCode: '2200', debit: 0, credit: shareCapital, desc: 'Share capital credit' },
          ];
        },
        amountRange: [1250, 5250],
        paymentMethods: ['Cash'],
      },
      {
        type: 'StaffSalaryPayment',
        sourceModule: 'Expense',
        txType: 'Outflow',
        desc: (m, u, b) => `Monthly staff payroll and allowance disbursement for ${b.name}`,
        getLines: (amt) => [
          { accCode: '5000', debit: amt, credit: 0, desc: 'Branch staff salary expense' },
          { accCode: '1100', debit: 0, credit: amt, desc: 'Bank NEFT bulk salary transfer' },
        ],
        amountRange: [22000, 48000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        type: 'BranchRentPayment',
        sourceModule: 'Expense',
        txType: 'Outflow',
        desc: (m, u, b) => `Office premises rent and property tax payment for ${b.name}`,
        getLines: (amt) => [
          { accCode: '5100', debit: amt, credit: 0, desc: 'Office rent expense' },
          { accCode: '1100', debit: 0, credit: amt, desc: 'Cheque payment to landlord' },
        ],
        amountRange: [12000, 28000],
        paymentMethods: ['Bank Transfer', 'Cheque'],
      },
      {
        type: 'UtilityBillsPayment',
        sourceModule: 'Expense',
        txType: 'Outflow',
        desc: (m, u, b) => `Electricity board bill and high-speed broadband charges for ${b.name}`,
        getLines: (amt) => [
          { accCode: '5200', debit: amt, credit: 0, desc: 'Utilities & broadband expense' },
          { accCode: '1000', debit: 0, credit: amt, desc: 'Cash paid against utility bills' },
        ],
        amountRange: [1500, 6500],
        paymentMethods: ['Cash', 'UPI'],
      },
      {
        type: 'PrintingPassbooks',
        sourceModule: 'Expense',
        txType: 'Outflow',
        desc: (m, u, b) => `Printing charges for new member passbooks, vouchers, and ledgers`,
        getLines: (amt) => [
          { accCode: '5300', debit: amt, credit: 0, desc: 'Printing & stationery expense' },
          { accCode: '1000', debit: 0, credit: amt, desc: 'Cash paid to local press' },
        ],
        amountRange: [800, 4500],
        paymentMethods: ['Cash'],
      },
      {
        type: 'InterestCreditedToSavings',
        sourceModule: 'Expense',
        txType: 'Adjustment',
        desc: (m) => `Quarterly savings interest posted to member ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '5500', debit: amt, credit: 0, desc: 'Savings interest expense' },
          { accCode: '2000', debit: 0, credit: amt, desc: 'Member savings balance incremented' },
        ],
        amountRange: [250, 3200],
        paymentMethods: ['System'],
      },
      {
        type: 'ThriftFundCollection',
        sourceModule: 'Savings',
        txType: 'Inflow',
        desc: (m) => `Monthly compulsory thrift fund deposit collected from ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '1000', debit: amt, credit: 0, desc: 'Cash received at branch' },
          { accCode: '2100', debit: 0, credit: amt, desc: 'Compulsory thrift fund credited' },
        ],
        amountRange: [200, 1000],
        paymentMethods: ['Cash', 'UPI'],
      },
      {
        type: 'AuditFeePayment',
        sourceModule: 'Expense',
        txType: 'Outflow',
        desc: (m, u, b) => `Professional fee paid to Chartered Accountant for half-yearly audit`,
        getLines: (amt) => [
          { accCode: '5400', debit: amt, credit: 0, desc: 'Statutory audit professional fee' },
          { accCode: '1100', debit: 0, credit: amt, desc: 'Bank transfer to CA auditor firm' },
        ],
        amountRange: [15000, 35000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        type: 'LatePenaltyFee',
        sourceModule: 'Income',
        txType: 'Inflow',
        desc: (m) => `Overdue installment penalty fee collected from ${m.fullName}`,
        getLines: (amt) => [
          { accCode: '1000', debit: amt, credit: 0, desc: 'Cash collected at desk' },
          { accCode: '4200', debit: 0, credit: amt, desc: 'Penalty fee income' },
        ],
        amountRange: [100, 750],
        paymentMethods: ['Cash'],
      },
    ];

    for (let i = 0; i < totalRecordsToGenerate; i++) {
      const template = transactionTemplates[i % transactionTemplates.length];
      const member = members[i % members.length];
      const branch = branches[i % branches.length];
      const user = users[i % users.length];

      // Random amount within specified range
      const [minAmt, maxAmt] = template.amountRange;
      const rawAmt = Math.floor(minAmt + Math.random() * (maxAmt - minAmt));
      const amount = Math.round(rawAmt / 50) * 50; // rounded nicely

      // Entry timestamp spread across past 180 days
      const daysAgo = Math.floor((totalRecordsToGenerate - i) * (170 / totalRecordsToGenerate));
      const entryDate = new Date(now - daysAgo * oneDay - Math.floor(Math.random() * 3600000 * 8));

      const entryNumber = `JE-2025-${String(1000 + i + 1).padStart(4, '0')}`;
      const description = template.desc(member, user, branch);
      const paymentMethod = template.paymentMethods[i % template.paymentMethods.length];

      const journalEntryId = new mongoose.Types.ObjectId();
      const financialTxnId = new mongoose.Types.ObjectId();
      const transactionRefId = `TXN-${entryDate.getFullYear()}${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(10000 + i + 1)}`;

      // Build Journal Entry Doc
      const journalEntryDoc = {
        _id: journalEntryId,
        organizationId: orgId,
        branchId: branch._id,
        entryNumber,
        entryDate,
        description,
        referenceType: template.sourceModule === 'Savings' ? 'SavingsDeposit' :
                       template.sourceModule === 'Loan' ? 'LoanDisbursement' :
                       template.sourceModule === 'Repayment' ? 'LoanRepayment' :
                       template.sourceModule === 'Income' ? 'ManualIncome' : 'ManualExpense',
        referenceId: transactionRefId,
        status: 'Posted',
        createdBy: user._id,
        createdAt: entryDate,
        updatedAt: entryDate,
      };
      journalEntriesToInsert.push(journalEntryDoc);

      // Build Journal Lines
      const lines = template.getLines(amount);
      let lineTotalDebit = 0;
      let lineTotalCredit = 0;

      lines.forEach((line) => {
        const coa = coaMap[line.accCode];
        if (!coa) {
          throw new Error(`Missing COA for code: ${line.accCode}`);
        }
        lineTotalDebit += line.debit;
        lineTotalCredit += line.credit;

        journalLinesToInsert.push({
          journalEntryId: journalEntryId,
          organizationId: orgId,
          accountId: coa._id,
          debit: line.debit,
          credit: line.credit,
          description: line.desc || description,
          createdAt: entryDate,
          updatedAt: entryDate,
        });
      });

      // Verify double-entry balancing
      if (Math.abs(lineTotalDebit - lineTotalCredit) > 0.001) {
        throw new Error(`Unbalanced entry generated at index ${i}: Debit=${lineTotalDebit}, Credit=${lineTotalCredit}`);
      }

      // Build Financial Transaction Doc
      financialTxnsToInsert.push({
        _id: financialTxnId,
        organizationId: orgId,
        branchId: branch._id,
        transactionId: transactionRefId,
        sourceModule: template.sourceModule,
        sourceId: journalEntryId, // Relational link
        memberId: member._id,
        journalEntryId: journalEntryId,
        transactionType: template.txType,
        amount: amount,
        paymentMethod: paymentMethod,
        status: 'Completed',
        transactionDate: entryDate,
        description: description,
        createdAt: entryDate,
        updatedAt: entryDate,
      });
    }

    console.log(`Inserting ${journalEntriesToInsert.length} Journal Entries...`);
    await JournalEntry.insertMany(journalEntriesToInsert);

    console.log(`Inserting ${journalLinesToInsert.length} Double-Entry Journal Lines...`);
    await JournalLine.insertMany(journalLinesToInsert);

    console.log(`Inserting ${financialTxnsToInsert.length} Financial Transactions...`);
    await FinancialTransaction.insertMany(financialTxnsToInsert);

    console.log('====================================================');
    console.log(`✅ SUCCESS: Seeded ${journalEntriesToInsert.length} Journal Entries, ${journalLinesToInsert.length} Journal Lines, and ${financialTxnsToInsert.length} Financial Transactions!`);
    console.log(' All relations (Organization, Branch, Member, User, Accounts) verified & balanced!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedAccounting100();
