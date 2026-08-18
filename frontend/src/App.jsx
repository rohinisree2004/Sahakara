import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Master Layouts
import MainLayout from './layouts/MainLayout';

// Global Error Pages
import NotFoundPage from './pages/common/NotFoundPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage';

// Module 1 Pages
import LandingPage from './pages/landing/LandingPage';

// Module 2 Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Module 3 Super Admin Pages
import SuperAdminDashboardPage from './pages/superAdmin/SuperAdminDashboardPage';
import OrganizationApprovalsPage from './pages/superAdmin/OrganizationApprovalsPage';
import OrganizationListPage from './pages/superAdmin/OrganizationListPage';
import OrganizationDetailsPage from './pages/superAdmin/OrganizationDetailsPage';
import PlatformMonitoringPage from './pages/superAdmin/PlatformMonitoringPage';
import SystemSettingsPage from './pages/superAdmin/SystemSettingsPage';
import AuditLogsPage from './pages/superAdmin/AuditLogsPage';

// Module 4 Organization Admin Pages
import OrgDashboardPage from './pages/orgAdmin/OrgDashboardPage';
import OrgProfilePage from './pages/orgAdmin/OrgProfilePage';
import OrgBranchesPage from './pages/orgAdmin/OrgBranchesPage';
import OrgEmployeesPage from './pages/orgAdmin/OrgEmployeesPage';
import OrgStatsPage from './pages/orgAdmin/OrgStatsPage';
import OrgActivityLogsPage from './pages/orgAdmin/OrgActivityLogsPage';
import OrgSettingsPage from './pages/orgAdmin/OrgSettingsPage';

// Module 5 Branch Management Pages
import BranchDashboardPage from './pages/branchManager/BranchDashboardPage';
import BranchManagementPage from './pages/branchManager/BranchManagementPage';
import BranchProfilePage from './pages/branchManager/BranchProfilePage';
import BranchManagerAssignPage from './pages/branchManager/BranchManagerAssignPage';
import BranchEmployeesPage from './pages/branchManager/BranchEmployeesPage';
import BranchMembersPage from './pages/branchManager/BranchMembersPage';
import BranchReportsPage from './pages/branchManager/BranchReportsPage';
import BranchActivityLogsPage from './pages/branchManager/BranchActivityLogsPage';

// Module 6 User Management Pages
import UserDashboardPage from './pages/userManagement/UserDashboardPage';
import UserListPage from './pages/userManagement/UserListPage';
import CreateUserPage from './pages/userManagement/CreateUserPage';
import UserProfilePage from './pages/userManagement/UserProfilePage';
import UserBranchTransferPage from './pages/userManagement/UserBranchTransferPage';
import UserReportsPage from './pages/userManagement/UserReportsPage';
import UserActivityLogsPage from './pages/userManagement/UserActivityLogsPage';

// Module 7 Member Management Pages
import MemberDashboardPage from './pages/memberManagement/MemberDashboardPage';
import MemberListPage from './pages/memberManagement/MemberListPage';
import MemberRegisterPage from './pages/memberManagement/MemberRegisterPage';
import MemberProfilePage from './pages/memberManagement/MemberProfilePage';
import MemberApprovalsPage from './pages/memberManagement/MemberApprovalsPage';
import MemberKYCPage from './pages/memberManagement/MemberKYCPage';
import MemberReportsPage from './pages/memberManagement/MemberReportsPage';
import MemberActivityLogsPage from './pages/memberManagement/MemberActivityLogsPage';

// Module 8 Roles & Permissions Pages
import RoleDashboardPage from './pages/roleManagement/RoleDashboardPage';
import RoleListPage from './pages/roleManagement/RoleListPage';
import CreateRolePage from './pages/roleManagement/CreateRolePage';
import RoleDetailsPage from './pages/roleManagement/RoleDetailsPage';
import RoleAssignPage from './pages/roleManagement/RoleAssignPage';
import UserAccessReviewPage from './pages/roleManagement/UserAccessReviewPage';
import RoleActivityLogsPage from './pages/roleManagement/RoleActivityLogsPage';

// Module 9 Group Management Pages
import GroupDashboardPage from './pages/groupManagement/GroupDashboardPage';
import GroupListPage from './pages/groupManagement/GroupListPage';
import CreateGroupPage from './pages/groupManagement/CreateGroupPage';
import GroupProfilePage from './pages/groupManagement/GroupProfilePage';
import GroupLeaderPage from './pages/groupManagement/GroupLeaderPage';
import GroupMembersPage from './pages/groupManagement/GroupMembersPage';
import GroupReportsPage from './pages/groupManagement/GroupReportsPage';
import GroupActivityLogsPage from './pages/groupManagement/GroupActivityLogsPage';

