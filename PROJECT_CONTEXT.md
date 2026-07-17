# SAHAKARA ERP - Project Memory & Context

## Project Information
- **Project Name**: SAHAKARA ERP (A Multi-Organization Cooperative Society ERP System)
- **Developer Role**: Senior MERN Stack Developer & Lead Software Architect
- **Tech Stack**:
  - **Frontend**: React.js (Vite), React Router v6, Tailwind CSS v3, Context API, Axios, Lucide Icons, React Icons
  - **Backend**: Node.js, Express.js, MongoDB, Mongoose, Multer
  - **Authentication**: JWT, bcryptjs, OTP verification
  - **File Storage**: Multer (Local Disk Storage)
  - **Tools**: VS Code, Git, Postman
- **Architecture**: Multi-Tenant (Organization Data Isolation via `organizationId`), 7-Level Role-Based Access Control (RBAC), MVC pattern.
- **Current Status**: **ERP Functionality Audit & Demo Data Purge Completed!** Modules 1-15 fully tested & integrated with strict RBAC. Ready for **Module 16 (Document Management)**.

---

## Recent Updates
- **ERP Functionality Audit (Completed)**: 
  - Verified and strictly enforced RBAC and Multi-Tenant Isolation (Organizations & Branches).
  - Purged all hardcoded frontend data, static fallback objects in backend controllers, and mock UI data.
  - Re-wrote Dashboard aggregation queries to calculate live metrics directly from MongoDB.
  - Successfully executed a comprehensive Database Seed Script with real valid ObjectIDs.
  - Confirmed 15 active modules behave properly as a unified ERP system.
- **User Manual & Progress Tracker (Completed)**:
  - Created `USER_MANUAL.md` covering step-by-step guides, button-by-button references, and role-based user journeys.
  - Initialized `SAHAKARA_ERP_PROGRESS.md` as the master project progress tracker monitoring module completion, database models, role RBAC matrix, test results, and fix queue.

