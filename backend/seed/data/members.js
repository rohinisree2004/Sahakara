const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { userIds } = require('./users');

const memberIds = {};

// Helper to generate a bunch of members
const generateMembers = (orgId, branchId, prefix, count, createdBy, names) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const id = new mongoose.Types.ObjectId();
    memberIds[`${prefix}${i+1}`] = id;
    
    result.push({
      _id: id,
      organizationId: orgId,
      branchId: branchId,
      memberId: `MEM-2026-${prefix}${String(i + 1).padStart(3, '0')}`,
      fullName: names[i] || `${prefix} Member ${i+1}`,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      dob: new Date(1970 + (i % 30), (i % 12), (i % 28) + 1),
      phone: `+91 94${String(i).padStart(8, '0')}`,
      email: `member${i+1}.${prefix}@example.com`,
      address: `House ${i+1}, Main Road`,
      district: 'Kerala District',
      state: 'Kerala',
      pincode: '680000',
      occupation: i % 2 === 0 ? 'Farmer' : 'Teacher',
      joiningDate: new Date(2025, i % 12, (i % 28) + 1),
      category: 'Regular Member',
      kycDocuments: {
        kycVerified: true,
        verifiedAt: new Date(),
      },
      membershipStatus: 'Active',
      createdBy: createdBy,
    });
  }
  return result;
};

const kuNames = ['Ravi Nair', 'Bindu Varghese', 'Joseph Kurian', 'Anita K', 'Gopalan P', 'Sheela Rajan'];
const saNames = ['Arun K', 'Mini P', 'Vijay M', 'Sumathi N', 'Karthik S', 'Jaya R'];
const gvNames = ['Manoj T', 'Sujatha V', 'Babu N', 'Usha K', 'Radha G', 'Hari O'];
const mwNames = ['Ashraf P', 'Salma M', 'Hussain K', 'Rasiya B', 'Ibrahim A', 'Fouzia N'];


const members = [
  ...generateMembers(orgIds.keralaUnity, branchIds.kottayamMain, 'KU', 6, userIds.kuAdmin, kuNames),
  ...generateMembers(orgIds.sahodaya, branchIds.ernakulamMain, 'SA', 6, userIds.saAdmin, saNames),
  ...generateMembers(orgIds.greenValley, branchIds.palakkadMain, 'GV', 6, userIds.gvAdmin, gvNames),
  ...generateMembers(orgIds.malabarWelfare, branchIds.kozhikodeMain, 'MW', 6, userIds.mwAdmin, mwNames),
];

module.exports = { members, memberIds };
