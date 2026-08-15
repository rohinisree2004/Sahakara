const mongoose = require('mongoose');
const { orgIds } = require('./organizations');
const { branchIds } = require('./branches');
const { memberIds } = require('./members');
const { userIds } = require('./users');
const { loanTypeIds } = require('./loanTypes');

const loanIds = {};
const loans = [];
const loanReviews = [];

const createLoanData = (orgId, branchId, prefix, loanTypeId, memberKeys, amounts, createdBy, presidentId) => {
  memberKeys.forEach((key, i) => {
    const loanId = new mongoose.Types.ObjectId();
    loanIds[`${prefix}${i+1}`] = loanId;
    
    // Statuses based on index to show different states
    const statuses = ['Pending', 'Under Review', 'Approved', 'Disbursed', 'Active'];
    const status = statuses[i % statuses.length];
    
    const requestedAmount = amounts[i];
    const approvedAmount = ['Approved', 'Disbursed', 'Active'].includes(status) ? requestedAmount : 0;
    const disbursedAmount = ['Disbursed', 'Active'].includes(status) ? requestedAmount : 0;

    loans.push({
      _id: loanId,
      organizationId: orgId,
      branchId: branchId,
      memberId: memberIds[key],
      loanTypeId: loanTypeId,
      applicationId: `APP-${prefix}-${202600 + i}`,
      requestedAmount: requestedAmount,
      approvedAmount: approvedAmount,
      disbursedAmount: disbursedAmount,
      outstandingAmount: disbursedAmount, // Starting outstanding is disbursed amount
      interestRate: 11.5,
      tenure: 12,
      purpose: 'Development/Agriculture',
      status: status,
      applicationDate: new Date(2026, 0, 10 + i),
      approvalDate: ['Approved', 'Disbursed', 'Active'].includes(status) ? new Date(2026, 0, 15 + i) : null,
      approvedBy: ['Approved', 'Disbursed', 'Active'].includes(status) ? presidentId : null,
      disbursementDate: ['Disbursed', 'Active'].includes(status) ? new Date(2026, 0, 20 + i) : null,
      disbursedBy: ['Disbursed', 'Active'].includes(status) ? createdBy : null,
      createdBy: createdBy,
    });

    if (['Under Review', 'Approved', 'Disbursed', 'Active'].includes(status)) {
      loanReviews.push({
        _id: new mongoose.Types.ObjectId(),
        organizationId: orgId,
        loanId: loanId,
        reviewerId: createdBy,
        action: 'Started Review',
        remarks: 'Documents verified and found correct.',
        reviewedAt: new Date(2026, 0, 12 + i)
      });
    }

    if (['Approved', 'Disbursed', 'Active'].includes(status)) {
      loanReviews.push({
        _id: new mongoose.Types.ObjectId(),
        organizationId: orgId,
        loanId: loanId,
        reviewerId: presidentId,
        action: 'Approved',
        remarks: 'Approved after checking eligibility and CIBIL score.',
        reviewedAt: new Date(2026, 0, 15 + i)
      });
    }
  });
};

createLoanData(orgIds.keralaUnity, branchIds.kottayamMain, 'KU', loanTypeIds.kuPersonal, ['KU1', 'KU2', 'KU3', 'KU4', 'KU5'], [25000, 50000, 75000, 100000, 20000], userIds.kuAdmin, userIds.kuPresident);
createLoanData(orgIds.sahodaya, branchIds.ernakulamMain, 'SA', loanTypeIds.saPersonal, ['SA1', 'SA2', 'SA3'], [50000, 75000, 100000], userIds.saAdmin, userIds.saPresident);
createLoanData(orgIds.greenValley, branchIds.palakkadMain, 'GV', loanTypeIds.gvAgriculture, ['GV1', 'GV2', 'GV3'], [30000, 60000, 90000], userIds.gvAdmin, userIds.gvPresident);
createLoanData(orgIds.malabarWelfare, branchIds.kozhikodeMain, 'MW', loanTypeIds.mwBusiness, ['MW1', 'MW2', 'MW3'], [100000, 200000, 300000], userIds.mwAdmin, userIds.mwPresident);

module.exports = { loans, loanIds, loanReviews };
