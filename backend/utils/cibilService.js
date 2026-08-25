/**
 * Fake CIBIL / Credit Bureau Service
 * Generates deterministic, realistic credit bureau scores and detailed credit reports.
 */

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a realistic CIBIL credit report for a borrower
 * @param {Object} params - { memberId, name, phone, pan, requestedAmount }
 * @returns {Object} Full credit score & analysis report
 */
exports.generateCibilReport = (params = {}) => {
  const seedString = `${params.memberId || ''}-${params.pan || ''}-${params.phone || ''}-${params.name || 'Member'}`;
  const seed = hashString(seedString);

  // Score range 590 - 835
  const baseScore = 620 + (seed % 200); // 620 to 819
  // Minor adjustment
  const score = Math.min(880, Math.max(540, baseScore));

  let rating = 'Good';
  let riskLevel = 'Low Risk';
  let color = 'emerald';

  if (score >= 750) {
    rating = 'Excellent (Prime+)';
    riskLevel = 'Very Low Risk';
    color = 'emerald';
  } else if (score >= 700) {
    rating = 'Good (Prime)';
    riskLevel = 'Low Risk';
    color = 'teal';
  } else if (score >= 650) {
    rating = 'Fair (Near Prime)';
    riskLevel = 'Moderate Risk';
    color = 'amber';
  } else if (score >= 600) {
    rating = 'Average (Subprime)';
    riskLevel = 'Elevated Risk';
    color = 'orange';
  } else {
    rating = 'Poor (Deep Subprime)';
    riskLevel = 'High Risk';
    color = 'rose';
  }

  const activeAccounts = 1 + (seed % 3);
  const onTimePaymentRate = (94 + (seed % 60) / 10).toFixed(1); // 94.0% to 99.9%
  const creditUtilization = 10 + (seed % 35); // 10% to 44%
  const creditAgeYears = (2 + (seed % 80) / 10).toFixed(1); // 2.0 to 9.9 years
  const recentInquiries = seed % 3;
  const totalDebt = (seed % 5 + 1) * 15000;

  const reportId = `CIBIL-IN-${new Date().getFullYear()}-${String(seed % 900000 + 100000)}`;

  let summary = '';
  if (score >= 700) {
    summary = 'Demonstrates consistent on-time payment track record with optimal credit utilization and zero default history.';
  } else if (score >= 650) {
    summary = 'Satisfactory repayment record with moderate revolving credit usage. Regular member thrift savings observed.';
  } else {
    summary = 'Recent inquiries and elevated debt exposure observed. Suggest verifying peer-guarantor backing before sanction.';
  }

  return {
    score,
    rating,
    riskLevel,
    color,
    reportId,
    checkedAt: new Date(),
    bureau: 'TransUnion CIBIL (Simulated)',
    factors: {
      onTimePaymentRate: `${onTimePaymentRate}%`,
      creditUtilization: `${creditUtilization}%`,
      activeCreditAccounts: activeAccounts,
      totalExistingDebt: totalDebt,
      creditAgeYears: `${creditAgeYears} yrs`,
      recentInquiries
    },
    summary,
    recommendation: score >= 650 
      ? 'Credit profile satisfies standard society credit underwriting standards.' 
      : 'Requires enhanced guarantor endorsement or collateral evaluation.'
  };
};
