// Assuming there is a Notification model, but looking at models list, there might not be one.
// Let's check if Notification.js exists in models. If not, I won't seed it.
// Checking models dir again: it has AuditLog, Branch, Group, Inquiry, Loan, LoanDocument, LoanReview, LoanType, Member, OTP, Organization, OrganizationSetting, Permission, Role, SavingsAccount, SavingsTransaction, SystemSetting, User.
// There is no Notification.js in models! 
// I will not seed Notifications.

module.exports = { notifications: [] };
