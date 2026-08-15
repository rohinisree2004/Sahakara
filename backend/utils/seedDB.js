const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Import all Mongoose Models
const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const Member = require('../models/Member');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Group = require('../models/Group');
const Inquiry = require('../models/Inquiry');
const SystemSetting = require('../models/SystemSetting');
const OrganizationSetting = require('../models/OrganizationSetting');
const AuditLog = require('../models/AuditLog');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://Rohini:Rohini%402004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';

    console.log('====================================================');
    console.log(' Connecting to Sahakara ERP MongoDB Cloud Database...');
    console.log('====================================================');
    await mongoose.connect(mongoUri);
    console.log('[MongoDB Connected]: Cloud Database Cluster Ready!');

    // 1. CLEAR EXISTING TEST DATA
    console.log('\n[1/10] Clearing existing test data across all collections...');
    await Promise.all([
      Organization.deleteMany({}),
      Branch.deleteMany({}),
      User.deleteMany({}),
      Member.deleteMany({}),
      Role.deleteMany({}),
      Permission.deleteMany({}),
      Group.deleteMany({}),
      Inquiry.deleteMany({}),
      SystemSetting.deleteMany({}),
      OrganizationSetting.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Cleared]: All collections reset successfully!');

    // Fixed ObjectIds for reference integrity
    const org1Id = new mongoose.Types.ObjectId('65e111111111111111111111');
    const org2Id = new mongoose.Types.ObjectId('65e222222222222222222222');
    const org3Id = new mongoose.Types.ObjectId('65e333333333333333333333');
    const org4Id = new mongoose.Types.ObjectId('65e444444444444444444444');
    const org5Id = new mongoose.Types.ObjectId('65e555555555555555555555');

    const branch1Id = new mongoose.Types.ObjectId('65b111111111111111111111');
    const branch2Id = new mongoose.Types.ObjectId('65b222222222222222222222');
    const branch3Id = new mongoose.Types.ObjectId('65b333333333333333333333');
    const branch4Id = new mongoose.Types.ObjectId('65b444444444444444444444');
    const branch5Id = new mongoose.Types.ObjectId('65b555555555555555555555');

    // 2. SEED ORGANIZATIONS (5 Real Cooperative Societies)
    console.log('\n[2/10] Seeding 5 Real Cooperative Societies (Organizations)...');
    const orgs = await Organization.create([
      {
        _id: org1Id,
        name: 'Vijaya Credit Cooperative Society Ltd.',
        code: 'VCS-101',
        registrationNumber: 'REG/COOP/2012/BANG-104',
        societyType: 'Credit Cooperative',
        email: 'contact@vijayacoop.org',
        phone: '+91 80 2663 8899',
        address: 'No. 42, 10th Main, 4th Block, Jayanagar',
        state: 'Karnataka',
        city: 'Bengaluru',
        pincode: '560011',
        status: 'Active',
        approvedAt: new Date(),
        rejectionRemarks: '',
      },
      {
        _id: org2Id,
        name: 'Navachetana Urban Souharda Sahakari Bank Ltd.',
        code: 'NUSS-202',
        registrationNumber: 'REG/SOUHARDA/2015/MYS-208',
        societyType: 'Credit Cooperative',
        email: 'info@navachetana.org',
        phone: '+91 821 241 5566',
        address: 'Main Road, Saraswathipuram',
        state: 'Karnataka',
        city: 'Mysuru',
        pincode: '570009',
        status: 'Active',
        approvedAt: new Date(),
        rejectionRemarks: '',
      },
      {
        _id: org3Id,
        name: 'Karnataka Farmers Multipurpose Co-op Society',
        code: 'KFMCS-303',
        registrationNumber: 'REG/AGRI/2018/HUBLI-309',
        societyType: 'Agricultural Cooperative',
        email: 'support@karnataka-farmers.org',
        phone: '+91 836 225 7711',
        address: 'APMC Yard, Hubballi',
        state: 'Karnataka',
        city: 'Hubballi',
        pincode: '580025',
        status: 'Active',
        approvedAt: new Date(),
        rejectionRemarks: '',
      },
      {
        _id: org4Id,
        name: 'Pragati Mahila Thrift & Credit Sahakari Ltd.',
        code: 'PMTCS-404',
        registrationNumber: 'REG/MAHILA/2019/MUM-412',
        societyType: 'Credit Cooperative',
        email: 'help@pragatimahila.org',
        phone: '+91 22 2430 9988',
        address: 'Shivaji Park, Dadar West',
        state: 'Maharashtra',
        city: 'Mumbai',
        pincode: '400028',
        status: 'Active',
        approvedAt: new Date(),
        rejectionRemarks: '',
      },
      {
        _id: org5Id,
        name: 'Cauvery Gramina Agricultural Cooperative Society',
        code: 'CGACS-505',
        registrationNumber: 'REG/RURAL/2024/MANDYA-501',
        societyType: 'Agricultural Cooperative',
        email: 'contact@cauverygramina.org',
        phone: '+91 8232 221 404',
        address: 'Taluk Office Road',
        state: 'Karnataka',
        city: 'Mandya',
        pincode: '571401',
        status: 'Pending',
        rejectionRemarks: '',
      },
    ]);
    console.log(`[Created]: ${orgs.length} Organizations seeded.`);

    // 3. SEED BRANCHES (5 Operational Branches)
    console.log('\n[3/10] Seeding 5 Operational Society Branches...');
    const branches = await Branch.create([
      {
        _id: branch1Id,
        organizationId: org1Id,
        branchCode: 'JP-01',
        branchName: 'JP Nagar Main Branch',
        address: 'No. 15, 24th Main, JP Nagar 5th Phase',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        phone: '+91 80 2658 1122',
        email: 'jpnagar@vijayacoop.org',
        status: 'Active',
      },
      {
        _id: branch2Id,
        organizationId: org1Id,
        branchCode: 'IN-02',
        branchName: 'Indiranagar Branch',
        address: 'No. 88, 100 Feet Road, Indiranagar',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        phone: '+91 80 2525 3344',
        email: 'indiranagar@vijayacoop.org',
        status: 'Active',
      },
      {
        _id: branch3Id,
        organizationId: org1Id,
        branchCode: 'JY-03',
        branchName: 'Jayanagar 4th Block Branch',
        address: 'No. 202, 11th Main, Jayanagar 4th Block',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        phone: '+91 80 2664 5566',
        email: 'jayanagar@vijayacoop.org',
        status: 'Active',
      },
      {
        _id: branch4Id,
        organizationId: org2Id,
        branchCode: 'MYS-01',
        branchName: 'Mysuru City Head Office Branch',
        address: 'K.R. Circle, Mysuru',
        district: 'Mysuru',
        state: 'Karnataka',
        phone: '+91 821 242 7788',
        email: 'mysuru@navachetana.org',
        status: 'Active',
      },
      {
        _id: branch5Id,
        organizationId: org3Id,
        branchCode: 'HUB-01',
        branchName: 'Hubballi Agri APMC Branch',
        address: 'APMC Market Yard Gate 2, Hubballi',
        district: 'Dharwad',
        state: 'Karnataka',
        phone: '+91 836 226 9900',
        email: 'apmc@karnataka-farmers.org',
        status: 'Active',
      },
    ]);
    console.log(`[Created]: ${branches.length} Branches seeded.`);

    // 4. SEED USERS (22 REAL USERS ACROSS ALL 7 ROLES)
    console.log('\n[4/10] Seeding 22 Real User Accounts with 7 RBAC Roles...');
    const usersData = [
      // Super Admin
      {
        name: 'Sahakara Super Admin',
        email: 'superadmin@sahakara.org',
        username: 'superadmin',
        password: 'password123',
        role: 'Super Admin',
        phone: '+91 99000 00001',
      },
      // Organization Admins
      {
        name: 'Vijaya Society Admin',
        email: 'admin@coop.org',
        username: 'orgadmin',
        password: 'password123',
        role: 'Organization Admin',
        organizationId: org1Id,
        phone: '+91 99000 00002',
      },
      {
        name: 'Navachetana Admin',
        email: 'admin@navachetana.org',
        username: 'navadmin',
        password: 'password123',
        role: 'Organization Admin',
        organizationId: org2Id,
        phone: '+91 99000 00020',
      },
      {
        name: 'Farmers Co-op Admin',
        email: 'admin@karnataka-farmers.org',
        username: 'farmadmin',
        password: 'password123',
        role: 'Organization Admin',
        organizationId: org3Id,
        phone: '+91 99000 00021',
      },
      // Board Executives (President, Secretary, Treasurer)
      {
        name: 'Ramesh Patil (President)',
        email: 'president@coop.org',
        username: 'president',
        password: 'password123',
        role: 'President',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00003',
      },
      {
        name: 'Suresh Kumar (Secretary)',
        email: 'secretary@coop.org',
        username: 'secretary',
        password: 'password123',
        role: 'Secretary',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00004',
      },
      {
        name: 'Anita Hegde (Treasurer)',
        email: 'treasurer@coop.org',
        username: 'treasurer',
        password: 'password123',
        role: 'Treasurer',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00005',
      },
      // Branch Managers & Employees
      {
        name: 'Kavitha Rao (Branch Manager)',
        email: 'manager.jp@coop.org',
        username: 'jpmanager',
        password: 'password123',
        role: 'Employee',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00010',
      },
      {
        name: 'Vijay Kumar (Indiranagar Manager)',
        email: 'manager.in@coop.org',
        username: 'inmanager',
        password: 'password123',
        role: 'Employee',
        organizationId: org1Id,
        branchId: branch2Id,
        phone: '+91 99000 00011',
      },
      {
        name: 'Mahesh Rao (Chief Teller)',
        email: 'employee@coop.org',
        username: 'employee',
        password: 'password123',
        role: 'Employee',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00006',
      },
      {
        name: 'Deepa Sharma (Loan Officer)',
        email: 'teller1@coop.org',
        username: 'teller1',
        password: 'password123',
        role: 'Employee',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00012',
      },
      {
        name: 'Prakash Shetty (Field Cashier)',
        email: 'teller2@coop.org',
        username: 'teller2',
        password: 'password123',
        role: 'Employee',
        organizationId: org1Id,
        branchId: branch2Id,
        phone: '+91 99000 00013',
      },
      // Members (6 Accounts)
      {
        name: 'Ganesh Bhatt (Member)',
        email: 'member@coop.org',
        username: 'member',
        password: 'password123',
        role: 'Member',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 00007',
      },
      {
        name: 'Sunita Bhatt (SHG Leader)',
        email: 'sunita.bhatt@gmail.com',
        username: 'sunitabhatt',
        password: 'password123',
        role: 'Member',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 99000 99887',
      },
      {
        name: 'Rajesh Sharma (JLG Leader)',
        email: 'rajesh.sharma@yahoo.com',
        username: 'rajeshsharma',
        password: 'password123',
        role: 'Member',
        organizationId: org1Id,
        branchId: branch2Id,
        phone: '+91 97410 88221',
      },
      {
        name: 'Lakshmi Narayan',
        email: 'lakshmi.n@gmail.com',
        username: 'lakshmin',
        password: 'password123',
        role: 'Member',
        organizationId: org1Id,
        branchId: branch1Id,
        phone: '+91 98450 11223',
      },
      {
        name: 'Basavaraj Gowda',
        email: 'basavaraj@rediffmail.com',
        username: 'basavaraj',
        password: 'password123',
        role: 'Member',
        organizationId: org3Id,
        branchId: branch5Id,
        phone: '+91 94480 33445',
      },
      {
        name: 'Meenakshi Sundaram',
        email: 'meenakshi@gmail.com',
        username: 'meenakshi',
        password: 'password123',
        role: 'Member',
        organizationId: org1Id,
        branchId: branch3Id,
        phone: '+91 98800 55667',
      },
    ];

    const users = await User.create(usersData);
    console.log(`[Created]: ${users.length} Users seeded with hashed passwords.`);

    // 5. SEED MEMBERS (6 Member Enrollment Profiles)
    console.log('\n[5/10] Seeding Member Enrollment Profiles...');
    const membersData = [
      {
        organizationId: org1Id,
        branchId: branch1Id,
        memberId: 'MEM-2026-101',
        fullName: 'Ganesh Bhatt',
        fatherOrHusbandName: 'Mahabaleshwar Bhatt',
        dob: new Date('1985-05-15'),
        gender: 'Male',
        phone: '+91 99000 00007',
        email: 'member@coop.org',
        category: 'Regular Member',
        address: 'No. 12, 5th Cross, JP Nagar 2nd Phase, Bengaluru',
        aadhaarNumber: '9988-7766-5544',
        panNumber: 'ABCDE1234F',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Shaila Bhatt',
        nomineeRelation: 'Spouse',
        nomineeSharePercent: 100,
      },
      {
        organizationId: org1Id,
        branchId: branch1Id,
        memberId: 'MEM-2026-102',
        fullName: 'Sunita Bhatt',
        fatherOrHusbandName: 'Subramanya Bhatt',
        dob: new Date('1990-08-20'),
        gender: 'Female',
        phone: '+91 99000 99887',
        email: 'sunita.bhatt@gmail.com',
        category: 'Regular Member',
        address: 'No. 45, 12th Main, JP Nagar 3rd Phase, Bengaluru',
        aadhaarNumber: '8877-6655-4433',
        panNumber: 'FGHIJ5678K',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Subramanya Bhatt',
        nomineeRelation: 'Spouse',
        nomineeSharePercent: 100,
      },
      {
        organizationId: org1Id,
        branchId: branch2Id,
        memberId: 'MEM-2026-103',
        fullName: 'Rajesh Sharma',
        fatherOrHusbandName: 'Ramakant Sharma',
        dob: new Date('1982-11-10'),
        gender: 'Male',
        phone: '+91 97410 88221',
        email: 'rajesh.sharma@yahoo.com',
        category: 'Regular Member',
        address: 'No. 102, Double Road, Indiranagar, Bengaluru',
        aadhaarNumber: '7766-5544-3322',
        panNumber: 'KLMNO9012P',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Pooja Sharma',
        nomineeRelation: 'Spouse',
        nomineeSharePercent: 100,
      },
      {
        organizationId: org1Id,
        branchId: branch1Id,
        memberId: 'MEM-2026-104',
        fullName: 'Lakshmi Narayan',
        fatherOrHusbandName: 'Narayana Swamy',
        dob: new Date('1993-02-14'),
        gender: 'Female',
        phone: '+91 98450 11223',
        email: 'lakshmi.n@gmail.com',
        category: 'Regular Member',
        address: 'No. 78, 1st Stage, BTM Layout, Bengaluru',
        aadhaarNumber: '6655-4433-2211',
        panNumber: 'QRSTU3456V',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Narayana Swamy',
        nomineeRelation: 'Father',
        nomineeSharePercent: 100,
      },
      {
        organizationId: org3Id,
        branchId: branch5Id,
        memberId: 'MEM-2026-105',
        fullName: 'Basavaraj Gowda',
        fatherOrHusbandName: 'Ningappa Gowda',
        dob: new Date('1978-04-05'),
        gender: 'Male',
        phone: '+91 94480 33445',
        email: 'basavaraj@rediffmail.com',
        category: 'Regular Member',
        address: 'Village Unkal, Hubballi Taluk, Dharwad Dist',
        aadhaarNumber: '5544-3322-1100',
        panNumber: 'WXYZA7890B',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Renuka Gowda',
        nomineeRelation: 'Spouse',
        nomineeSharePercent: 100,
      },
      {
        organizationId: org1Id,
        branchId: branch3Id,
        memberId: 'MEM-2026-106',
        fullName: 'Meenakshi Sundaram',
        fatherOrHusbandName: 'Sundaram Murthy',
        dob: new Date('1988-09-25'),
        gender: 'Female',
        phone: '+91 98800 55667',
        email: 'meenakshi@gmail.com',
        category: 'Associate Member',
        address: 'No. 30, 9th Cross, Jayanagar 5th Block, Bengaluru',
        aadhaarNumber: '4433-2211-0099',
        panNumber: 'BCDEF1234C',
        kycStatus: 'Verified',
        membershipStatus: 'Active',
        approvalStatus: 'Approved',
        nomineeName: 'Sundaram Murthy',
        nomineeRelation: 'Spouse',
        nomineeSharePercent: 100,
      },
    ];

    const members = await Member.create(membersData);
    console.log(`[Created]: ${members.length} Member Enrollment Records seeded.`);

    // 6. SEED ROLES & PERMISSIONS
    console.log('\n[6/10] Seeding 7 RBAC Roles and Module Permission Matrix...');
    const permissionsData = [
      { module: 'organizations', action: 'read', description: 'Read organization details' },
      { module: 'organizations', action: 'update', description: 'Update organization profile' },
      { module: 'branches', action: 'create', description: 'Create new branches' },
      { module: 'branches', action: 'read', description: 'Read branch details' },
      { module: 'users', action: 'create', description: 'Onboard new staff/users' },
      { module: 'users', action: 'read', description: 'View user directory' },
      { module: 'members', action: 'create', description: 'Register new members' },
      { module: 'members', action: 'read', description: 'View member profiles' },
      { module: 'members', action: 'approve', description: 'Approve member applications' },
      { module: 'roles', action: 'read', description: 'View RBAC roles & permissions' },
      { module: 'roles', action: 'update', description: 'Update permission matrix' },
      { module: 'groups', action: 'create', description: 'Register SHG / JLG groups' },
      { module: 'groups', action: 'read', description: 'View group profiles & rosters' },
    ];
    const permissions = await Permission.create(permissionsData);

    const rolesData = [
      { roleName: 'Super Admin', isSystemRole: true, description: 'Master ERP platform governor' },
      { roleName: 'Organization Admin', isSystemRole: true, description: 'Cooperative Society Administrator' },
      { roleName: 'President', isSystemRole: true, description: 'Board President & Executive Officer' },
      { roleName: 'Secretary', isSystemRole: true, description: 'Board Secretary & Governance Officer' },
      { roleName: 'Treasurer', isSystemRole: true, description: 'Board Treasurer & Chief Financial Officer' },
      { roleName: 'Employee', isSystemRole: true, description: 'Branch Manager & Teller Officer' },
      { roleName: 'Member', isSystemRole: true, description: 'Cooperative Society Account Holder' },
    ];
    const roles = await Role.create(rolesData);
    console.log(`[Created]: ${roles.length} Roles and ${permissions.length} Permissions seeded.`);

    // 7. SEED MEMBER GROUPS (SHG / JLG Groups)
    console.log('\n[7/10] Seeding 5 Self-Help Groups (SHG) & JLGs...');
    const groupsData = [
      {
        organizationId: org1Id,
        branchId: branch1Id,
        groupId: 'GRP-2026-001',
        groupCode: 'SHG-JP-101',
        groupName: 'Mahila Pragati Self-Help Group',
        groupType: 'Self-Help Group (SHG)',
        description: 'Women micro-savings and skill development group',
        leaderId: members[1]._id, // Sunita Bhatt
        memberIds: [members[0]._id, members[1]._id, members[3]._id],
        totalMembers: 3,
        status: 'Active',
      },
      {
        organizationId: org1Id,
        branchId: branch2Id,
        groupId: 'GRP-2026-002',
        groupCode: 'JLG-IN-201',
        groupName: 'Raitara Bandhu Joint Liability Group',
        groupType: 'Joint Liability Group (JLG)',
        description: 'Peer guarantee agricultural implements credit group',
        leaderId: members[2]._id, // Rajesh Sharma
        memberIds: [members[2]._id, members[4]._id],
        totalMembers: 2,
        status: 'Active',
      },
      {
        organizationId: org1Id,
        branchId: branch3Id,
        groupId: 'GRP-2026-003',
        groupCode: 'SHG-JY-102',
        groupName: 'Annapurna Women Empowerment SHG',
        groupType: 'Self-Help Group (SHG)',
        description: 'Catering and food artisan savings linkage group',
        leaderId: members[5]._id, // Meenakshi
        memberIds: [members[5]._id, members[1]._id],
        totalMembers: 2,
        status: 'Active',
      },
      {
        organizationId: org3Id,
        branchId: branch5Id,
        groupId: 'GRP-2026-004',
        groupCode: 'FG-HUB-301',
        groupName: 'Navoday Dairy Farmers Group',
        groupType: 'Farmers Group',
        description: 'Milk collection & cattle fodder credit cooperative group',
        leaderId: members[4]._id, // Basavaraj Gowda
        memberIds: [members[4]._id, members[2]._id],
        totalMembers: 2,
        status: 'Active',
      },
      {
        organizationId: org1Id,
        branchId: branch1Id,
        groupId: 'GRP-2026-005',
        groupCode: 'SG-JP-401',
        groupName: 'Cauvery Swavalamban Savings Group',
        groupType: 'Savings Group',
        description: 'Weekly pigmy savings & micro-investment group',
        leaderId: members[0]._id, // Ganesh Bhatt
        memberIds: [members[0]._id, members[3]._id],
        totalMembers: 2,
        status: 'Active',
      },
    ];

    const groups = await Group.create(groupsData);
    console.log(`[Created]: ${groups.length} Member Groups (SHG/JLG) seeded.`);

    // 8. SEED INQUIRIES (5 Registration Inquiries)
    console.log('\n[8/10] Seeding 5 Society Registration Inquiries...');
    const inquiriesData = [
      {
        societyName: 'Karnataka Urban Co-op Bank Federation',
        contactPerson: 'Srinivas V. Hegde',
        email: 'srinivas@karnatakabankfed.org',
        phone: '+91 98451 99887',
        state: 'Karnataka',
        societyType: 'Credit Cooperative',
        estimatedMembers: '2000+',
        message: 'Interested in onboarding 12 branches on Sahakara ERP Cloud.',
        status: 'Contacted',
      },
      {
        societyName: 'Maharashtra Mahila Vikas Souharda',
        contactPerson: 'Sujata Deshmukh',
        email: 'sujata@mahila-vikas.org',
        phone: '+91 98220 11223',
        state: 'Maharashtra',
        societyType: 'Multi-Purpose Cooperative',
        estimatedMembers: '2000+',
        message: 'Requesting live demo for SHG loan automation.',
        status: 'Pending',
      },
      {
        societyName: 'Tamil Nadu Milk Producers Co-op Federation',
        contactPerson: 'K. Ramachandran',
        email: 'ramachandran@tnmilk.org',
        phone: '+91 94440 33445',
        state: 'Tamil Nadu',
        societyType: 'Agricultural Cooperative',
        estimatedMembers: '2000+',
        message: 'Seeking daily pigmy deposit & milk bill settlement integration.',
        status: 'Pending',
      },
      {
        societyName: 'Kerala Fishermen Credit Cooperative',
        contactPerson: 'Thomas Joseph',
        email: 'thomas@keralafish.org',
        phone: '+91 98470 55667',
        state: 'Kerala',
        societyType: 'Credit Cooperative',
        estimatedMembers: '2000+',
        message: 'Evaluating Sahakara ERP multi-tenant security architecture.',
        status: 'Contacted',
      },
      {
        societyName: 'Andhra Pradesh Farmer Credit Sahakari',
        contactPerson: 'Venkateshwara Rao',
        email: 'rao@apfarmercoop.org',
        phone: '+91 98480 77889',
        state: 'Andhra Pradesh',
        societyType: 'Agricultural Cooperative',
        estimatedMembers: '2000+',
        message: 'Requesting pricing tier for 6 branch deployment.',
        status: 'Pending',
      },
    ];

    const inquiries = await Inquiry.create(inquiriesData);
    console.log(`[Created]: ${inquiries.length} Society Inquiries seeded.`);

    // 9. SEED SYSTEM & ORGANIZATION SETTINGS
    console.log('\n[9/10] Seeding Master System Settings & Org Settings...');
    await SystemSetting.create({
      platformName: 'SAHAKARA ERP - Multi-Tenant Cooperative Platform',
      version: '1.0.0',
      maintenanceMode: false,
      maxOrganizations: 100,
      supportEmail: 'support@sahakara.org',
      supportPhone: '+91 80 4000 8000',
    });

    await OrganizationSetting.create({
      organizationId: org1Id,
      financialYearStart: '01-04',
      financialYearEnd: '31-03',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY',
      autoApproveMembers: false,
      allowNegativeSavings: false,
    });
    console.log('[Created]: System & Organization Settings seeded.');

    // 10. SEED AUDIT LOGS (10 Real Event Logs)
    console.log('\n[10/10] Seeding 10 Real Operational Audit Logs...');
    const auditLogsData = [
      {
        organizationId: org1Id,
        action: 'SOCIETY_REGISTERED',
        performerName: 'Sahakara Super Admin',
        performerRole: 'Super Admin',
        details: 'Approved and onboarded Vijaya Credit Cooperative Society Ltd.',
      },
      {
        organizationId: org1Id,
        action: 'BRANCH_CREATED',
        performerName: 'Vijaya Society Admin',
        performerRole: 'Organization Admin',
        details: 'Created JP Nagar Main Branch (Code: JP-01).',
      },
      {
        organizationId: org1Id,
        action: 'USER_CREATED',
        performerName: 'Vijaya Society Admin',
        performerRole: 'Organization Admin',
        details: 'Onboarded Kavitha Rao as JP Nagar Branch Manager.',
      },
      {
        organizationId: org1Id,
        action: 'MEMBER_REGISTERED',
        performerName: 'Mahesh Rao (Chief Teller)',
        performerRole: 'Employee',
        details: 'Enrolled member Ganesh Bhatt (ID: MEM-2026-101).',
      },
      {
        organizationId: org1Id,
        action: 'MEMBER_APPROVED',
        performerName: 'Ramesh Patil (President)',
        performerRole: 'President',
        details: 'Approved membership application for Sunita Bhatt.',
      },
      {
        organizationId: org1Id,
        action: 'GROUP_CREATED',
        performerName: 'Kavitha Rao (Branch Manager)',
        performerRole: 'Employee',
        details: 'Registered Mahila Pragati Self-Help Group (Code: SHG-JP-101).',
      },
      {
        organizationId: org1Id,
        action: 'GROUP_LEADER_ASSIGNED',
        performerName: 'Kavitha Rao (Branch Manager)',
        performerRole: 'Employee',
        details: 'Assigned Sunita Bhatt as Group Leader for Mahila Pragati SHG.',
      },
      {
        organizationId: org1Id,
        action: 'ROLE_CREATED',
        performerName: 'Vijaya Society Admin',
        performerRole: 'Organization Admin',
        details: 'Created custom role "Loan Assessment Officer".',
      },
    ];

    const logs = await AuditLog.create(auditLogsData);
    console.log(`[Created]: ${logs.length} Operational Audit Logs seeded.`);

    console.log('\n====================================================');
    console.log(' 🎉 SAHAKARA ERP DATABASE SEEDING COMPLETED CLEANLY!');
    console.log('====================================================');
    console.log(' Credentials Summary:');
    console.log(' 👑 Super Admin: superadmin@sahakara.org / password123');
    console.log(' 🏢 Org Admin: admin@coop.org / password123');
    console.log(' 👔 President: president@coop.org / password123');
    console.log(' 📜 Secretary: secretary@coop.org / password123');
    console.log(' 💰 Treasurer: treasurer@coop.org / password123');
    console.log(' 💼 Teller / Staff: employee@coop.org / password123');
    console.log(' 👤 Member: member@coop.org / password123');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ [Seed Error]:', error);
  } finally {
    await mongoose.connection.close();
    console.log('[Database Connection Closed]. Exiting seed process.');
    process.exit(0);
  }
};

seedDB();
