const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { userIds } = require('./users');

const groupIds = {
  // Kerala Unity Groups (under Kottayam Main & Changanassery)
  kuGroup1: new mongoose.Types.ObjectId('65d000000000000000000001'),
  kuGroup2: new mongoose.Types.ObjectId('65d000000000000000000002'),
  kuGroup3: new mongoose.Types.ObjectId('65d000000000000000000003'),
  kuGroup4: new mongoose.Types.ObjectId('65d000000000000000000004'),
  kuGroup5: new mongoose.Types.ObjectId('65d000000000000000000005'),

  // Sahodaya Groups (under Ernakulam Main & Aluva)
  saGroup1: new mongoose.Types.ObjectId('65d000000000000000000011'),
  saGroup2: new mongoose.Types.ObjectId('65d000000000000000000012'),
  saGroup3: new mongoose.Types.ObjectId('65d000000000000000000013'),
  saGroup4: new mongoose.Types.ObjectId('65d000000000000000000014'),

  // Green Valley Groups (under Palakkad Main & Ottapalam)
  gvGroup1: new mongoose.Types.ObjectId('65d000000000000000000021'),
  gvGroup2: new mongoose.Types.ObjectId('65d000000000000000000022'),
  gvGroup3: new mongoose.Types.ObjectId('65d000000000000000000023'),

  // Malabar Welfare Groups (under Kozhikode Main & Thamarassery)
  mwGroup1: new mongoose.Types.ObjectId('65d000000000000000000031'),
  mwGroup2: new mongoose.Types.ObjectId('65d000000000000000000032'),
  mwGroup3: new mongoose.Types.ObjectId('65d000000000000000000033'),
};

