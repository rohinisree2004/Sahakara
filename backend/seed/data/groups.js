const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { userIds } = require('./users');
const { memberIds } = require('./members');

const groupIds = {
  kuGroup1: new mongoose.Types.ObjectId(),
  saGroup1: new mongoose.Types.ObjectId(),
  gvGroup1: new mongoose.Types.ObjectId(),
  mwGroup1: new mongoose.Types.ObjectId(),
};

const groups = [
  {
    _id: groupIds.kuGroup1,
    organizationId: orgIds.keralaUnity,
    branchId: branchIds.kottayamMain,
    groupId: 'GRP-KU-01',
    groupCode: 'SHG-KU-01',
    groupName: 'Kottayam Mahila SHG',
    groupType: 'Self-Help Group (SHG)',
    leaderId: memberIds['KU1'],
    memberIds: [memberIds['KU1'], memberIds['KU2'], memberIds['KU3']],
    totalMembers: 3,
    status: 'Active',
    createdBy: userIds.kuAdmin,
  },
  {
    _id: groupIds.saGroup1,
    organizationId: orgIds.sahodaya,
    branchId: branchIds.ernakulamMain,
    groupId: 'GRP-SA-01',
    groupCode: 'JLG-SA-01',
    groupName: 'Ernakulam Traders JLG',
    groupType: 'Joint Liability Group (JLG)',
    leaderId: memberIds['SA1'],
    memberIds: [memberIds['SA1'], memberIds['SA2'], memberIds['SA3']],
    totalMembers: 3,
    status: 'Active',
    createdBy: userIds.saAdmin,
  },
  {
    _id: groupIds.gvGroup1,
    organizationId: orgIds.greenValley,
    branchId: branchIds.palakkadMain,
    groupId: 'GRP-GV-01',
    groupCode: 'FRM-GV-01',
    groupName: 'Palakkad Farmers Group',
    groupType: 'Farmers Group',
    leaderId: memberIds['GV1'],
    memberIds: [memberIds['GV1'], memberIds['GV2'], memberIds['GV3']],
    totalMembers: 3,
    status: 'Active',
    createdBy: userIds.gvAdmin,
  },
  {
    _id: groupIds.mwGroup1,
    organizationId: orgIds.malabarWelfare,
    branchId: branchIds.kozhikodeMain,
    groupId: 'GRP-MW-01',
    groupCode: 'SHG-MW-01',
    groupName: 'Kozhikode Welfare SHG',
    groupType: 'Self-Help Group (SHG)',
    leaderId: memberIds['MW1'],
    memberIds: [memberIds['MW1'], memberIds['MW2'], memberIds['MW3']],
    totalMembers: 3,
    status: 'Active',
    createdBy: userIds.mwAdmin,
  }
];

module.exports = { groups, groupIds };
