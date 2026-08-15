const mongoose = require('mongoose');

// Generate deterministic ObjectIds for consistent cross-referencing
const orgIds = {
  keralaUnity: new mongoose.Types.ObjectId('65a000000000000000000001'),
  sahodaya: new mongoose.Types.ObjectId('65a000000000000000000002'),
  greenValley: new mongoose.Types.ObjectId('65a000000000000000000003'),
  malabarWelfare: new mongoose.Types.ObjectId('65a000000000000000000004'),
};

const organizations = [
  {
    _id: orgIds.keralaUnity,
    name: 'Kerala Unity Employees Cooperative Society',
    code: 'KUECS',
    registrationNumber: 'K/1990/4521',
    societyType: 'Credit Cooperative',
    email: 'contact@keralaunity.example.com',
    phone: '+91 94000 00001',
    address: 'KUECS Bhavan, Baker Junction',
    state: 'Kerala',
    city: 'Kottayam',
    pincode: '686001',
    status: 'Active',
  },
  {
    _id: orgIds.sahodaya,
    name: 'Sahodaya Community Cooperative Society',
    code: 'SCCS',
    registrationNumber: 'E/2005/7890',
    societyType: 'Multi-Purpose Cooperative',
    email: 'info@sahodaya.example.com',
    phone: '+91 94000 00002',
    address: 'Sahodaya Plaza, MG Road',
    state: 'Kerala',
    city: 'Ernakulam',
    pincode: '682011',
    status: 'Active',
  },
  {
    _id: orgIds.greenValley,
    name: 'Green Valley Farmers Cooperative Society',
    code: 'GVFCS',
    registrationNumber: 'P/1985/1234',
    societyType: 'Agricultural Cooperative',
    email: 'admin@greenvalley.example.com',
    phone: '+91 94000 00003',
    address: 'Krishi Bhavan Road',
    state: 'Kerala',
    city: 'Palakkad',
    pincode: '678001',
    status: 'Active',
  },
  {
    _id: orgIds.malabarWelfare,
    name: 'Malabar Community Welfare Cooperative Society',
    code: 'MCWCS',
    registrationNumber: 'K/2010/5678',
    societyType: 'Credit Cooperative',
    email: 'support@malabarwelfare.example.com',
    phone: '+91 94000 00004',
    address: 'Welfare Tower, Mavoor Road',
    state: 'Kerala',
    city: 'Kozhikode',
    pincode: '673004',
    status: 'Active',
  }
];

module.exports = { organizations, orgIds };
