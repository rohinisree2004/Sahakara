import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth, getDashboardRoute } from './contexts/AuthContext';
import { ActiveContextProvider } from './contexts/ActiveContextContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const DashboardRedirect = () => {
  const { user } = useAuth();
  const target = getDashboardRoute(user?.role);
  return <Navigate to={target} replace />;
};

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
import PublicRegisterPage from './pages/auth/PublicRegisterPage';

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

// Module 16 Communication, Complaints, & Closures
import ChatPage from './pages/communication/ChatPage';
import ComplaintsPage from './pages/support/ComplaintsPage';
import AccountClosurePage from './pages/support/AccountClosurePage';

// Dedicated Role Dashboards
import ExecutiveDashboard from './pages/dashboards/ExecutiveDashboard';
import GroupSecretaryDashboard from './pages/dashboards/GroupSecretaryDashboard';
import GroupTreasurerDashboard from './pages/dashboards/GroupTreasurerDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import MemberDashboard from './pages/dashboards/MemberDashboard';
import GroupSelectionPage from './pages/auth/GroupSelectionPage';

// Common Role Groups for RBAC
const ALL_STAFF_AND_ADMINS = ['Super Admin', 'Organization Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer', 'Employee'];
const ALL_ADMINS_AND_EXECUTIVES = ['Super Admin', 'Organization Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer'];
const SOCIETY_ADMIN_ONLY = ['Super Admin', 'Organization Admin'];
const ALL_PORTAL_ROLES = ['Super Admin', 'Organization Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member'];

