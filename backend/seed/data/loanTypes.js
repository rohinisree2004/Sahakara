const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { userIds } = require('./users');

const loanTypeIds = {
  kuPersonal: new mongoose.Types.ObjectId(),
  kuAgriculture: new mongoose.Types.ObjectId(),
  kuEducation: new mongoose.Types.ObjectId(),
  kuEmergency: new mongoose.Types.ObjectId(),
  saPersonal: new mongoose.Types.ObjectId(),
  saHousing: new mongoose.Types.ObjectId(),
  gvAgriculture: new mongoose.Types.ObjectId(),
  mwBusiness: new mongoose.Types.ObjectId(),
};

const createLoanTypes = (orgId, createdBy, prefix, specificTypes) => {
  return specificTypes.map(type => ({
    _id: type.id,
    organizationId: orgId,
    name: type.name,
    description: `${type.name} for members`,
    interestRate: type.rate,
    minimumAmount: 5000,
    maximumAmount: 500000,
    maximumTenure: 60,
    status: 'Active',
    createdBy: createdBy
  }));
};

const loanTypes = [
  ...createLoanTypes(orgIds.keralaUnity, userIds.kuAdmin, 'KU', [
    { id: loanTypeIds.kuPersonal, name: 'Personal Loan', rate: 11.5 },
    { id: loanTypeIds.kuAgriculture, name: 'Agricultural Loan', rate: 8.5 },
    { id: loanTypeIds.kuEducation, name: 'Education Loan', rate: 9.0 },
    { id: loanTypeIds.kuEmergency, name: 'Emergency Loan', rate: 12.0 },
  ]),
  ...createLoanTypes(orgIds.sahodaya, userIds.saAdmin, 'SA', [
    { id: loanTypeIds.saPersonal, name: 'Personal Loan', rate: 11.0 },
    { id: loanTypeIds.saHousing, name: 'Housing Loan', rate: 9.5 },
  ]),
  ...createLoanTypes(orgIds.greenValley, userIds.gvAdmin, 'GV', [
    { id: loanTypeIds.gvAgriculture, name: 'Farmers Support Loan', rate: 7.5 },
  ]),
  ...createLoanTypes(orgIds.malabarWelfare, userIds.mwAdmin, 'MW', [
    { id: loanTypeIds.mwBusiness, name: 'Micro Business Loan', rate: 10.5 },
  ])
];

module.exports = { loanTypes, loanTypeIds };
