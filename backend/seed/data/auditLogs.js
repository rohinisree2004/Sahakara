const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { userIds } = require('./users');

const auditLogs = [
  // System level
  {
    _id: new mongoose.Types.ObjectId(),
    performedBy: userIds.superAdmin,
    performerName: 'System Super Admin',
    performerRole: 'Super Admin',
    action: 'ORGANIZATION_APPROVED',
    details: 'Approved organization Kerala Unity Employees Cooperative Society',
    createdAt: new Date(2025, 0, 1),
  },
  {
    _id: new mongoose.Types.ObjectId(),
    performedBy: userIds.superAdmin,
    performerName: 'System Super Admin',
    performerRole: 'Super Admin',
    action: 'ORGANIZATION_APPROVED',
    details: 'Approved organization Sahodaya Community Cooperative Society',
    createdAt: new Date(2025, 0, 2),
  },
  // Kerala Unity Admin Logs
  {
    _id: new mongoose.Types.ObjectId(),
    organizationId: orgIds.keralaUnity,
    performedBy: userIds.kuAdmin,
    performerName: 'Kerala Unity Admin',
    performerRole: 'Organization Admin',
    action: 'USER_CREATED',
    details: 'Created user account for Rajeev Menon (President)',
    createdAt: new Date(2025, 0, 3),
  },
  {
    _id: new mongoose.Types.ObjectId(),
    organizationId: orgIds.keralaUnity,
    performedBy: userIds.kuAdmin,
    performerName: 'Kerala Unity Admin',
    performerRole: 'Organization Admin',
    action: 'BRANCH_CREATED',
    details: 'Created branch Kottayam Main Branch (KTM01)',
    createdAt: new Date(2025, 0, 4),
  },
  // Sahodaya Admin Logs
  {
    _id: new mongoose.Types.ObjectId(),
    organizationId: orgIds.sahodaya,
    performedBy: userIds.saAdmin,
    performerName: 'Sahodaya Admin',
    performerRole: 'Organization Admin',
    action: 'USER_CREATED',
    details: 'Created user account for Vipin Chandran (President)',
    createdAt: new Date(2025, 0, 3),
  },
];

module.exports = { auditLogs };