function App() {
  return (
    <AuthProvider>
      <ActiveContextProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<PublicRegisterPage />} />
          <Route path="/auth/register" element={<PublicRegisterPage />} />
          <Route path="/member-enrollment" element={<PublicRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Group Perspective Selection Gateway */}
          <Route
            path="/select-group"
            element={
              <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                <GroupSelectionPage />
              </ProtectedRoute>
            }
          />

          {/* Master Authenticated ERP Portal wrapped in MainLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* 1. Super Admin Platform Module */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboardPage />} />
              <Route path="approvals" element={<OrganizationApprovalsPage />} />
              <Route path="organizations" element={<OrganizationListPage />} />
              <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
              <Route path="monitoring" element={<PlatformMonitoringPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* 2. Organization Admin Module */}
            <Route
              path="/org-admin"
              element={
                <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OrgDashboardPage />} />
              <Route path="profile" element={<OrgProfilePage />} />
              <Route path="branches" element={<OrgBranchesPage />} />
              <Route path="employees" element={<OrgEmployeesPage />} />
              <Route path="statistics" element={<OrgStatsPage />} />
              <Route path="logs" element={<OrgActivityLogsPage />} />
              <Route path="settings" element={<OrgSettingsPage />} />
            </Route>

            {/* 3. Branch Management Module */}
            <Route
              path="/branches"
              element={
                <ProtectedRoute allowedRoles={ALL_STAFF_AND_ADMINS}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
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

            {/* 4. User Accounts & Staff Management */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="list" element={<UserListPage />} />
              <Route path="create" element={<CreateUserPage />} />
              <Route path="profile/:id" element={<UserProfilePage />} />
              <Route path="transfers" element={<UserBranchTransferPage />} />
              <Route path="reports" element={<UserReportsPage />} />
              <Route path="logs" element={<UserActivityLogsPage />} />
            </Route>

            {/* 5. Member Lifecycle Management */}
            <Route
              path="/members"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<MemberDashboardPage />} />
              <Route path="list" element={<MemberListPage />} />
              <Route path="register" element={<MemberRegisterPage />} />
              <Route path="profile/:id" element={<MemberProfilePage />} />
              <Route
                path="approvals"
                element={
                  <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                    <MemberApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="kyc" element={<MemberKYCPage />} />
              <Route path="reports" element={<MemberReportsPage />} />
              <Route path="logs" element={<MemberActivityLogsPage />} />
            </Route>

            {/* 6. Roles & Permissions RBAC Module */}
            <Route
              path="/roles"
              element={
                <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardPage />} />
              <Route path="list" element={<RoleListPage />} />
              <Route path="create" element={<CreateRolePage />} />
              <Route path="details/:id" element={<RoleDetailsPage />} />
              <Route path="assign" element={<RoleAssignPage />} />
              <Route path="review" element={<UserAccessReviewPage />} />
              <Route path="logs" element={<RoleActivityLogsPage />} />
            </Route>

            {/* 7. Group Management (SHG / JLG) Module */}
            <Route
              path="/groups"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<GroupDashboardPage />} />
              <Route path="list" element={<GroupListPage />} />
              <Route path="create" element={<CreateGroupPage />} />
              <Route path="profile/:id" element={<GroupProfilePage />} />
              <Route path="leader" element={<GroupLeaderPage />} />
              <Route path="leaders" element={<GroupLeaderPage />} />
              <Route path="executives" element={<GroupLeaderPage />} />
              <Route path="assign-leaders" element={<GroupLeaderPage />} />
              <Route path="leadership" element={<GroupLeaderPage />} />
              <Route path="members" element={<GroupMembersPage />} />
              <Route path="members-assign" element={<GroupMembersPage />} />
              <Route path="assign-members" element={<GroupMembersPage />} />
              <Route path="reports" element={<GroupReportsPage />} />
              <Route path="logs" element={<GroupActivityLogsPage />} />
            </Route>

            {/* 8. Savings Management Module */}
            <Route
              path="/savings"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SavingsDashboardPage />} />
              <Route path="accounts" element={<SavingsAccountsPage />} />
              <Route path="accounts/create" element={<CreateSavingsAccountPage />} />
              <Route path="accounts/:id" element={<MemberSavingsProfilePage />} />
              <Route path="deposit" element={<RecordDepositPage />} />
              <Route path="transactions" element={<SavingsTransactionsPage />} />
              <Route path="passbook" element={<PassbookPage />} />
              <Route path="passbook/:accountId" element={<PassbookPage />} />
              <Route path="settings" element={<SavingsSettingsPage />} />
            </Route>

            {/* 9. Loan Management Module */}
            <Route
              path="/loans"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LoanDashboardPage />} />
              <Route path="types" element={<LoanTypesPage />} />
              <Route path="apply" element={<LoanApplicationPage />} />
              <Route path="my-loans" element={<MyLoansPage />} />
              <Route path="applications" element={<LoanApplicationListPage />} />
              <Route path="active" element={<ActiveLoansPage />} />
              <Route path="details/:id" element={<LoanDetailsPage />} />
              <Route path="review/:id" element={<LoanReviewPage />} />
              <Route
                path="approve/:id"
                element={
                  <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                    <LoanApprovalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="disburse/:id"
                element={
                  <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                    <LoanDisbursementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 10. Repayment Management Module */}
            <Route
              path="/repayments"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RepaymentDashboardPage />} />
              <Route path="schedule/:loanId" element={<EmiSchedulePage />} />
              <Route path="record" element={<RecordRepaymentPage />} />
              <Route path="transactions" element={<RepaymentTransactionHistoryPage />} />
              <Route path="upcoming" element={<UpcomingEmiPage />} />
              <Route path="overdue" element={<OverdueEmiPage />} />
            </Route>

            {/* 11. Accounting & General Ledgers Module */}
            <Route
              path="/accounting"
              element={
                <ProtectedRoute allowedRoles={ALL_ADMINS_AND_EXECUTIVES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AccountingDashboardPage />} />
              <Route path="accounts" element={<ChartOfAccountsPage />} />
              <Route path="journals" element={<JournalEntryPage />} />
              <Route path="ledger" element={<GeneralLedgerPage />} />
              <Route path="trial-balance" element={<TrialBalancePage />} />
            </Route>

            {/* 12. Transaction Management Module */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TransactionDashboardPage />} />
              <Route path="list" element={<TransactionListPage />} />
              <Route path=":id" element={<TransactionDetailsPage />} />
            </Route>

            {/* 13. Meeting Management Module */}
            <Route
              path="/meetings"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<MeetingDashboardPage />} />
              <Route path="calendar" element={<MeetingCalendarPage />} />
              <Route path="list" element={<MeetingListPage />} />
              <Route path="create" element={<CreateMeetingPage />} />
              <Route path="edit/:id" element={<EditMeetingPage />} />
              <Route path="details/:id" element={<MeetingDetailsPage />} />
              <Route path=":id" element={<MeetingDetailsPage />} />
              <Route path="reports" element={<MeetingReportsPage />} />
            </Route>

            {/* 14. Communication Chat Hub */}
            <Route
              path="/communication/chat"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            {/* 15. Complaints & Grievance Redressal Desk */}
            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/complaints"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support/complaints"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />

            {/* 16. Account Closure & Settlement Desk */}
            <Route
              path="/account-closures"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <AccountClosurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/account-closure"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <AccountClosurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support/account-closure"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <AccountClosurePage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Role Dashboard Landing Pages */}
            <Route
              path="/executive/dashboard"
              element={
                <ProtectedRoute allowedRoles={['President', 'Secretary', 'Treasurer', 'Organization Admin', 'Super Admin']}>
                  <ExecutiveDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/secretary/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Secretary', 'President', 'Organization Admin', 'Super Admin']}>
                  <GroupSecretaryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/treasurer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Treasurer', 'President', 'Organization Admin', 'Super Admin']}>
                  <GroupTreasurerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Branch Manager', 'Organization Admin', 'Super Admin']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Member', 'Organization Admin', 'Super Admin']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            {/* Top-Level Member Routes */}
            <Route
              path="/passbook"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <PassbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passbook/:accountId"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <PassbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-loans"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <MyLoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-savings"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <PassbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            {/* Global Context-Aware Dashboard Index */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={ALL_PORTAL_ROLES}>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Wildcard 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Router>
      </ActiveContextProvider>
    </AuthProvider>
  );
}

export default App;
