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
const LoanRepaymentSchedule = require('../models/LoanRepaymentSchedule');
const LoanRepaymentTransaction = require('../models/LoanRepaymentTransaction');
const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const FinancialTransaction = require('../models/FinancialTransaction');

const seedKeralaUnityRealtimeData = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://Rohini:Rohini%402004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';

    console.log('================================================================');
    console.log(' SEEDING REAL-TIME DATA FOR: Kerala Unity Employees Co-op Society');
    console.log('================================================================');
    await mongoose.connect(mongoUri);
    console.log('[MongoDB Connected]');

    // 1. Find or create Organization
    let kuecs = await Organization.findOne({
      $or: [
        { code: 'KUECS' },
        { name: /Kerala Unity/i },
        { _id: new mongoose.Types.ObjectId('65a000000000000000000001') }
      ]
    });

    if (!kuecs) {
      console.log('Creating Kerala Unity Employees Cooperative Society...');
      kuecs = await Organization.create({
        _id: new mongoose.Types.ObjectId('65a000000000000000000001'),
        name: 'Kerala Unity Employees Cooperative Society',
        code: 'KUECS',
        registrationNumber: 'K-689/COOP/KTM',
        societyType: 'Employees Cooperative Credit Society',
        email: 'info@keralaunity.example.com',
        phone: '+91 481 2567890',
        state: 'Kerala',
        district: 'Kottayam',
        address: 'KUECS Head Office Bhavan, Baker Junction, Kottayam - 686001',
        status: 'Active',
      });
    }

    const orgId = kuecs._id;
    console.log(`[Organization]: ${kuecs.name} (ID: ${orgId}, Code: ${kuecs.code})`);

    // 2. Setup Operational Branches in Kerala
    const branchConfigs = [
      {
        branchCode: 'KTM01',
        branchName: 'Kottayam Main Branch',
        address: 'KUECS Bhavan, Baker Junction, Kottayam',
        district: 'Kottayam',
        state: 'Kerala',
        phone: '+91 481 200001',
        email: 'kottayam@keralaunity.example.com',
        status: 'Active',
      },
      {
        branchCode: 'CGY01',
        branchName: 'Changanassery Branch',
        address: 'Perunna Junction, MC Road, Changanassery',
        district: 'Kottayam',
        state: 'Kerala',
        phone: '+91 481 200002',
        email: 'changanassery@keralaunity.example.com',
        status: 'Active',
      },
      {
        branchCode: 'PLA01',
        branchName: 'Pala Town Branch',
        address: 'Main Commercial Complex, Kizhathadiyoor, Pala',
        district: 'Kottayam',
        state: 'Kerala',
        phone: '+91 482 200003',
        email: 'pala@keralaunity.example.com',
        status: 'Active',
      },
      {
        branchCode: 'KPY01',
        branchName: 'Kanjirappally Branch',
        address: 'NH-183 Main Road, Near Bus Stand, Kanjirappally',
        district: 'Kottayam',
        state: 'Kerala',
        phone: '+91 482 200004',
        email: 'kanjirappally@keralaunity.example.com',
        status: 'Active',
      },
    ];

    const branches = [];
    for (const b of branchConfigs) {
      let br = await Branch.findOne({ organizationId: orgId, branchCode: b.branchCode });
      if (!br) {
        br = await Branch.create({
          organizationId: orgId,
          ...b,
        });
      }
      branches.push(br);
    }
    console.log(`[Branches]: ${branches.length} active branches ready across Kottayam district.`);

    // 3. Setup Executive & Staff Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    const staffConfigs = [
      {
        name: 'Kerala Unity Admin',
        username: 'admin.kuecs',
        email: 'admin@keralaunity.example.com',
        role: 'Organization Admin',
        phone: '+91 94470 00001',
        branchId: branches[0]._id,
      },
      {
        name: 'Rajeev Menon',
        username: 'president.kuecs',
        email: 'president@keralaunity.example.com',
        role: 'President',
        phone: '+91 94470 00002',
        branchId: branches[0]._id,
      },
      {
        name: 'Geetha Nair',
        username: 'secretary.kuecs',
        email: 'secretary@keralaunity.example.com',
        role: 'Secretary',
        phone: '+91 94470 00003',
        branchId: branches[0]._id,
      },
      {
        name: 'Mohammed Ali',
        username: 'treasurer.kuecs',
        email: 'treasurer@keralaunity.example.com',
        role: 'Treasurer',
        phone: '+91 94470 00004',
        branchId: branches[0]._id,
      },
      {
        name: 'Anil Kumar',
        username: 'manager.ktm',
        email: 'manager.ktm@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00005',
        branchId: branches[0]._id,
      },
      {
        name: 'Deepa Kurian',
        username: 'manager.cgy',
        email: 'manager.cgy@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00006',
        branchId: branches[1]._id,
      },
      {
        name: 'Mathew Joseph',
        username: 'manager.pla',
        email: 'manager.pla@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00007',
        branchId: branches[2]._id,
      },
      {
        name: 'Vinod Sreedharan',
        username: 'manager.kpy',
        email: 'manager.kpy@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00008',
        branchId: branches[3]._id,
      },
      {
        name: 'Priya Thomas',
        username: 'teller.ktm',
        email: 'teller.ktm@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00009',
        branchId: branches[0]._id,
      },
      {
        name: 'Sanjay Balakrishnan',
        username: 'teller.cgy',
        email: 'teller.cgy@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00010',
        branchId: branches[1]._id,
      },
      {
        name: 'Lekshmi G Nair',
        username: 'teller.pla',
        email: 'teller.pla@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00011',
        branchId: branches[2]._id,
      },
      {
        name: 'Arun Das K',
        username: 'teller.kpy',
        email: 'teller.kpy@keralaunity.example.com',
        role: 'Employee',
        phone: '+91 94470 00012',
        branchId: branches[3]._id,
      },
    ];

    const staffUsers = [];
    for (const sc of staffConfigs) {
      let u = await User.findOne({ email: sc.email });
      if (!u) {
        u = await User.create({
          organizationId: orgId,
          branchId: sc.branchId,
          name: sc.name,
          username: sc.username,
          email: sc.email,
          password: passwordHash,
          role: sc.role,
          phone: sc.phone,
          status: 'Active',
        });
      }
      staffUsers.push(u);
    }
    console.log(`[Staff Users]: ${staffUsers.length} staff & executive accounts ready.`);

    const primaryAdmin = staffUsers[0];
    const tellerUser = staffUsers[8]; // Priya Thomas

    // 4. Setup Loan Types for Kerala Unity
    const loanTypeConfigs = [
      {
        name: 'Festival Advance Loan (Onam / Christmas)',
        description: 'Special seasonal advance for state and public sector employees',
        interestRate: 8.5,
        minimumAmount: 10000,
        maximumAmount: 60000,
        maximumTenure: 12,
      },
      {
        name: 'Employee Salary Advance Loan',
        description: 'Short-term immediate credit against monthly salary deduction',
        interestRate: 10.0,
        minimumAmount: 25000,
        maximumAmount: 150000,
        maximumTenure: 24,
      },
      {
        name: 'Consumer Durable & Vehicle Loan',
        description: 'Financing two-wheelers, home appliances, and solar installations',
        interestRate: 11.0,
        minimumAmount: 50000,
        maximumAmount: 350000,
        maximumTenure: 36,
      },
      {
        name: 'Higher Education Assistance Loan',
        description: 'Low-interest education support for wards of employee members',
        interestRate: 7.5,
        minimumAmount: 50000,
        maximumAmount: 500000,
        maximumTenure: 60,
      },
      {
        name: 'Housing Repair & Renovation Loan',
        description: 'Home improvement loan for government/co-op employee members',
        interestRate: 9.0,
        minimumAmount: 100000,
        maximumAmount: 800000,
        maximumTenure: 84,
      },
      {
        name: 'Gold Mortgage Loan',
        description: 'Instant credit against 22K hallmarked gold ornaments',
        interestRate: 9.5,
        minimumAmount: 15000,
        maximumAmount: 300000,
        maximumTenure: 12,
      },
    ];

    const loanTypes = [];
    for (const lt of loanTypeConfigs) {
      let ltype = await LoanType.findOne({ organizationId: orgId, name: lt.name });
      if (!ltype) {
        ltype = await LoanType.create({
          organizationId: orgId,
          name: lt.name,
          description: lt.description,
          interestRate: lt.interestRate,
          minimumAmount: lt.minimumAmount,
          maximumAmount: lt.maximumAmount,
          maximumTenure: lt.maximumTenure,
          status: 'Active',
          createdBy: primaryAdmin._id,
        });
      }
      loanTypes.push(ltype);
    }
    console.log(`[Loan Types]: ${loanTypes.length} employee loan products configured.`);

    // 5. Setup Kerala Employees Members (30 Real Personas)
    const keralaMemberProfiles = [
      { name: 'Sunil Varghese', empNo: 'EMP-KTM-101', desig: 'High School Teacher (HST Maths)', dept: 'General Education Dept', gender: 'Male', phone: '+91 94461 10001' },
      { name: 'Radhakrishnan Nair', empNo: 'EMP-KTM-102', desig: 'Senior Superintendent', dept: 'Revenue Department', gender: 'Male', phone: '+91 94461 10002' },
      { name: 'Fatima Beevi M', empNo: 'EMP-KTM-103', desig: 'Staff Nurse Grade-I', dept: 'Health Services Kottayam', gender: 'Female', phone: '+91 94461 10003' },
      { name: 'Joby Abraham', empNo: 'EMP-KTM-104', desig: 'Assistant Engineer', dept: 'KSEB Electrical Sub-Division', gender: 'Male', phone: '+91 94461 10004' },
      { name: 'Shailaja K Kurup', empNo: 'EMP-KTM-105', desig: 'Head Clerk', dept: 'Kottayam Taluk Office', gender: 'Female', phone: '+91 94461 10005' },
      { name: 'Haridasan Namboothiri', empNo: 'EMP-KTM-106', desig: 'Gram Panchayat Secretary', dept: 'Local Self Govt Dept', gender: 'Male', phone: '+91 94461 10006' },
      { name: 'Bindu Suresh', empNo: 'EMP-KTM-107', desig: 'HSST English', dept: 'Higher Secondary Directorate', gender: 'Female', phone: '+91 94461 10007' },
      { name: 'Thomas George', empNo: 'EMP-KTM-108', desig: 'Assistant Motor Vehicle Inspector', dept: 'Motor Vehicles Dept', gender: 'Male', phone: '+91 94461 10008' },
      { name: 'Sindhu Unnikrishnan', empNo: 'EMP-KTM-109', desig: 'Pharmacist Grade-I', dept: 'Taluk Hospital Changanassery', gender: 'Female', phone: '+91 94461 10009' },
      { name: 'Abdul Rasheed K A', empNo: 'EMP-KTM-110', desig: 'Sub-Inspector of Police', dept: 'Kerala Police Kottayam', gender: 'Male', phone: '+91 94461 10010' },
      { name: 'Mini Scaria', empNo: 'EMP-KTM-111', desig: 'Principal, Govt Higher Secondary School', dept: 'Education Dept', gender: 'Female', phone: '+91 94461 10011' },
      { name: 'Gopakumar P', empNo: 'EMP-KTM-112', desig: 'Junior Superintendent', dept: 'Civil Supplies Corporation', gender: 'Male', phone: '+91 94461 10012' },
      { name: 'Devaki Amma K', empNo: 'EMP-KTM-113', desig: 'Selection Grade Typist', dept: 'Judicial Department', gender: 'Female', phone: '+91 94461 10013' },
      { name: 'Jayachandran K', empNo: 'EMP-KTM-114', desig: 'Overseer Grade-I', dept: 'Public Works Department (PWD)', gender: 'Male', phone: '+91 94461 10014' },
      { name: 'Reji Mathew', empNo: 'EMP-KTM-115', desig: 'Agricultural Officer', dept: 'Krishi Bhavan Pala', gender: 'Male', phone: '+91 94461 10015' },
      { name: 'Saramma Joseph', empNo: 'EMP-KTM-116', desig: 'Lab Technician Grade-I', dept: 'Medical College Hospital', gender: 'Female', phone: '+91 94461 10016' },
      { name: 'Vijayan Pillai B', empNo: 'EMP-KTM-117', desig: 'Senior Clerk', dept: 'Treasury Department', gender: 'Male', phone: '+91 94461 10017' },
      { name: 'Kavitha Nambiar', empNo: 'EMP-KTM-118', desig: 'Village Officer', dept: 'Village Office Kanjirappally', gender: 'Female', phone: '+91 94461 10018' },
      { name: 'Jose Varghese', empNo: 'EMP-KTM-119', desig: 'Section Officer', dept: 'MG University Kottayam', gender: 'Male', phone: '+91 94461 10019' },
      { name: 'Parvathi Warrier', empNo: 'EMP-KTM-120', desig: 'Assistant Professor', dept: 'Govt College Kottayam', gender: 'Female', phone: '+91 94461 10020' },
      { name: 'Anoop Chandran', empNo: 'EMP-KTM-121', desig: 'Driver Selection Grade', dept: 'KSRTC Kottayam Depot', gender: 'Male', phone: '+91 94461 10021' },
      { name: 'Sujatha K Nair', empNo: 'EMP-KTM-122', desig: 'Anganwadi Supervisor', dept: 'Women & Child Development', gender: 'Female', phone: '+91 94461 10022' },
      { name: 'Murali Dharan P', empNo: 'EMP-KTM-123', desig: 'Forest Range Officer', dept: 'Forest & Wildlife Dept', gender: 'Male', phone: '+91 94461 10023' },
      { name: 'Nisha Baby', empNo: 'EMP-KTM-124', desig: 'Assistant Town Planner', dept: 'Town Planning Dept', gender: 'Female', phone: '+91 94461 10024' },
      { name: 'Rajesh Kumar K', empNo: 'EMP-KTM-125', desig: 'Sanitary Inspector', dept: 'Kottayam Municipality', gender: 'Male', phone: '+91 94461 10025' },
      { name: 'Santhosh Varghese', empNo: 'EMP-KTM-126', desig: 'Lineman Grade-I', dept: 'KSEB Changanassery', gender: 'Male', phone: '+91 94461 10026' },
      { name: 'Preetha Ramesh', empNo: 'EMP-KTM-127', desig: 'Junior Public Health Nurse', dept: 'Primary Health Centre', gender: 'Female', phone: '+91 94461 10027' },
      { name: 'Manoj Kurup', empNo: 'EMP-KTM-128', desig: 'Auditor', dept: 'Cooperative Audit Dept', gender: 'Male', phone: '+91 94461 10028' },
      { name: 'Gracy Varghese', empNo: 'EMP-KTM-129', desig: 'Headmistress', dept: 'Govt Upper Primary School', gender: 'Female', phone: '+91 94461 10029' },
      { name: 'Binu Jacob', empNo: 'EMP-KTM-130', desig: 'Water Works Inspector', dept: 'Kerala Water Authority', gender: 'Male', phone: '+91 94461 10030' },
    ];

    const members = [];
    for (let i = 0; i < keralaMemberProfiles.length; i++) {
      const p = keralaMemberProfiles[i];
      const branch = branches[i % branches.length];
      const memberCode = `KUECS-MEM-${String(1001 + i).padStart(4, '0')}`;

      let mem = await Member.findOne({ organizationId: orgId, memberId: memberCode });
      if (!mem) {
        mem = await Member.create({
          organizationId: orgId,
          branchId: branch._id,
          memberId: memberCode,
          fullName: p.name,
          gender: p.gender,
          phone: p.phone,
          email: `${p.name.toLowerCase().replace(/[^a-z]/g, '')}.kuecs@gmail.com`,
          occupation: `${p.desig} (${p.dept})`,
          address: `Quarter #${i + 12}, Govt Servants Colony, ${branch.district}`,
          district: branch.district,
          state: branch.state,
          pincode: '686001',
          status: 'Active',
          kycStatus: 'Verified',
          shareCount: 20 + (i * 2),
          shareValue: (20 + (i * 2)) * 100, // Rs. 100 per share
          joiningDate: new Date(2024, (i % 12), (i % 26) + 1),
        });
      }
      members.push(mem);
    }
    console.log(`[Members]: ${members.length} verified employee society members seeded.`);

    // 6. Setup Savings Accounts for Members
    const savingsAccounts = [];
    for (let i = 0; i < members.length; i++) {
      const mem = members[i];
      const accNum = `SB-KUECS-${String(1001 + i).padStart(4, '0')}`;

      let sa = await SavingsAccount.findOne({ organizationId: orgId, memberId: mem._id });
      if (!sa) {
        sa = await SavingsAccount.create({
          organizationId: orgId,
          branchId: mem.branchId,
          memberId: mem._id,
          accountNumber: accNum,
          accountType: 'Regular Savings',
          balance: 12000 + (i * 1850),
          status: 'Active',
          interestRate: 4.5,
          openedDate: mem.joiningDate || new Date(2024, 0, 15),
          createdBy: tellerUser._id,
        });
      }
      savingsAccounts.push(sa);
    }
    console.log(`[Savings Accounts]: ${savingsAccounts.length} savings accounts active with running balances.`);

    // 7. Setup Active Disbursed Loans & EMI Schedules
    const activeLoans = [];
    for (let i = 0; i < 15; i++) {
      const mem = members[i];
      const lType = loanTypes[i % loanTypes.length];
      const loanAppId = `LN-KUECS-2025-${String(501 + i).padStart(3, '0')}`;

      const principal = [35000, 50000, 80000, 120000, 200000, 45000][i % 6];
      const tenureMonths = [12, 18, 24, 36, 12, 10][i % 6];
      const rate = lType.interestRate;

      let loan = await Loan.findOne({ organizationId: orgId, applicationId: loanAppId });
      if (!loan) {
        const appDate = new Date(Date.now() - (90 + i * 2) * 24 * 60 * 60 * 1000);
        const apprDate = new Date(appDate.getTime() + 3 * 24 * 60 * 60 * 1000);

        loan = await Loan.create({
          organizationId: orgId,
          branchId: mem.branchId,
          memberId: mem._id,
          loanTypeId: lType._id,
          applicationId: loanAppId,
          requestedAmount: principal,
          approvedAmount: principal,
          disbursedAmount: principal,
          outstandingAmount: Math.round(principal * 0.72),
          interestRate: rate,
          tenure: tenureMonths,
          purpose: lType.name,
          status: 'Active',
          applicationDate: appDate,
          approvalDate: apprDate,
          approvedBy: staffUsers[1]._id, // President Rajeev Menon
          createdBy: tellerUser._id,
        });

        // Create sample EMI schedule items
        const monthlyPrincipal = Math.round(principal / tenureMonths);
        const monthlyInterest = Math.round((principal * (rate / 100)) / 12);
        const emiAmt = monthlyPrincipal + monthlyInterest;

        for (let emiNo = 1; emiNo <= Math.min(tenureMonths, 6); emiNo++) {
          const emiDueDate = new Date(apprDate.getTime() + emiNo * 30 * 24 * 60 * 60 * 1000);
          const isPaid = emiNo <= 3;
          await LoanRepaymentSchedule.create({
            organizationId: orgId,
            branchId: mem.branchId,
            loanId: loan._id,
            memberId: mem._id,
            emiNumber: emiNo,
            dueDate: emiDueDate,
            principalAmount: monthlyPrincipal,
            interestAmount: monthlyInterest,
            emiAmount: emiAmt,
            paidAmount: isPaid ? emiAmt : 0,
            remainingAmount: isPaid ? 0 : emiAmt,
            status: isPaid ? 'Paid' : 'Upcoming',
            paidDate: isPaid ? emiDueDate : null,
          });
        }
      }
      activeLoans.push(loan);
    }
    console.log(`[Loans]: ${activeLoans.length} active employee loans seeded with repayment schedules.`);

    // 8. Setup Comprehensive Chart of Accounts for Kerala Unity
    const keralaCOADefinitions = [
      { code: '1000', name: 'Cash on Hand (Vault / Branch Tellers)', type: 'Asset', normalBalance: 'Debit' },
      { code: '1100', name: 'SBI Current Account - Baker Junction Branch', type: 'Asset', normalBalance: 'Debit' },
      { code: '1110', name: 'Federal Bank Treasury A/c - Kottayam Main', type: 'Asset', normalBalance: 'Debit' },
      { code: '1200', name: 'Staff Festival Advance Loan Outstanding', type: 'Asset', normalBalance: 'Debit' },
      { code: '1210', name: 'Staff Personal & Salary Advance Receivable', type: 'Asset', normalBalance: 'Debit' },
      { code: '1220', name: 'Gold Mortgage Loan Portfolio', type: 'Asset', normalBalance: 'Debit' },
      { code: '1230', name: 'Vehicle & Consumer Loan Receivable', type: 'Asset', normalBalance: 'Debit' },
      { code: '1300', name: 'Society Bhavan Office Assets & IT Infrastructure', type: 'Asset', normalBalance: 'Debit' },
      { code: '2000', name: 'Member Regular Savings Deposit Liability', type: 'Liability', normalBalance: 'Credit' },
      { code: '2010', name: 'Member Fixed & Monthly Recurring Deposits', type: 'Liability', normalBalance: 'Credit' },
      { code: '2100', name: 'Compulsory Monthly Thrift Fund Pool', type: 'Liability', normalBalance: 'Credit' },
      { code: '2200', name: 'Member Paid-Up Share Capital Reserve', type: 'Liability', normalBalance: 'Credit' },
      { code: '3000', name: 'Statutory Reserve Fund (Kerala Co-op Societies Act)', type: 'Equity', normalBalance: 'Credit' },
      { code: '3100', name: 'Undistributed Operational Surplus', type: 'Equity', normalBalance: 'Credit' },
      { code: '4000', name: 'Interest Income from Staff Advance Loans', type: 'Income', normalBalance: 'Credit' },
      { code: '4010', name: 'Interest Income on Gold Mortgage Loans', type: 'Income', normalBalance: 'Credit' },
      { code: '4100', name: 'Loan Documentation & File Processing Fees', type: 'Income', normalBalance: 'Credit' },
      { code: '4110', name: 'New Membership Entrance & Share Transfer Fees', type: 'Income', normalBalance: 'Credit' },
      { code: '4200', name: 'Late Payment Penalties & Notice Surcharges', type: 'Income', normalBalance: 'Credit' },
      { code: '5000', name: 'Society Staff Salaries, DA & Allowances', type: 'Expense', normalBalance: 'Debit' },
      { code: '5100', name: 'Branch Office Rent & Municipal Building Tax', type: 'Expense', normalBalance: 'Debit' },
      { code: '5200', name: 'KSEB Electricity Bills & BSNL Fiber Broadband', type: 'Expense', normalBalance: 'Debit' },
      { code: '5300', name: 'Printing Passbooks, Share Certificates & Stationery', type: 'Expense', normalBalance: 'Debit' },
      { code: '5400', name: 'Kerala Cooperative Department Statutory Audit Fees', type: 'Expense', normalBalance: 'Debit' },
      { code: '5500', name: 'Interest Paid to Member SB & Recurring Deposits', type: 'Expense', normalBalance: 'Debit' },
      { code: '5600', name: 'Bank NEFT/RTGS Charges & SMS Alert Costs', type: 'Expense', normalBalance: 'Debit' },
    ];

    for (const c of keralaCOADefinitions) {
      await ChartOfAccount.findOneAndUpdate(
        { organizationId: orgId, accountCode: c.code },
        {
          organizationId: orgId,
          accountCode: c.code,
          accountName: c.name,
          accountType: c.type,
          normalBalance: c.normalBalance,
          status: 'Active',
          createdBy: primaryAdmin._id,
        },
        { upsert: true, new: true }
      );
    }

    const coaList = await ChartOfAccount.find({ organizationId: orgId });
    const coaMap = {};
    coaList.forEach((acc) => {
      coaMap[acc.accountCode] = acc;
    });
    console.log(`[Chart of Accounts]: ${coaList.length} accounts configured for Kerala Unity.`);

    // 9. Generate 110 Real-Time Double-Entry Accounting Transactions for Kerala Unity
    console.log('Generating 110 real-time double-entry transactions across Kerala Unity branches...');

    // Clear previous journal entries and lines for this organization to ensure clean data
    await JournalLine.deleteMany({ organizationId: orgId });
    await JournalEntry.deleteMany({ organizationId: orgId });
    await FinancialTransaction.deleteMany({ organizationId: orgId });
    await SavingsTransaction.deleteMany({ organizationId: orgId });

    const totalTxns = 110;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const journalEntriesToInsert = [];
    const journalLinesToInsert = [];
    const financialTxnsToInsert = [];
    const savingsTxnsToInsert = [];

    // Realistic Real-Time Transaction Templates tailored for Kerala Unity Employees Co-op Society
    const realtimeTemplates = [
      {
        category: 'Savings Deposit - Cash Counter',
        module: 'Savings',
        txType: 'Inflow',
        desc: (m, b) => `Cash SB deposit credited to ${m.fullName} at ${b.branchName}`,
        getLines: (amt) => [
          { code: '1000', debit: amt, credit: 0, desc: 'Cash received at teller desk' },
          { code: '2000', debit: 0, credit: amt, desc: 'Member SB account credited' },
        ],
        amountRange: [1500, 18000],
        paymentMethods: ['Cash'],
      },
      {
        category: 'Savings Deposit - Salary Payroll Deduction',
        module: 'Savings',
        txType: 'Inflow',
        desc: (m, b) => `Monthly payroll deduction SB credit for ${m.fullName} (${m.occupation.split('(')[0].trim()})`,
        getLines: (amt) => [
          { code: '1100', debit: amt, credit: 0, desc: 'Direct treasury/salary NEFT transfer' },
          { code: '2000', debit: 0, credit: amt, desc: 'Member SB deposit credit' },
        ],
        amountRange: [3000, 25000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'Compulsory Monthly Thrift Fund',
        module: 'Savings',
        txType: 'Inflow',
        desc: (m, b) => `Monthly thrift fund deposit subscription from ${m.fullName}`,
        getLines: (amt) => [
          { code: '1000', debit: amt, credit: 0, desc: 'Thrift fund collection' },
          { code: '2100', debit: 0, credit: amt, desc: 'Member thrift fund credited' },
        ],
        amountRange: [500, 2000],
        paymentMethods: ['Cash', 'UPI'],
      },
      {
        category: 'Savings Cash Withdrawal',
        module: 'Savings',
        txType: 'Outflow',
        desc: (m, b) => `Cash withdrawal disbursed from SB account of ${m.fullName}`,
        getLines: (amt) => [
          { code: '2000', debit: amt, credit: 0, desc: 'Member SB balance debited' },
          { code: '1000', debit: 0, credit: amt, desc: 'Cash paid out at branch counter' },
        ],
        amountRange: [2000, 15000],
        paymentMethods: ['Cash'],
      },
      {
        category: 'Festival Advance Loan EMI Recovery',
        module: 'Repayment',
        txType: 'Inflow',
        desc: (m, b) => `Onam/Festival advance installment recovered from ${m.fullName}`,
        getLines: (amt) => {
          const interest = Math.round(amt * 0.14);
          const principal = amt - interest;
          return [
            { code: '1100', debit: amt, credit: 0, desc: 'Salary check-off credit via SBI' },
            { code: '1200', debit: 0, credit: principal, desc: 'Festival loan principal reduced' },
            { code: '4000', debit: 0, credit: interest, desc: 'Interest income on festival advance' },
          ];
        },
        amountRange: [3500, 8500],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'Salary Advance Loan EMI Payment',
        module: 'Repayment',
        txType: 'Inflow',
        desc: (m, b) => `Monthly EMI payment for Salary Advance Loan from ${m.fullName}`,
        getLines: (amt) => {
          const interest = Math.round(amt * 0.18);
          const principal = amt - interest;
          return [
            { code: '1000', debit: amt, credit: 0, desc: 'EMI received at cash counter' },
            { code: '1210', debit: 0, credit: principal, desc: 'Staff loan principal recovered' },
            { code: '4000', debit: 0, credit: interest, desc: 'Interest income on staff loan' },
          ];
        },
        amountRange: [4000, 16000],
        paymentMethods: ['Cash', 'UPI'],
      },
      {
        category: 'Gold Loan Interest & Principal Repayment',
        module: 'Repayment',
        txType: 'Inflow',
        desc: (m, b) => `Gold mortgage loan closure / partial repayment received from ${m.fullName}`,
        getLines: (amt) => {
          const interest = Math.round(amt * 0.22);
          const principal = amt - interest;
          return [
            { code: '1110', debit: amt, credit: 0, desc: 'Federal bank payment for gold loan' },
            { code: '1220', debit: 0, credit: principal, desc: 'Gold loan principal reduced' },
            { code: '4010', debit: 0, credit: interest, desc: 'Interest income on gold mortgage' },
          ];
        },
        amountRange: [12000, 45000],
        paymentMethods: ['Bank Transfer', 'UPI'],
      },
      {
        category: 'Festival Advance Loan Disbursement',
        module: 'Loan',
        txType: 'Outflow',
        desc: (m, b) => `Onam festival advance loan disbursed to ${m.fullName}`,
        getLines: (amt) => {
          const docFee = 350;
          const net = amt - docFee;
          return [
            { code: '1200', debit: amt, credit: 0, desc: 'Festival loan asset created' },
            { code: '1100', debit: 0, credit: net, desc: 'SBI direct credit to member bank a/c' },
            { code: '4100', debit: 0, credit: docFee, desc: 'Loan documentation fee' },
          ];
        },
        amountRange: [25000, 50000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'Salary Advance Loan Disbursement',
        module: 'Loan',
        txType: 'Outflow',
        desc: (m, b) => `Employee salary advance sanctioned & disbursed to ${m.fullName}`,
        getLines: (amt) => {
          const docFee = 600;
          const net = amt - docFee;
          return [
            { code: '1210', debit: amt, credit: 0, desc: 'Salary advance loan asset created' },
            { code: '1100', debit: 0, credit: net, desc: 'Direct NEFT transfer to salary account' },
            { code: '4100', debit: 0, credit: docFee, desc: 'Loan file processing fee' },
          ];
        },
        amountRange: [40000, 120000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'Member Share Capital & Entrance Fee',
        module: 'Income',
        txType: 'Inflow',
        desc: (m, b) => `New membership entrance fee and 20 shares subscription for ${m.fullName}`,
        getLines: (amt) => {
          const entranceFee = 250;
          const shares = amt - entranceFee;
          return [
            { code: '1000', debit: amt, credit: 0, desc: 'Cash paid on admission' },
            { code: '4110', debit: 0, credit: entranceFee, desc: 'Entrance fee income' },
            { code: '2200', debit: 0, credit: shares, desc: 'Paid-up share capital pool' },
          ];
        },
        amountRange: [2250, 5250],
        paymentMethods: ['Cash'],
      },
      {
        category: 'Staff Monthly Salary & Allowance',
        module: 'Expense',
        txType: 'Outflow',
        desc: (m, b) => `Monthly payroll and DA disbursement for staff at ${b.branchName}`,
        getLines: (amt) => [
          { code: '5000', debit: amt, credit: 0, desc: 'Branch staff salary & DA expense' },
          { code: '1100', debit: 0, credit: amt, desc: 'SBI bulk salary disbursement' },
        ],
        amountRange: [28000, 65000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'Branch Premises Rent & Building Tax',
        module: 'Expense',
        txType: 'Outflow',
        desc: (m, b) => `Monthly commercial rent and municipal tax for ${b.branchName}`,
        getLines: (amt) => [
          { code: '5100', debit: amt, credit: 0, desc: 'Branch office premises rent' },
          { code: '1100', debit: 0, credit: amt, desc: 'SBI RTGS transfer to landlord' },
        ],
        amountRange: [14000, 26000],
        paymentMethods: ['Bank Transfer'],
      },
      {
        category: 'KSEB Electricity & BSNL Internet Utilities',
        module: 'Expense',
        txType: 'Outflow',
        desc: (m, b) => `KSEB electricity bill and high-speed BSNL Fiber charges for ${b.branchName}`,
        getLines: (amt) => [
          { code: '5200', debit: amt, credit: 0, desc: 'KSEB power & internet utilities' },
          { code: '1000', debit: 0, credit: amt, desc: 'Cash payment counter receipt' },
        ],
        amountRange: [1800, 6200],
        paymentMethods: ['Cash', 'UPI'],
      },
      {
        category: 'Printing Passbooks & Stationery',
        module: 'Expense',
        txType: 'Outflow',
        desc: (m, b) => `Printing charges for member passbooks, cash vouchers & ledger sheets`,
        getLines: (amt) => [
          { code: '5300', debit: amt, credit: 0, desc: 'Printing & stationery expense' },
          { code: '1000', debit: 0, credit: amt, desc: 'Cash paid to printing press' },
        ],
        amountRange: [1200, 4800],
        paymentMethods: ['Cash'],
      },
      {
        category: 'Quarterly Member SB Interest Posting',
        module: 'Expense',
        txType: 'Adjustment',
        desc: (m, b) => `Quarterly 4.5% annual savings interest auto-credited to ${m.fullName}`,
        getLines: (amt) => [
          { code: '5500', debit: amt, credit: 0, desc: 'Interest paid on member SB deposits' },
          { code: '2000', debit: 0, credit: amt, desc: 'Member SB balance incremented' },
        ],
        amountRange: [350, 2400],
        paymentMethods: ['System'],
      },
      {
        category: 'Late Payment Fine & Surcharge',
        module: 'Income',
        txType: 'Inflow',
        desc: (m, b) => `Late payment fine & notice fee recovered from ${m.fullName}`,
        getLines: (amt) => [
          { code: '1000', debit: amt, credit: 0, desc: 'Cash collected at counter' },
          { code: '4200', debit: 0, credit: amt, desc: 'Late payment surcharge income' },
        ],
        amountRange: [100, 600],
        paymentMethods: ['Cash'],
      },
      {
        category: 'Statutory Co-op Audit Fees',
        module: 'Expense',
        txType: 'Outflow',
        desc: (m, b) => `Half-yearly statutory audit fee paid to Joint Director of Co-op Audit Kottayam`,
        getLines: (amt) => [
          { code: '5400', debit: amt, credit: 0, desc: 'Departmental statutory audit fees' },
          { code: '1100', debit: 0, credit: amt, desc: 'Treasury challan payment via SBI' },
        ],
        amountRange: [18000, 32000],
        paymentMethods: ['Bank Transfer'],
      },
    ];

    for (let i = 0; i < totalTxns; i++) {
      const template = realtimeTemplates[i % realtimeTemplates.length];
      const member = members[i % members.length];
      const branch = branches[i % branches.length];
      const staff = staffUsers[(i % (staffUsers.length - 4)) + 4]; // Branch manager or teller

      // Dynamic realistic amount
      const [minAmt, maxAmt] = template.amountRange;
      const rawAmt = Math.floor(minAmt + Math.random() * (maxAmt - minAmt));
      const amount = Math.round(rawAmt / 50) * 50;

      // Realistic business hours timestamp across past 120 days
      const daysAgo = Math.floor((totalTxns - i) * (115 / totalTxns));
      const hour = 9 + (i % 7); // 9:00 AM - 4:00 PM
      const minute = (i * 13) % 60;
      const entryDate = new Date(now - daysAgo * oneDay);
      entryDate.setHours(hour, minute, 0, 0);

      const entryNumber = `JE-KUECS-2025-${String(1001 + i).padStart(4, '0')}`;
      const description = template.desc(member, branch);
      const paymentMethod = template.paymentMethods[i % template.paymentMethods.length];

      const journalEntryId = new mongoose.Types.ObjectId();
      const financialTxnId = new mongoose.Types.ObjectId();
      const txnRefId = `TXN-KUECS-${entryDate.getFullYear()}${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(10001 + i)}`;

      // 1. Journal Entry
      const refType = template.module === 'Savings' ? 'SavingsDeposit' :
                      template.module === 'Loan' ? 'LoanDisbursement' :
                      template.module === 'Repayment' ? 'LoanRepayment' :
                      template.module === 'Income' ? 'ManualIncome' : 'ManualExpense';

      journalEntriesToInsert.push({
        _id: journalEntryId,
        organizationId: orgId,
        branchId: branch._id,
        entryNumber,
        entryDate,
        description,
        referenceType: refType,
        referenceId: txnRefId,
        status: 'Posted',
        createdBy: staff._id,
        createdAt: entryDate,
        updatedAt: entryDate,
      });

      // 2. Journal Lines
      const lines = template.getLines(amount);
      let debitSum = 0;
      let creditSum = 0;

      lines.forEach((line) => {
        const coa = coaMap[line.code];
        if (!coa) throw new Error(`Missing COA code: ${line.code}`);
        debitSum += line.debit;
        creditSum += line.credit;

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

      if (Math.abs(debitSum - creditSum) > 0.001) {
        throw new Error(`Unbalanced entry at index ${i}`);
      }

      // 3. Financial Transaction
      financialTxnsToInsert.push({
        _id: financialTxnId,
        organizationId: orgId,
        branchId: branch._id,
        transactionId: txnRefId,
        sourceModule: template.module,
        sourceId: journalEntryId,
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

      // 4. If Savings Transaction, also save to SavingsTransaction collection for passbook
      if (template.module === 'Savings' && template.txType !== 'Adjustment' && savingsAccounts.length > 0) {
        const sa = savingsAccounts[i % savingsAccounts.length];
        const prevBal = (sa && typeof sa.balance === 'number') ? sa.balance : 15000;
        const postBal = template.txType === 'Inflow' ? prevBal + amount : Math.max(1000, prevBal - amount);

        savingsTxnsToInsert.push({
          organizationId: orgId,
          branchId: branch._id,
          savingsAccountId: sa._id,
          memberId: member._id,
          transactionId: `SAV-TXN-KUECS-${String(10001 + i)}`,
          transactionType: template.txType === 'Inflow' ? 'Deposit' : 'Withdrawal',
          amount: amount,
          paymentMethod: paymentMethod,
          referenceNumber: txnRefId,
          balanceAfterTransaction: postBal,
          transactionDate: entryDate,
          remarks: description,
          status: 'Completed',
          createdBy: staff._id,
          createdAt: entryDate,
          updatedAt: entryDate,
        });
      }
    }

    console.log(`Inserting ${journalEntriesToInsert.length} Journal Entries for Kerala Unity...`);
    await JournalEntry.insertMany(journalEntriesToInsert);

    console.log(`Inserting ${journalLinesToInsert.length} Double-Entry Journal Lines...`);
    await JournalLine.insertMany(journalLinesToInsert);

    console.log(`Inserting ${financialTxnsToInsert.length} Financial Transactions...`);
    await FinancialTransaction.insertMany(financialTxnsToInsert);

    if (savingsTxnsToInsert.length > 0) {
      console.log(`Inserting ${savingsTxnsToInsert.length} Member Passbook Savings Transactions...`);
      await SavingsTransaction.insertMany(savingsTxnsToInsert);
    }

    console.log('================================================================');
    console.log('✅ SUCCESS: Seeded 110 Real-Time Accounting Data for Kerala Unity Employees Cooperative Society!');
    console.log(` - 4 Active Branches (Kottayam Main, Changanassery, Pala, Kanjirappally)`);
    console.log(` - 12 Staff/Executive Users (President, Secretary, Treasurer, 4 Branch Managers, 4 Tellers)`);
    console.log(` - 30 Verified Kerala Employee Members (Teachers, Nurses, KSEB Engineers, Clerks)`);
    console.log(` - 30 Active Member Savings Accounts & 15 Disbursed Employee Loans with EMI schedules`);
    console.log(` - ${journalEntriesToInsert.length} Double-Entry Journal Entries (Strictly Balanced)`);
    console.log(` - ${journalLinesToInsert.length} Journal Lines linked to Kerala Unity Chart of Accounts`);
    console.log(` - ${financialTxnsToInsert.length} Financial Transactions & Member Passbook records`);
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Realtime Seeding Error:', error);
    process.exit(1);
  }
};

seedKeralaUnityRealtimeData();
