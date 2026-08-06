/**
 * Calculate EMI and generate an amortization schedule.
 * 
 * @param {Number} principal - The initial loan amount.
 * @param {Number} annualInterestRate - The annual interest rate in percentage (e.g., 10 for 10%).
 * @param {Number} tenureMonths - The total number of months for the loan.
 * @param {Date} startDate - The date when the first EMI will be due (typically 1 month after disbursement).
 * @returns {Object} An object containing the EMI amount and the full amortization schedule.
 */
const calculateEMI = (principal, annualInterestRate, tenureMonths, startDate) => {
  // Convert annual interest rate percentage to monthly decimal
  const monthlyInterestRate = (annualInterestRate / 12) / 100;
  
  // Calculate EMI using reducing balance formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  let emiAmount = 0;
  
  if (monthlyInterestRate > 0) {
    emiAmount = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
  } else {
    emiAmount = principal / tenureMonths; // Zero interest case
  }
  
  // Round to nearest integer (standard practice for loans)
  emiAmount = Math.round(emiAmount);
  
  const schedule = [];
  let remainingPrincipal = principal;
  
  const start = new Date(startDate);
  
  for (let i = 1; i <= tenureMonths; i++) {
    // Interest for this month
    const interestForMonth = Math.round(remainingPrincipal * monthlyInterestRate);
    
    // Principal for this month
    let principalForMonth = emiAmount - interestForMonth;
    
    // Handle the last EMI rounding differences
    if (i === tenureMonths) {
      principalForMonth = remainingPrincipal;
      emiAmount = principalForMonth + interestForMonth;
    }
    
    remainingPrincipal -= principalForMonth;
    
    // Calculate due date (increment month by month)
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + (i - 1));
    
    schedule.push({
      emiNumber: i,
      dueDate: dueDate,
      principalAmount: principalForMonth,
      interestAmount: interestForMonth,
      emiAmount: emiAmount,
      remainingAmount: Math.abs(Math.round(remainingPrincipal)), // Math.abs to avoid -0
    });
  }
  
  return {
    emiAmount,
    totalInterest: schedule.reduce((sum, item) => sum + item.interestAmount, 0),
    totalPayable: schedule.reduce((sum, item) => sum + item.emiAmount, 0),
    schedule,
  };
};

module.exports = {
  calculateEMI,
};
