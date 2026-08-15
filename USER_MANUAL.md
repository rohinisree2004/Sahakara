# SAHAKARA ERP – USER MANUAL

A comprehensive, step-by-step user manual for **Sahakara ERP**: A Multi-Organization Cooperative Society ERP System built on the MERN stack (MongoDB, Express.js, React.js, Node.js) with Multi-Tenant isolation and Role-Based Access Control (RBAC).

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [User Roles & Permissions Overview](#2-user-roles--permissions-overview)
3. [Authentication & Login Flow](#3-authentication--login-flow)
4. [Landing Page Navigation & Society Registration](#4-landing-page-navigation--society-registration)
5. [Sidebar Navigation Matrix](#5-sidebar-navigation-matrix)
6. [Dashboard User Guide](#6-dashboard-user-guide)
7. [Module-by-Module Step-by-Step Guide](#7-module-by-module-step-by-step-guide)
   - [7.1 Organization Management](#71-organization-management)
   - [7.2 Branch Management](#72-branch-management)
   - [7.3 User Account Management](#73-user-account-management)
   - [7.4 Member Lifecycle Management](#74-member-lifecycle-management)
   - [7.5 Roles & Permissions Governance](#75-roles--permissions-governance)
   - [7.6 Member Groups (SHG / JLG)](#76-member-groups-shg--jlg)
   - [7.7 Savings Account Operations](#77-savings-account-operations)
   - [7.8 Loan Lifecycle Management](#78-loan-lifecycle-management)
   - [7.9 EMI & Repayment Operations](#79-emi--repayment-operations)
   - [7.10 Accounting & General Ledger](#710-accounting--general-ledger)
   - [7.11 Unified Transaction Center](#711-unified-transaction-center)
   - [7.12 Meeting & Governance Management](#712-meeting--governance-management)
8. [Profile, Settings & Notifications](#8-profile-settings--notifications)
9. [Logout & Session Expiration Flow](#9-logout--session-expiration-flow)
10. [Error & Empty State Handling](#10-error--empty-state-handling)
11. [Complete Role-Based User Journeys](#11-complete-role-based-user-journeys)
12. [Button-by-Button Quick Reference Guide](#12-button-by-button-quick-reference-guide)

---

## 1. Introduction

### What is Sahakara ERP?
**Sahakara ERP** is an enterprise-grade, web-based management system designed specifically for cooperative societies, credit unions, self-help group (SHG) federations, and joint liability group (JLG) networks. It digitizes the complete cooperative workflow—from member enrollment, savings deposits, and loan processing to double-entry accounting, meeting minutes, and financial reporting.

### What is Multi-Organization Architecture?
Sahakara ERP operates on a **multi-tenant architecture**. Multiple independent cooperative societies share the same software instance while maintaining total data separation. 
- **`organizationId` Isolation:** Data belonging to Society A is strictly invisible to users of Society B.
- **`branchId` Scoping:** Within a single society, operations can be filtered or restricted to specific branches.

### Main Purpose
- Streamline financial operations and eliminate paper passbooks.
- Enforce Role-Based Access Control (RBAC) across 8 distinct user tiers.
- Maintain a single source of truth using real-time MongoDB database aggregations.

---

## 2. User Roles & Permissions Overview

Sahakara ERP implements 8 distinct user roles:

| Role | Target User | Main Purpose | Default Dashboard Route |
|---|---|---|---|
| **Super Admin** | Platform Owner / Auditor | Platform governance, society onboarding, system monitoring | `/super-admin/dashboard` |
| **Organization Admin** | Society Administrator | Complete society operations, branch creation, user role management | `/org-admin/dashboard` |
| **President** | Board President | Senior executive oversight, high-level approvals, board governance | `/executive/dashboard` |
| **Secretary** | Board Secretary | Administrative oversight, member approvals, meeting governance | `/executive/dashboard` |
| **Treasurer** | Chief Financial Officer | Financial oversight, cash book management, double-entry accounting | `/executive/dashboard` |
| **Branch Manager** | Branch Manager | Operations within an assigned operational branch | `/branches/dashboard` |
| **Employee** | Office Staff / Field Worker | Member registration, recording deposits, issuing loan applications | `/employee/dashboard` |
| **Member** | Society Member | Self-service portal: view personal savings, loan status, EMI schedules | `/member/dashboard` |

---

## 3. Authentication & Login Flow

### Complete Step-by-Step Login Sequence

1. **Access Portal:** Open the web application URL (`http://localhost:5173/`).
2. **Navigate to Login:** On the public Landing Page header, click **Portal Login**.
3. **Redirection:** The system navigates to `/login`.
4. **Enter Credentials:**
   - **Email / Username Field:** Enter your registered email address (e.g., `admin@coop.org`) or username (e.g., `ku_admin`).
   - **Password Field:** Enter your password.
5. **Form Submission:** Click **Sign In to ERP Portal**.
6. **Backend Processing:** Credentials are sent via POST request to `/api/v1/auth/login`.
7. **Token Issuance & Role Detection:**
   - Upon verification, the backend generates a JWT token containing `id`, `role`, and `organizationId`.
   - The token is saved in browser storage (`LocalStorage`).
8. **Automatic Role Redirection:**
   - **Super Admin** $\rightarrow$ `/super-admin/dashboard`
   - **Organization Admin** $\rightarrow$ `/org-admin/dashboard`
   - **Branch Manager** $\rightarrow$ `/branches/dashboard`
   - **President / Secretary / Treasurer** $\rightarrow$ `/executive/dashboard`
   - **Employee** $\rightarrow$ `/employee/dashboard`
   - **Member** $\rightarrow$ `/member/dashboard`

---

## 4. Landing Page Navigation & Society Registration

The Landing Page (`/`) serves as the public face of the platform.

### Interactive Navigation Map

| Element / Button | Page Section / Action | Destination / Result |
|---|---|---|
| **SAHAKARA ERP Logo** | Top Header Brand | Scroll to top of `/` |
| **Features Link** | Navigation Item | Smooth scroll to `#features` section |
| **Multi-Tenant Security Link** | Navigation Item | Smooth scroll to `#architecture` section |
| **Benefits Link** | Navigation Item | Smooth scroll to `#benefits` section |
| **ERP Modules Link** | Navigation Item | Smooth scroll to `#flow` section |
| **Register Society** | Primary Action Button | Opens modal overlay `InquiryModal` |
| **Portal Login** | Auth Button | Redirects to `/login` |

### Society Registration Inquiry Flow (`InquiryModal`)
1. Click **Register Society** on the landing page header or hero section.
2. An overlay modal appears containing the **Society Onboarding Inquiry Form**.
3. **Fill Form Details:**
   - Society Name (Mandatory)
   - Registration Number
   - Contact Person Name (Mandatory)
   - Designation
   - Official Email Address (Mandatory)
   - Phone Number (Mandatory)
   - Estimated Member Count
   - Society Type (Select: Primary Agricultural, Credit Cooperative, Housing, Employees Cooperative)
   - State (Select State)
   - Message / Special Requirements
4. Click **Submit Registration Request**.
5. **Backend Processing:** Sends POST request to `/api/v1/landing/inquiry`.
6. **Result:** Data is recorded in MongoDB under the `Inquiry` collection with `Pending` status. A success notification is displayed in the modal, and Super Admin can view it under `/super-admin/approvals`.

---

## 5. Sidebar Navigation Matrix

The Master Sidebar (`src/components/common/Sidebar.jsx`) dynamically filters visible navigation items based on the logged-in user's role.

### Navigation Items & Role Visibility

```
Menu Item                Path                        Allowed Roles
---------------------------------------------------------------------------------------------------------
Main Dashboard           [Role Dashboard Path]       All Roles
Platform Governance      /super-admin/approvals      Super Admin
Organization Profile     /org-admin/profile          Super Admin, Org Admin, Execs (Pres/Sec/Treas)
Branch Management        /branches/dashboard         Super Admin, Org Admin, Execs, Employee
User Accounts            /users/dashboard            Super Admin, Org Admin, Execs
Member Lifecycle         /members/dashboard          Super Admin, Org Admin, Execs, Employee
Roles & Permissions      /roles/dashboard            Super Admin, Org Admin, Execs
Member Groups (SHG/JLG)  /groups/dashboard           Super Admin, Org Admin, Execs, Employee
Savings Management       /savings/dashboard          All Roles
Loan Management          /loans/dashboard            All Roles
EMI & Repayments         /repayments/dashboard       All Roles
Accounting & Ledgers     /accounting/dashboard       Super Admin, Org Admin, Execs, Branch Manager
Transaction Center       /transactions/dashboard     Super Admin, Org Admin, Execs, Branch Manager, Employee
Meetings & Governance    /meetings/dashboard         All Roles
Reports & Analytics      /members/reports            Super Admin, Org Admin, Execs, Employee
Audit Trail Logs         /users/logs                 Super Admin, Org Admin, Execs
Society Settings         /org-admin/settings         Super Admin, Org Admin
```

---

## 6. Dashboard User Guide

### 6.1 Super Admin Dashboard (`/super-admin/dashboard`)
- **Total Societies Card:** Displays total onboarded organizations. Click $\rightarrow$ `/super-admin/organizations`.
- **Pending Approvals Card:** Displays societies awaiting verification. Click $\rightarrow$ `/super-admin/approvals`.
- **Total Members Card:** Displays total members across all societies. Click $\rightarrow$ `/super-admin/monitoring`.
- **Active Loans Card:** Displays global disburse metrics. Click $\rightarrow$ `/super-admin/monitoring`.
- **Quick Action Cards:**
  - *Review Applications* $\rightarrow$ `/super-admin/approvals`
  - *Platform Health* $\rightarrow$ `/super-admin/monitoring`
  - *Audit Logs* $\rightarrow$ `/super-admin/audit-logs`

### 6.2 Organization Admin Dashboard (`/org-admin/dashboard`)
- **Total Members Card:** Active society members. Click $\rightarrow$ `/members/list`.
- **Operational Branches Card:** Active society branches. Click $\rightarrow$ `/org-admin/branches`.
- **Monthly Savings Card:** Total savings deposited. Click $\rightarrow$ `/savings/accounts`.
- **Active Loans Card:** Total active loans disbursed. Click $\rightarrow$ `/loans/active`.
- **Quick Action Cards:**
  - *Register Member* $\rightarrow$ `/members/register`
  - *New Loan Application* $\rightarrow$ `/loans/apply`
  - *Add User Account* $\rightarrow$ `/users/create`
  - *Schedule Meeting* $\rightarrow$ `/meetings/create`

### 6.3 Executive Dashboard (`/executive/dashboard`)
- Designed for **President**, **Secretary**, and **Treasurer**.
- Displays overall society financial stats, active membership stats, recent general body meetings, and pending approvals.
- **Quick Action Buttons:**
  - *View Members* $\rightarrow$ `/members/list`
  - *Loan Approvals* $\rightarrow$ `/loans/applications`
  - *Financial Statements* $\rightarrow$ `/accounting/trial-balance`

### 6.4 Branch Manager Dashboard (`/branches/dashboard`)
- Scoped strictly to the manager's assigned branch (`branchId`).
- **Cards:** Branch Members, Active Branch Loans, Branch Savings Pool, Branch Employees.
- **Quick Actions:**
  - *Manage Branch Staff* $\rightarrow$ `/branches/employees`
  - *Branch Members* $\rightarrow$ `/branches/members`
  - *Branch Reports* $\rightarrow$ `/branches/reports`

### 6.5 Employee Dashboard (`/employee/dashboard`)
- Designed for field officers and operational desk employees.
- **Focus:** Quick search for members, recording deposit transactions, issuing new loan applications, and checking upcoming meetings.

### 6.6 Member Dashboard (`/member/dashboard`)
- **Personal Balance Card:** Displays current savings account balance. Click $\rightarrow$ `/savings/accounts`.
- **Active Loans Card:** Displays active loan balance and EMI due dates. Click $\rightarrow$ `/loans/my-loans`.
- **Quick Actions:**
  - *Apply for Loan* $\rightarrow$ `/loans/apply`
  - *View Digital Passbook* $\rightarrow$ `/savings/dashboard`
  - *Repayment Schedule* $\rightarrow$ `/repayments/dashboard`

---

## 7. Module-by-Module Step-by-Step Guide

### 7.1 Organization Management

#### View & Edit Society Profile
1. Navigate to **Organization Profile** (`/org-admin/profile`).
2. Displays society name, registration number, state, date of establishment, and primary contact details.
3. Click **Edit Profile**.
4. Update fields in the form (Address, Email, Phone, Tax ID).
5. Click **Save Changes**. Form submits PUT to `/api/v1/organizations/my-org`. Page refreshes with updated information.

#### Manage Society Branches
1. Navigate to **Branch Management** (`/org-admin/branches`).
2. Table lists all operational branches.
3. Click **Add New Branch**.
4. Fill in Branch Name, Branch Code (e.g., `BR-01`), Address, Contact Phone, and Manager.
5. Click **Submit**. Sends POST to `/api/v1/branches`. New branch appears in table.

---

### 7.2 Branch Management

#### Assign Branch Manager
1. Navigate to **Branch Management** $\rightarrow$ Click **Assign Manager** (`/branches/manager-assign`).
2. Select target operational branch from dropdown.
3. Select eligible staff member from list.
4. Click **Assign Manager**. Updates `Branch.managerName` and `User.branchId` in MongoDB.

#### View Branch Reports
1. Navigate to **Branch Reports** (`/branches/reports`).
2. Select report type (Member Summary, Savings Ledger, Loan Outstanding).
3. Click **Generate Report**. Displays calculated statistics.

---

### 7.3 User Account Management

#### Onboard New Staff / User Account
1. Navigate to **User Accounts** $\rightarrow$ Click **Create User** (`/users/create`).
2. Fill Form:
   - Full Name
   - Email Address
   - Username
   - Password & Confirm Password
   - Phone Number
   - Role (Dropdown: Organization Admin, President, Secretary, Treasurer, Branch Manager, Employee, Member)
   - Assigned Branch (Dropdown)
3. Click **Save Account**. Submits POST to `/api/v1/users`. User account is created with encrypted bcrypt password.

#### Inter-Branch Staff Transfer
1. Navigate to **User Accounts** $\rightarrow$ Click **Branch Transfers** (`/users/transfers`).
2. Select staff user.
3. Select new Destination Branch.
4. Click **Execute Transfer**. Backend updates `User.branchId`.

---

### 7.4 Member Lifecycle Management

#### Register New Society Member
1. Navigate to **Member Lifecycle** $\rightarrow$ Click **Register Member** (`/members/register`).
2. **Step 1: Personal Details:** Name, Gender, DOB, Address, Phone, Email, District, State, Occupation.
3. **Step 2: Nominee Details:** Nominee Name, Relationship, Share Percentage (e.g. 100%), Nominee Phone.
4. **Step 3: KYC Details:** Aadhaar Number, PAN Number.
5. Click **Submit Member Application**.
6. Sends POST to `/api/v1/members`. System generates sequential Member ID (e.g., `MEM-2026-101`). Status is set to `Pending Approval`.

#### Membership Approval Desk
1. Log in as **Organization Admin**, **President**, or **Secretary**.
2. Navigate to **Member Lifecycle** $\rightarrow$ Click **Pending Approvals** (`/members/approvals`).
3. Click **Review Application** on a pending member record.
4. Click **Approve Membership** or **Reject Application**.
5. Upon approval, status changes to `Active`, allowing savings and loan account creation.

---

### 7.5 Roles & Permissions Governance

#### Create Custom Dynamic Role
1. Navigate to **Roles & Permissions** $\rightarrow$ Click **Create Role** (`/roles/create`).
2. Enter Role Name and Description.
3. **Permission Matrix Grid:** Check appropriate action boxes (`create`, `read`, `update`, `delete`, `approve`, `export`) across modules (Savings, Loans, Accounting, Meetings, etc.).
4. Click **Save Role**. Role document is saved in MongoDB under `roles` collection.

---

### 7.6 Member Groups (SHG / JLG)

#### Onboard Self-Help Group (SHG)
1. Navigate to **Member Groups** $\rightarrow$ Click **Create Group** (`/groups/create`).
2. Fill Group Name (e.g., `Mahila Pragati SHG`), Type (SHG or JLG), Branch, Description.
3. Click **Create Group**. Generates sequential Group Code (e.g. `GRP-2026-001`).
4. **Add Group Members:** In Group Profile (`/groups/profile/:id`), click **Add Member**, select members from list, and click **Confirm**.
5. **Assign Group Leader:** Click **Assign Leader**, select group member, click **Save**.

---

### 7.7 Savings Account Operations

#### Open Savings Account
1. Navigate to **Savings Management** $\rightarrow$ Click **New Account** (`/savings/accounts/create`).
2. Select Member from dropdown search.
3. Select Account Type (Regular Savings, SHG Group Savings, Fixed Deposit).
4. Enter Initial Deposit Amount.
5. Click **Create Savings Account**.
6. System generates Account Number (e.g. `SAV-2026-00001`) and sets balance.

#### Record Cash Deposit
1. Navigate to **Savings Management** $\rightarrow$ Click **Record Deposit** (`/savings/deposit`).
2. Select Member & Savings Account.
3. Enter Deposit Amount, Date, Payment Mode (Cash / Bank Transfer / Cheque), and Remarks.
4. Click **Process Deposit**.
5. **System Execution:**
   - Increments `SavingsAccount.balance`.
   - Creates record in `SavingsTransaction` collection.
   - Updates accounting ledger entries automatically.
   - Displays printable transaction receipt.

---

### 7.8 Loan Lifecycle Management

#### Step-by-Step Loan Application to Disbursement

```
[Member / Employee]       [Loan Reviewer]       [Board / Approver]       [Treasurer / Disburser]
      |                          |                      |                           |
 Apply for Loan            Review Application    Approve Application         Disburse Funds
  (/loans/apply)            (/loans/review/:id)   (/loans/approve/:id)       (/loans/disburse/:id)
      |                          |                      |                           |
  Status: Pending            Status: Reviewed      Status: Approved            Status: Disbursed / Active
```

1. **Loan Application (`/loans/apply`):**
   - Select Member, Loan Product (e.g. Agricultural Loan, Personal Loan), Requested Amount, Duration (months), and Purpose.
   - Click **Submit Loan Application**. Status set to `Pending`.
2. **Technical & Financial Review (`/loans/review/:id`):**
   - Credit officer inspects applicant's savings balance, credit history, and collateral documents.
   - Click **Submit Review**. Status set to `Reviewed`.
3. **Board Approval (`/loans/approve/:id`):**
   - Log in as President or Org Admin.
   - Review credit score and application details. Enter Approved Amount and Interest Rate (%).
   - Click **Approve Loan**. Status updated to `Approved`.
4. **Loan Disbursement (`/loans/disburse/:id`):**
   - Log in as Treasurer.
   - Select Payment Method (Cash / Bank Transfer), Reference Number, and Date.
   - Click **Execute Disbursement**.
   - **System Execution:**
     - Status updated to `Disbursed`.
     - Generates EMI Repayment Schedule automatically.
     - Creates transaction record in Transaction Center and posts debit entry to accounting ledger.

---

### 7.9 EMI & Repayment Operations

#### Record Loan EMI Repayment
1. Navigate to **EMI & Repayments** $\rightarrow$ Click **Record Repayment** (`/repayments/record`).
2. Search and select Active Loan.
3. Displays next due EMI installment details (Principal, Interest, Due Date).
4. Enter Amount Received, Payment Mode, and Date.
5. Click **Submit Repayment**.
6. **System Execution:**
   - Updates EMI installment status to `Paid`.
   - Reduces outstanding loan balance.
   - Creates Repayment Transaction and posts income entry in General Ledger.

---

### 7.10 Accounting & General Ledger

#### View Chart of Accounts & General Ledger
1. Navigate to **Accounting & Ledgers** (`/accounting/dashboard`).
2. Click **Chart of Accounts** (`/accounting/accounts`) to inspect assets, liabilities, equity, income, and expense heads.
3. Click **General Ledger** (`/accounting/ledger`) to filter double-entry vouchers by account head or date range.
4. Click **Trial Balance** (`/accounting/trial-balance`) to verify debit and credit equilibrium.

---

### 7.11 Unified Transaction Center

#### Inspect System Transactions
1. Navigate to **Transaction Center** (`/transactions/dashboard`).
2. Table lists all financial operations triggered across Savings, Loans, EMI Repayments, and Accounting.
3. Click **View Details** on any transaction to inspect source module parameters, user ID, timestamp, and audit metadata.

---

### 7.12 Meeting & Governance Management

#### Schedule & Conduct Society Meeting
1. Navigate to **Meetings & Governance** $\rightarrow$ Click **Schedule Meeting** (`/meetings/create`).
2. Enter Meeting Title, Meeting Type (Board Meeting, AGM, Branch Advisory), Date, Time, Location, and Agenda points.
3. Select invited participants. Click **Save Meeting**.
4. **Mark Attendance:** On Meeting Details page (`/meetings/details/:id`), click **Record Attendance**, check present members, click **Save**.
5. **Record Minutes:** Click **Add Minutes**, enter decision details, and click **Finalize Minutes**.

---

## 8. Profile, Settings & Notifications

### View & Edit User Profile
1. Click your User Name in the sidebar footer or top navbar.
2. Select **My Profile**.
3. View account details, assigned role, and contact information.
4. Click **Edit Profile** to update phone or email address. Click **Save**.

### Society Settings (`/org-admin/settings`)
1. Accessible by Organization Admin.
2. Configure Financial Year start/end dates, base currency (`INR ₹`), notification triggers, and auto-approval thresholds.
3. Click **Save Settings**.

---

## 9. Logout & Session Expiration Flow

1. Click **Logout Session** located at the bottom of the Master Sidebar.
2. The frontend triggers `logout()` from `AuthContext`.
3. Clears JWT token and user payload from `LocalStorage`.
4. Redirects browser to `/login`.
5. Any subsequent attempt to navigate to protected routes via back-button or direct URL will be intercepted by `ProtectedRoute` and redirected to `/login`.

---

## 10. Error & Empty State Handling

| Scenario | What the User Sees | System Behavior / Action Required |
|---|---|---|
| **No Data in Collection** | "No records found" / Empty state placeholder illustration | Display clean empty table with "Add New" button |
| **Unauthorized Access (403)** | `/unauthorized` Error Page ("Access Denied") | User lacks permissions; click "Back to Dashboard" |
| **Invalid URL / Route (404)** | `/404` Not Found Page | Route does not exist; click "Return to Home" |
| **API Server Offline** | Red Toast / Alert: "Server unreachable" | Ensure backend server (`node server.js`) is running |
| **Form Validation Error** | Red inline field messages (e.g. "Email is required") | User must correct field values before submission |

---

## 11. Complete Role-Based User Journeys

### Journey 1: Super Admin (Platform Owner)
`Login (/login)` $\rightarrow$ `Super Admin Dashboard (/super-admin/dashboard)` $\rightarrow$ `Review Society Applications (/super-admin/approvals)` $\rightarrow$ `Approve Society` $\rightarrow$ `Platform Health Monitoring (/super-admin/monitoring)` $\rightarrow$ `Audit Logs (/super-admin/audit-logs)` $\rightarrow$ `Logout`.

### Journey 2: Organization Admin (Society Head)
`Login (/login)` $\rightarrow$ `Org Dashboard (/org-admin/dashboard)` $\rightarrow$ `Onboard Branch (/org-admin/branches)` $\rightarrow$ `Create Staff Account (/users/create)` $\rightarrow$ `Approve Member Enrollment (/members/approvals)` $\rightarrow$ `Review Society Financials (/accounting/dashboard)` $\rightarrow$ `Logout`.

### Journey 3: Branch Manager
`Login (/login)` $\rightarrow$ `Branch Dashboard (/branches/dashboard)` $\rightarrow$ `View Branch Members (/branches/members)` $\rightarrow$ `Branch Loan Applications (/loans/applications)` $\rightarrow$ `Branch Operational Reports (/branches/reports)` $\rightarrow$ `Logout`.

### Journey 4: Treasurer (CFO)
`Login (/login)` $\rightarrow$ `Executive Dashboard (/executive/dashboard)` $\rightarrow$ `Review Approved Loans (/loans/applications)` $\rightarrow$ `Execute Loan Disbursement (/loans/disburse/:id)` $\rightarrow$ `Inspect Cash Ledger (/accounting/ledger)` $\rightarrow$ `Logout`.

### Journey 5: Member (Self-Service)
`Login (/login)` $\rightarrow$ `Member Dashboard (/member/dashboard)` $\rightarrow$ `View Savings Passbook (/savings/dashboard)` $\rightarrow$ `Apply for Loan (/loans/apply)` $\rightarrow$ `Check EMI Schedule (/repayments/dashboard)` $\rightarrow$ `Logout`.

---

## 12. Button-by-Button Quick Reference Guide

### Page: Member Management (`/members/list`)

| Button / Action | What Happens | Destination / Result |
|---|---|---|
| **Register Member** | Opens member enrollment wizard | `/members/register` |
| **Pending Approvals** | Opens board approval queue | `/members/approvals` |
| **View Profile** | Opens detailed member dossier | `/members/profile/:id` |
| **Edit Profile** | Opens editable member form | Updates Member document in DB |
| **Savings** | Views member savings accounts | `/savings/accounts/:id` |
| **Loans** | Views member loan history | `/loans/details/:id` |

### Page: Loan Management (`/loans/dashboard`)

| Button / Action | What Happens | Destination / Result |
|---|---|---|
| **Apply for Loan** | Opens loan application form | `/loans/apply` |
| **Loan Products** | Opens configurable loan types | `/loans/types` |
| **Review Queue** | Opens credit review desk | `/loans/review/:id` |
| **Approve Loan** | Opens board approval modal | Updates Loan status to `Approved` |
| **Disburse Funds** | Opens disbursement voucher form | `/loans/disburse/:id` |

### Page: Savings Management (`/savings/dashboard`)

| Button / Action | What Happens | Destination / Result |
|---|---|---|
| **New Savings Account** | Opens account creation wizard | `/savings/accounts/create` |
| **Record Cash Deposit** | Opens deposit entry form | `/savings/deposit` |
| **View Passbook** | Displays digital passbook ledger | `/savings/passbook/:accountId` |
| **Transactions** | Lists savings transaction records | `/savings/transactions` |

---

*Manual compiled for **SAHAKARA ERP** – Verified against MongoDB & Mongoose Schema implementations.*