const groups = [
  // =========================================================================
  // KERALA UNITY - KOTTAYAM MAIN BRANCH GROUPS
  // =========================================================================
  {
    _id: groupIds.kuGroup1,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.kottayamMain,
    groupId: 'GRP-KTM-01',
    groupCode: 'SHG-KTM-01',
    groupName: 'Kottayam Mahila SHG',
    groupType: 'Self-Help Group (SHG)',
    description: 'Women empowerment & thrift savings group in Baker Junction area',
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },
  {
    _id: groupIds.kuGroup2,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.kottayamMain,
    groupId: 'GRP-KTM-02',
    groupCode: 'JLG-KTM-02',
    groupName: 'Kottayam Farmers JLG',
    groupType: 'Joint Liability Group (JLG)',
    description: 'Joint liability agriculture credit & input purchasing cluster',
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },
  {
    _id: groupIds.kuGroup3,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.kottayamMain,
    groupId: 'GRP-KTM-03',
    groupCode: 'MEG-KTM-03',
    groupName: 'Kottayam Micro-Enterprise Group',
    groupType: 'Savings Group',
    description: 'Small commercial vendors & micro-merchants cluster',
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },

  // KERALA UNITY - CHANGANASSERY BRANCH GROUPS
  {
    _id: groupIds.kuGroup4,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.changanassery,
    groupId: 'GRP-CGY-01',
    groupCode: 'SHG-CGY-01',
    groupName: 'Changanassery Kudumbashree Unit',
    groupType: 'Self-Help Group (SHG)',
    description: 'Neighborhood micro-savings & cottage industry collective',
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },
  {
    _id: groupIds.kuGroup5,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.changanassery,
    groupId: 'GRP-CGY-02',
    groupCode: 'JLG-CGY-02',
    groupName: 'Changanassery Artisans JLG',
    groupType: 'Joint Liability Group (JLG)',
    description: 'Handicraft & artisan mutual liability group',
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },

  // =========================================================================
  // SAHODAYA - ERNAKULAM MAIN BRANCH GROUPS
  // =========================================================================
  {
    _id: groupIds.saGroup1,
    organizationId: orgIds.sahodaya,
    branchId: branchIds.ernakulamMain,
    groupId: 'GRP-EKM-01',
    groupCode: 'JLG-EKM-01',
    groupName: 'Ernakulam Traders JLG',
    groupType: 'Joint Liability Group (JLG)',
    description: 'City retail merchants cooperative credit group',
    status: 'Active',
    createdBy: userIds.saAdmin,
  },
  {
    _id: groupIds.saGroup2,
    organizationId: orgIds.sahodaya,
    branchId: branchIds.ernakulamMain,
    groupId: 'GRP-EKM-02',
    groupCode: 'SHG-EKM-02',
    groupName: 'Kochi Women Thrift Group',
    groupType: 'Self-Help Group (SHG)',
    description: 'Urban women weekly recurring savings collective',
    status: 'Active',
    createdBy: userIds.saAdmin,
  },

  // SAHODAYA - ALUVA BRANCH GROUPS
  {
    _id: groupIds.saGroup3,
    organizationId: orgIds.sahodaya,
    branchId: branchIds.aluva,
    groupId: 'GRP-ALV-01',
    groupCode: 'SHG-ALV-01',
    groupName: 'Aluva Industrial Workers SHG',
    groupType: 'Self-Help Group (SHG)',
    description: 'Industrial zone factory employees thrift group',
    status: 'Active',
    createdBy: userIds.saAdmin,
  },
  {
    _id: groupIds.saGroup4,
    organizationId: orgIds.sahodaya,
    branchId: branchIds.aluva,
    groupId: 'GRP-ALV-02',
    groupCode: 'DFG-ALV-02',
    groupName: 'Aluva Dairy Farmers Group',
    groupType: 'Farmers Group',
    description: 'Dairy livestock & milk marketing collective',
    status: 'Active',
    createdBy: userIds.saAdmin,
  },

  // =========================================================================
  // GREEN VALLEY - PALAKKAD MAIN & OTTAPALAM BRANCH GROUPS
  // =========================================================================
  {
    _id: groupIds.gvGroup1,
    organizationId: orgIds.greenValley,
    branchId: branchIds.palakkadMain,
    groupId: 'GRP-PKD-01',
    groupCode: 'FRM-PKD-01',
    groupName: 'Palakkad Paddy Cultivators Group',
    groupType: 'Farmers Group',
    description: 'Paddy seed cultivation and harvesting cooperative unit',
    status: 'Active',
    createdBy: userIds.gvAdmin,
  },
  {
    _id: groupIds.gvGroup2,
    organizationId: orgIds.greenValley,
    branchId: branchIds.palakkadMain,
    groupId: 'GRP-PKD-02',
    groupCode: 'SHG-PKD-02',
    groupName: 'Palakkad Women Empowerment SHG',
    groupType: 'Self-Help Group (SHG)',
    description: 'Rural agro-processing & thrift unit',
    status: 'Active',
    createdBy: userIds.gvAdmin,
  },
  {
    _id: groupIds.gvGroup3,
    organizationId: orgIds.greenValley,
    branchId: branchIds.ottapalam,
    groupId: 'GRP-OTP-01',
    groupCode: 'JLG-OTP-01',
    groupName: 'Ottapalam Handloom Weavers JLG',
    groupType: 'Joint Liability Group (JLG)',
    description: 'Traditional textile weavers mutual credit group',
    status: 'Active',
    createdBy: userIds.gvAdmin,
  },

  // =========================================================================
  // MALABAR WELFARE - KOZHIKODE MAIN & THAMARASSERY BRANCH GROUPS
  // =========================================================================
  {
    _id: groupIds.mwGroup1,
    organizationId: orgIds.malabarWelfare,
    branchId: branchIds.kozhikodeMain,
    groupId: 'GRP-KZD-01',
    groupCode: 'SHG-KZD-01',
    groupName: 'Kozhikode Welfare SHG',
    groupType: 'Self-Help Group (SHG)',
    description: 'Community welfare & emergency health fund collective',
    status: 'Active',
    createdBy: userIds.mwAdmin,
  },
  {
    _id: groupIds.mwGroup2,
    organizationId: orgIds.malabarWelfare,
    branchId: branchIds.kozhikodeMain,
    groupId: 'GRP-KZD-02',
    groupCode: 'MCG-KZD-02',
    groupName: 'Malabar Coastal Fisheries Group',
    groupType: 'Farmers Group',
    description: 'Marine fisheries & equipment joint purchase collective',
    status: 'Active',
    createdBy: userIds.mwAdmin,
  },
  {
    _id: groupIds.mwGroup3,
    organizationId: orgIds.malabarWelfare,
    branchId: branchIds.thamarassery,
    groupId: 'GRP-TMS-01',
    groupCode: 'SFG-TMS-01',
    groupName: 'Thamarassery Spices Farmers Group',
    groupType: 'Farmers Group',
    description: 'Cardamom & pepper growers organic farming collective',
    status: 'Active',
    createdBy: userIds.mwAdmin,
  },
];

module.exports = { groups, groupIds };