// Module 10 Savings Management Pages
import SavingsDashboardPage from './pages/savings/SavingsDashboardPage';
import SavingsAccountsPage from './pages/savings/SavingsAccountsPage';
import CreateSavingsAccountPage from './pages/savings/CreateSavingsAccountPage';
import MemberSavingsProfilePage from './pages/savings/MemberSavingsProfilePage';
import RecordDepositPage from './pages/savings/RecordDepositPage';
import SavingsTransactionsPage from './pages/savings/SavingsTransactionsPage';
import PassbookPage from './pages/savings/PassbookPage';
import SavingsSettingsPage from './pages/savings/SavingsSettingsPage';

// Module 11 Loan Management Pages
import LoanDashboardPage from './pages/loans/LoanDashboardPage';
import LoanTypesPage from './pages/loans/LoanTypesPage';
import LoanApplicationPage from './pages/loans/LoanApplicationPage';
import MyLoansPage from './pages/loans/MyLoansPage';
import LoanApplicationListPage from './pages/loans/LoanApplicationListPage';
import LoanDetailsPage from './pages/loans/LoanDetailsPage';
import LoanReviewPage from './pages/loans/LoanReviewPage';
import LoanApprovalPage from './pages/loans/LoanApprovalPage';
import LoanDisbursementPage from './pages/loans/LoanDisbursementPage';
import ActiveLoansPage from './pages/loans/ActiveLoansPage';

// Module 12 Repayment Management Pages
import RepaymentDashboardPage from './pages/repayments/RepaymentDashboardPage';
import EmiSchedulePage from './pages/repayments/EmiSchedulePage';
import RecordRepaymentPage from './pages/repayments/RecordRepaymentPage';
import RepaymentTransactionHistoryPage from './pages/repayments/RepaymentTransactionHistoryPage';
import UpcomingEmiPage from './pages/repayments/UpcomingEmiPage';
import OverdueEmiPage from './pages/repayments/OverdueEmiPage';

// Module 13 Accounting Pages
import AccountingDashboardPage from './pages/accounting/AccountingDashboardPage';
import ChartOfAccountsPage from './pages/accounting/ChartOfAccountsPage';
import JournalEntryPage from './pages/accounting/JournalEntryPage';
import GeneralLedgerPage from './pages/accounting/GeneralLedgerPage';
import TrialBalancePage from './pages/accounting/TrialBalancePage';

// Module 14 Transaction Management Pages
import TransactionDashboardPage from './pages/transactions/TransactionDashboardPage';
import TransactionListPage from './pages/transactions/TransactionListPage';
import TransactionDetailsPage from './pages/transactions/TransactionDetailsPage';

// Module 15 Meeting Management Pages
import MeetingDashboardPage from './pages/meetings/MeetingDashboardPage';
import MeetingCalendarPage from './pages/meetings/MeetingCalendarPage';
import MeetingListPage from './pages/meetings/MeetingListPage';
import CreateMeetingPage from './pages/meetings/CreateMeetingPage';
import EditMeetingPage from './pages/meetings/EditMeetingPage';
import MeetingDetailsPage from './pages/meetings/MeetingDetailsPage';
import MeetingReportsPage from './pages/meetings/MeetingReportsPage';