## Workspace Structure
```
SAHAKARA_ERP/
├── NAVIGATION_MAP.md
├── PROJECT_CONTEXT.md
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── branchController.js
│   │   ├── groupController.js
│   │   ├── landingController.js
│   │   ├── memberController.js
│   │   ├── orgController.js
│   │   ├── roleController.js
│   │   ├── savingsController.js
│   │   ├── superAdminController.js
│   │   └── userManagementController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── multerUpload.js
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Branch.js
│   │   ├── Group.js
│   │   ├── Inquiry.js
│   │   ├── Member.js
│   │   ├── Organization.js
│   │   ├── OrganizationSetting.js
│   │   ├── OTP.js
│   │   ├── Permission.js
│   │   ├── Role.js
│   │   ├── SavingsAccount.js
│   │   ├── SavingsTransaction.js
│   │   ├── SystemSetting.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── branchRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── landingRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── orgRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── savingsRoutes.js
│   │   ├── superAdminRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   │   └── seedDB.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Breadcrumbs.jsx
    │   │       ├── ProtectedRoute.jsx
    │   │       └── Sidebar.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   ├── layouts/
    │   │   ├── BranchManagerLayout.jsx
    │   │   ├── GroupManagementLayout.jsx
    │   │   ├── MainLayout.jsx
    │   │   ├── MemberManagementLayout.jsx
    │   │   ├── OrgAdminLayout.jsx
    │   │   ├── RoleManagementLayout.jsx
    │   │   ├── SuperAdminLayout.jsx
    │   │   └── UserManagementLayout.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── ForgotPasswordPage.jsx
    │   │   ├── branchManager/
    │   │   │   ├── BranchDashboardPage.jsx
    │   │   │   ├── BranchManagementPage.jsx
    │   │   │   ├── BranchProfilePage.jsx
    │   │   │   ├── BranchManagerAssignPage.jsx
    │   │   │   ├── BranchEmployeesPage.jsx
    │   │   │   ├── BranchMembersPage.jsx
    │   │   │   ├── BranchReportsPage.jsx
    │   │   │   └── BranchActivityLogsPage.jsx
    │   │   ├── common/
    │   │   │   ├── NotFoundPage.jsx
    │   │   │   └── UnauthorizedPage.jsx
    │   │   ├── dashboards/
    │   │   │   ├── ExecutiveDashboard.jsx
    │   │   │   ├── EmployeeDashboard.jsx
    │   │   │   └── MemberDashboard.jsx
    │   │   ├── groupManagement/
    │   │   │   ├── GroupDashboardPage.jsx
    │   │   │   ├── GroupListPage.jsx
    │   │   │   ├── CreateGroupPage.jsx
    │   │   │   ├── GroupProfilePage.jsx
    │   │   │   ├── GroupLeaderPage.jsx
    │   │   │   ├── GroupMembersPage.jsx
    │   │   │   ├── GroupReportsPage.jsx
    │   │   │   └── GroupActivityLogsPage.jsx
    │   │   ├── landing/
    │   │   │   └── LandingPage.jsx
    │   │   ├── memberManagement/
    │   │   │   ├── MemberDashboardPage.jsx
    │   │   │   ├── MemberListPage.jsx
    │   │   │   ├── MemberRegisterPage.jsx
    │   │   │   ├── MemberProfilePage.jsx
    │   │   │   ├── MemberApprovalsPage.jsx
    │   │   │   ├── MemberKYCPage.jsx
    │   │   │   ├── MemberReportsPage.jsx
    │   │   │   └── MemberActivityLogsPage.jsx
    │   │   ├── orgAdmin/
    │   │   │   ├── OrgDashboardPage.jsx
    │   │   │   ├── OrgProfilePage.jsx
    │   │   │   ├── OrgBranchesPage.jsx
    │   │   │   ├── OrgEmployeesPage.jsx
    │   │   │   ├── OrgStatsPage.jsx
    │   │   │   ├── OrgActivityLogsPage.jsx
    │   │   │   └── OrgSettingsPage.jsx
    │   │   ├── roleManagement/
    │   │   │   ├── RoleDashboardPage.jsx
    │   │   │   ├── RoleListPage.jsx
    │   │   │   ├── CreateRolePage.jsx
    │   │   │   ├── RoleDetailsPage.jsx
    │   │   │   ├── RoleAssignPage.jsx
    │   │   │   ├── UserAccessReviewPage.jsx
    │   │   │   └── RoleActivityLogsPage.jsx
    │   │   ├── superAdmin/
    │   │   │   ├── SuperAdminDashboardPage.jsx
    │   │   │   ├── OrganizationApprovalsPage.jsx
    │   │   │   ├── OrganizationListPage.jsx
    │   │   │   ├── OrganizationDetailsPage.jsx
    │   │   │   ├── PlatformMonitoringPage.jsx
    │   │   │   ├── SystemSettingsPage.jsx
    │   │   │   └── AuditLogsPage.jsx
    │   │   └── userManagement/
    │   │       ├── UserDashboardPage.jsx
    │   │       ├── UserListPage.jsx
    │   │       ├── CreateUserPage.jsx
    │   │       ├── UserProfilePage.jsx
    │   │       ├── UserBranchTransferPage.jsx
    │   │       ├── UserReportsPage.jsx
    │   │       └── UserActivityLogsPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── vite.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## Module Development Order
1. ✅ **Module 1: Landing Website** (Completed)
2. ✅ **Module 2: Authentication** (Completed)
3. ✅ **Module 3: Super Admin** (Completed)
4. ✅ **Module 4: Organization Management** (Completed)
5. ✅ **Module 5: Branch Management** (Completed)
6. ✅ **Module 6: User Management** (Completed)
7. ✅ **Module 7: Member Management** (Completed)
8. ✅ **Module 8: Roles & Permissions** (Completed)
9. ✅ **Module 9: Group Management** (Completed)
10. ✅ **Module 10: Savings Management** (Completed)
11. ✅ **Module 11: Loan Management** (Completed)
12. ✅ **Module 12: EMI & Repayment** (Completed)
13. ✅ **Module 13: Accounting** (Completed)
14. ✅ **Module 14: Transaction Management** (Completed)
15. ✅ **Module 15: Meeting Management** (Completed)
16. 🟡 **Module 16: Document Management** (IN PROGRESS)
17. ⚪ Module 17: Communication
18. ⚪ Module 18: Reports & Analytics
19. ⚪ Module 19: Dashboard
20. ⚪ Module 20: Profile Management
21. ⚪ Module 21: Notifications
22. ⚪ Module 22: Search & Filter
23. ⚪ Module 23: Audit Logs
24. ⚪ Module 24: Settings
25. ⚪ Module 25: Help & Support

---

## Completed & Integrated Modules (1 - 11)

### Module 1: Landing Website
- **Purpose**: Public portal detailing platform features, multi-tenant security architecture, 25 ERP modules, stats, and registration inquiry modal.
- **Pages**: `LandingPage.jsx` (`/`)
- **Components**: `LandingNavbar`, `HeroSection`, `FeaturesSection`, `BenefitsSection`, `InquiryModal`, `LandingFooter`.
- **Routes**: `/` (Frontend), `/api/v1/landing` (Backend).

### Module 2: Authentication
- **Purpose**: Multi-tenant RBAC authentication system supporting all 7 platform roles, JWT token issuance, bcrypt password hashing, login via Email or Username, Remember Me, 3-step Forgot Password OTP workflow, and role-based dashboard redirection.
- **Pages**: `LoginPage.jsx` (`/login`), `ForgotPasswordPage.jsx` (`/forgot-password`).

### Module 3: Super Admin Module
- **Purpose**: Master platform governance portal for the Super Admin. Oversees all cooperative societies, manages organization onboarding approvals & rejections with remarks, provisions Org Admin accounts, manages tenant suspension & soft deletes, monitors server health & latency, edits master ERP system settings, and inspects audit trail logs.
- **Pages**: `SuperAdminDashboardPage.jsx`, `OrganizationApprovalsPage.jsx`, `OrganizationListPage.jsx`, `OrganizationDetailsPage.jsx`, `PlatformMonitoringPage.jsx`, `SystemSettingsPage.jsx`, `AuditLogsPage.jsx`.

### Module 4: Organization Management
- **Purpose**: Independent administration portal for approved cooperative societies. Enforces strict `organizationId` multi-tenant data isolation. Allows Organization Admins, Presidents, Secretaries, and Treasurers to manage society profile details, upload emblems/logos via Multer, create and soft delete operational branches, view staff directory, inspect financial growth analytics, update financial year & currency settings, and review tenant audit logs.
- **Pages**: `OrgDashboardPage.jsx`, `OrgProfilePage.jsx`, `OrgBranchesPage.jsx`, `OrgEmployeesPage.jsx`, `OrgStatsPage.jsx`, `OrgActivityLogsPage.jsx`, `OrgSettingsPage.jsx`.

### Module 5: Branch Management
- **Purpose**: Multi-branch administration and branch operations portal. Enables societies to create multiple operational branches linked via `organizationId`, enforcing compound unique `branchCode` validation per organization. Supports Branch Manager assignment, branch staff scoping (`branchId`), branch member overview, branch operational reports (Member, Savings, Loan, Transaction, Attendance) with PDF & Excel export options, and branch-specific audit trail logs.
- **Pages**: `BranchDashboardPage.jsx`, `BranchManagementPage.jsx`, `BranchProfilePage.jsx`, `BranchManagerAssignPage.jsx`, `BranchEmployeesPage.jsx`, `BranchMembersPage.jsx`, `BranchReportsPage.jsx`, `BranchActivityLogsPage.jsx`.

### Module 6: User Management
- **Purpose**: Centralized user governance, role assignment, bcrypt password resets, inter-branch staff transfers, and user audit logging portal. Manages accounts across all 7 platform roles (`Super Admin`, `Organization Admin`, `President`, `Secretary`, `Treasurer`, `Employee`, `Member`). Enforces strict `organizationId` scoping, unique email and username validation, admin password reset workflows, activate/deactivate account toggles, and exportable user distribution reports.
- **Pages**: `UserDashboardPage.jsx`, `UserListPage.jsx`, `CreateUserPage.jsx`, `UserProfilePage.jsx`, `UserBranchTransferPage.jsx`, `UserReportsPage.jsx`, `UserActivityLogsPage.jsx`.

### Module 7: Member Management
- **Purpose**: Comprehensive cooperative society member lifecycle management portal. Handles new member enrollment with automatic sequential Membership ID generation (`MEM-2026-101`), Multer photo and KYC document uploads (Aadhaar & PAN), nominee information with percentage share, family member details, board membership approvals and rejection with remarks, Aadhaar & PAN KYC document verification desk, digital membership certificate generation, member suspension/reactivation, exportable PDF & Excel reports, and member audit logging.
- **Pages**: `MemberDashboardPage.jsx`, `MemberListPage.jsx`, `MemberRegisterPage.jsx`, `MemberProfilePage.jsx`, `MemberApprovalsPage.jsx`, `MemberKYCPage.jsx`, `MemberReportsPage.jsx`, `MemberActivityLogsPage.jsx`.

### Module 8: Roles & Permissions
- **Purpose**: Granular Role-Based Access Control (RBAC) governance portal. Provides dynamic custom role creation, interactive Permission Matrix Grid mapping (13 ERP modules x 8 action types `create`, `read`, `update`, `delete`, `approve`, `export`, `upload`, `download`), role cloning, user role assignment, reusable `checkPermission(moduleName, actionName)` authorization middleware, effective user access reviews, and permission audit logging.
- **Pages**: `RoleDashboardPage.jsx`, `RoleListPage.jsx`, `CreateRolePage.jsx`, `RoleDetailsPage.jsx`, `RoleAssignPage.jsx`, `UserAccessReviewPage.jsx`, `RoleActivityLogsPage.jsx`.

### Module 9: Group Management
- **Purpose**: Self-Help Group (SHG) & Joint Liability Group (JLG) onboarding and administration portal. Handles new group registration with automatic sequential Group Code generation (`GRP-2026-001`, `SHG-JP-101`), group leader assignment desk, member group allocation & inter-group member transfers, group financial position overview (savings pool & joint loan portfolio), exportable PDF & Excel reports, and group audit logging.
- **Pages**: `GroupDashboardPage.jsx`, `GroupListPage.jsx`, `CreateGroupPage.jsx`, `GroupProfilePage.jsx`, `GroupLeaderPage.jsx`, `GroupMembersPage.jsx`, `GroupReportsPage.jsx`, `GroupActivityLogsPage.jsx`.

### Module 10: Savings Management
- **Purpose**: Handles complete savings account lifecycle for cooperative society members in a multi-tenant multi-branch setup (`organizationId`, `branchId`, `memberId`). Supports account opening (`SAV-2026-00001`), deposit processing with instant passbook & transaction ledger updates, digital passbook generation, transaction history with date & type filtering, org/branch statistics, and audit logging.
- **Pages**: `SavingsDashboardPage.jsx`, `SavingsAccountsPage.jsx`, `CreateSavingsAccountPage.jsx`, `MemberSavingsProfilePage.jsx`, `RecordDepositPage.jsx`, `SavingsTransactionsPage.jsx`, `PassbookPage.jsx`, `SavingsSettingsPage.jsx`.

### Module 11: Loan Management
- **Purpose**: Handles the complete lifecycle of cooperative society loans, including configurable loan products, eligibility validation, applications, a multi-step review-approval-disbursement workflow, and document management with Local Disk Storage (Multer). Enforces strict Multi-Organization and Multi-Branch data isolation.
- **Pages**: `LoanDashboardPage.jsx`, `LoanTypesPage.jsx`, `LoanApplicationPage.jsx`, `MyLoansPage.jsx`, `LoanApplicationListPage.jsx`, `LoanDetailsPage.jsx`, `LoanReviewPage.jsx`, `LoanApprovalPage.jsx`, `LoanDisbursementPage.jsx`, `ActiveLoansPage.jsx`.

---

## Integrated Architecture & Global Navigation Overview
- **Unified Master Sidebar**: `src/components/common/Sidebar.jsx` dynamically renders sidebar items based on `user.role`.
- **Dynamic Breadcrumbs**: `src/components/common/Breadcrumbs.jsx` provides a clickable path trail across deep nested pages.
- **Global Error Handling**:
  - `src/pages/common/NotFoundPage.jsx` for 404 Route Not Found.
  - `src/pages/common/UnauthorizedPage.jsx` for 403 Forbidden Access.
- **Master ERP Layout**: `src/layouts/MainLayout.jsx` wraps Sidebar, Breadcrumbs, top header with global search, role badge, and `<Outlet />`.
- **Dashboard Quick Action Cards**: All dashboards (Super Admin, Org Admin, Branch Manager, User, Member, Role, Group) now feature quick action cards linking directly to sub-modules.
- **Navigation Map Document**: See `NAVIGATION_MAP.md` for complete page hierarchy, parent-child routes, and role flows.

---

## Database Status
- **Collections**: `inquiries`, `users`, `otps`, `organizations`, `systemsettings`, `auditlogs`, `branches`, `organizationsettings`, `members`, `roles`, `permissions`, `groups`, `savingsaccounts`, `savingstransactions`.
- **Compound Unique Indexes**:
  - `branches`: `{ organizationId: 1, branchCode: 1 }`
  - `members`: `{ organizationId: 1, memberId: 1 }`
  - `groups`: `{ organizationId: 1, groupCode: 1 }`
  - `permissions`: `{ module: 1, action: 1 }`
  - `savingsaccounts`: `{ organizationId: 1, memberId: 1, accountType: 1 }`

---

## Next Module
- **Module 16: Document Management**
  - Features: Document storage, document categorization, verification workflows, search & archive.
