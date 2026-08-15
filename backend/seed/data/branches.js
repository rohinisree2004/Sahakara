const mongoose = require('mongoose');
const { orgIds } = require('./organizations');

const branchIds = {
  kottayamMain: new mongoose.Types.ObjectId('65b000000000000000000001'),
  changanassery: new mongoose.Types.ObjectId('65b000000000000000000002'),
  ernakulamMain: new mongoose.Types.ObjectId('65b000000000000000000003'),
  aluva: new mongoose.Types.ObjectId('65b000000000000000000004'),
  palakkadMain: new mongoose.Types.ObjectId('65b000000000000000000005'),
  ottapalam: new mongoose.Types.ObjectId('65b000000000000000000006'),
  kozhikodeMain: new mongoose.Types.ObjectId('65b000000000000000000007'),
  thamarassery: new mongoose.Types.ObjectId('65b000000000000000000008'),
};

const branches = [
  // Kerala Unity Employees Cooperative Society
  {
    _id: branchIds.kottayamMain,
    organizationId: orgIds.keralaUnity,
    branchCode: 'KTM01',
    branchName: 'Kottayam Main Branch',
    address: 'KUECS Bhavan, Baker Junction',
    district: 'Kottayam',
    state: 'Kerala',
    phone: '+91 481 200001',
    email: 'kottayam@keralaunity.example.com',
    workingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
    status: 'Active',
  },
  {
    _id: branchIds.changanassery,
    organizationId: orgIds.keralaUnity,
    branchCode: 'CGY01',
    branchName: 'Changanassery Branch',
    address: 'MC Road, Changanassery',
    district: 'Kottayam',
    state: 'Kerala',
    phone: '+91 481 200002',
    email: 'changanassery@keralaunity.example.com',
    workingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
    status: 'Active',
  },
  
  // Sahodaya Community Cooperative Society
  {
    _id: branchIds.ernakulamMain,
    organizationId: orgIds.sahodaya,
    branchCode: 'EKM01',
    branchName: 'Ernakulam Main Branch',
    address: 'Sahodaya Plaza, MG Road',
    district: 'Ernakulam',
    state: 'Kerala',
    phone: '+91 484 200001',
    email: 'ernakulam@sahodaya.example.com',
    workingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
    status: 'Active',
  },
  {
    _id: branchIds.aluva,
    organizationId: orgIds.sahodaya,
    branchCode: 'ALV01',
    branchName: 'Aluva Branch',
    address: 'Bank Road, Aluva',
    district: 'Ernakulam',
    state: 'Kerala',
    phone: '+91 484 200002',
    email: 'aluva@sahodaya.example.com',
    workingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
    status: 'Active',
  },

  // Green Valley Farmers Cooperative Society
  {
    _id: branchIds.palakkadMain,
    organizationId: orgIds.greenValley,
    branchCode: 'PKD01',
    branchName: 'Palakkad Main Branch',
    address: 'Krishi Bhavan Road',
    district: 'Palakkad',
    state: 'Kerala',
    phone: '+91 491 200001',
    email: 'palakkad@greenvalley.example.com',
    workingHours: '8:30 AM - 4:30 PM (Mon-Sat)',
    status: 'Active',
  },
  {
    _id: branchIds.ottapalam,
    organizationId: orgIds.greenValley,
    branchCode: 'OTP01',
    branchName: 'Ottapalam Branch',
    address: 'RS Road, Ottapalam',
    district: 'Palakkad',
    state: 'Kerala',
    phone: '+91 491 200002',
    email: 'ottapalam@greenvalley.example.com',
    workingHours: '8:30 AM - 4:30 PM (Mon-Sat)',
    status: 'Active',
  },

  // Malabar Community Welfare Cooperative Society
  {
    _id: branchIds.kozhikodeMain,
    organizationId: orgIds.malabarWelfare,
    branchCode: 'KKD01',
    branchName: 'Kozhikode Main Branch',
    address: 'Welfare Tower, Mavoor Road',
    district: 'Kozhikode',
    state: 'Kerala',
    phone: '+91 495 200001',
    email: 'kozhikode@malabarwelfare.example.com',
    workingHours: '9:30 AM - 5:30 PM (Mon-Sat)',
    status: 'Active',
  },
  {
    _id: branchIds.thamarassery,
    organizationId: orgIds.malabarWelfare,
    branchCode: 'TMS01',
    branchName: 'Thamarassery Branch',
    address: 'Main Road, Thamarassery',
    district: 'Kozhikode',
    state: 'Kerala',
    phone: '+91 495 200002',
    email: 'thamarassery@malabarwelfare.example.com',
    workingHours: '9:30 AM - 5:30 PM (Mon-Sat)',
    status: 'Active',
  },
];

module.exports = { branches, branchIds };