// Role Dashboards Placeholders
import ExecutiveDashboard from './pages/dashboards/ExecutiveDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import MemberDashboard from './pages/dashboards/MemberDashboard';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Master Authenticated ERP Portal wrapped in MainLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Super Admin Module */}
            <Route path="/super-admin">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboardPage />} />
              <Route path="approvals" element={<OrganizationApprovalsPage />} />
              <Route path="organizations" element={<OrganizationListPage />} />
              <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
              <Route path="monitoring" element={<PlatformMonitoringPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Organization Admin Module */}
            <Route path="/org-admin">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OrgDashboardPage />} />
              <Route path="profile" element={<OrgProfilePage />} />
              <Route path="branches" element={<OrgBranchesPage />} />
              <Route path="employees" element={<OrgEmployeesPage />} />
              <Route path="statistics" element={<OrgStatsPage />} />
              <Route path="logs" element={<OrgActivityLogsPage />} />
              <Route path="settings" element={<OrgSettingsPage />} />
            </Route>

            {/* Branch Management Module */}
            <Route path="/branches">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BranchDashboardPage />} />
              <Route path="management" element={<BranchManagementPage />} />
              <Route path="profile/:id" element={<BranchProfilePage />} />
              <Route path="manager-assign" element={<BranchManagerAssignPage />} />
              <Route path="employees" element={<BranchEmployeesPage />} />
              <Route path="members" element={<BranchMembersPage />} />
              <Route path="reports" element={<BranchReportsPage />} />
              <Route path="logs" element={<BranchActivityLogsPage />} />
            </Route>

            {/* User Management Module */}
            <Route path="/users">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="list" element={<UserListPage />} />
              <Route path="create" element={<CreateUserPage />} />
              <Route path="profile/:id" element={<UserProfilePage />} />
              <Route path="transfers" element={<UserBranchTransferPage />} />
              <Route path="reports" element={<UserReportsPage />} />
              <Route path="logs" element={<UserActivityLogsPage />} />
            </Route>

            {/* Member Management Module */}
            <Route path="/members">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<MemberDashboardPage />} />
              <Route path="list" element={<MemberListPage />} />
              <Route path="register" element={<MemberRegisterPage />} />
              <Route path="profile/:id" element={<MemberProfilePage />} />
              <Route path="approvals" element={<MemberApprovalsPage />} />
              <Route path="kyc" element={<MemberKYCPage />} />
              <Route path="reports" element={<MemberReportsPage />} />
              <Route path="logs" element={<MemberActivityLogsPage />} />
            </Route>

            {/* Roles & Permissions Module */}
            <Route path="/roles">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardPage />} />
              <Route path="list" element={<RoleListPage />} />
              <Route path="create" element={<CreateRolePage />} />
              <Route path="details/:id" element={<RoleDetailsPage />} />
              <Route path="assign" element={<RoleAssignPage />} />
              <Route path="review" element={<UserAccessReviewPage />} />
              <Route path="logs" element={<RoleActivityLogsPage />} />
            </Route>

            {/* Group Management Module */}
            <Route path="/groups">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<GroupDashboardPage />} />
              <Route path="list" element={<GroupListPage />} />
              <Route path="create" element={<CreateGroupPage />} />
              <Route path="profile/:id" element={<GroupProfilePage />} />
              <Route path="leader" element={<GroupLeaderPage />} />
              <Route path="members" element={<GroupMembersPage />} />
              <Route path="reports" element={<GroupReportsPage />} />
              <Route path="logs" element={<GroupActivityLogsPage />} />
            </Route>

            {/* Savings Management Module */}
            <Route path="/savings">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SavingsDashboardPage />} />
              <Route path="accounts" element={<SavingsAccountsPage />} />
              <Route path="accounts/create" element={<CreateSavingsAccountPage />} />
              <Route path="accounts/:id" element={<MemberSavingsProfilePage />} />
              <Route path="deposit" element={<RecordDepositPage />} />
              <Route path="transactions" element={<SavingsTransactionsPage />} />
              <Route path="passbook/:accountId" element={<PassbookPage />} />
              <Route path="settings" element={<SavingsSettingsPage />} />
            </Route>

            {/* Loan Management Module */}
            <Route path="/loans">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LoanDashboardPage />} />
              <Route path="types" element={<LoanTypesPage />} />
              <Route path="apply" element={<LoanApplicationPage />} />
              <Route path="my-loans" element={<MyLoansPage />} />
              <Route path="applications" element={<LoanApplicationListPage />} />
              <Route path="active" element={<ActiveLoansPage />} />
              <Route path="details/:id" element={<LoanDetailsPage />} />
              <Route path="review/:id" element={<LoanReviewPage />} />
              <Route path="approve/:id" element={<LoanApprovalPage />} />
              <Route path="disburse/:id" element={<LoanDisbursementPage />} />
            </Route>

            {/* Repayment Management Module */}
            <Route path="/repayments">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RepaymentDashboardPage />} />
              <Route path="schedule/:loanId" element={<EmiSchedulePage />} />
              <Route path="record" element={<RecordRepaymentPage />} />
              <Route path="transactions" element={<RepaymentTransactionHistoryPage />} />
              <Route path="upcoming" element={<UpcomingEmiPage />} />
              <Route path="overdue" element={<OverdueEmiPage />} />
            </Route>

            {/* Accounting Module */}
            <Route path="/accounting">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AccountingDashboardPage />} />
              <Route path="accounts" element={<ChartOfAccountsPage />} />
              <Route path="journals" element={<JournalEntryPage />} />
              <Route path="ledger" element={<GeneralLedgerPage />} />
              <Route path="trial-balance" element={<TrialBalancePage />} />
            </Route>

            {/* Transaction Management Module */}
            <Route path="/transactions">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TransactionDashboardPage />} />
              <Route path="list" element={<TransactionListPage />} />
              <Route path=":id" element={<TransactionDetailsPage />} />
            </Route>

            {/* Meeting Management Module */}
            <Route path="/meetings">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<MeetingDashboardPage />} />
              <Route path="calendar" element={<MeetingCalendarPage />} />
              <Route path="list" element={<MeetingListPage />} />
              <Route path="create" element={<CreateMeetingPage />} />
              <Route path="edit/:id" element={<EditMeetingPage />} />
              <Route path="details/:id" element={<MeetingDetailsPage />} />
              <Route path="reports" element={<MeetingReportsPage />} />
            </Route>

            {/* Dashboards for Other Roles */}
            <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/member/dashboard" element={<MemberDashboard />} />
          </Route>

          {/* Wildcard 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
