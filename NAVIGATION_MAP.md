# SAHAKARA ERP - Master Navigation & Integration Map

This document details the complete page hierarchy, parent-child routes, role flows, sidebar layout structure, and navigation diagrams across all 9 completed modules in **SAHAKARA ERP**.

---

## 1. User Role Flow Diagrams

### 🌐 Public Landing Flow
```
Landing Page (/) ──► About ──► Features ──► Benefits ──► Inquiry Modal ──► Login (/login)
```

### 👑 Super Admin Flow
```
Login (/login) ──► Super Admin Dashboard (/super-admin/dashboard)
                       ├── Pending Approvals (/super-admin/approvals)
                       ├── Organizations (/super-admin/organizations)
                       │     └── Organization Details (/super-admin/organizations/:id)
                       ├── Platform Monitoring (/super-admin/monitoring)
                       ├── Audit Logs (/super-admin/audit-logs)
                       └── System Settings (/super-admin/settings)
```

### 🏢 Organization Admin Flow
```
Login (/login) ──► Organization Dashboard (/org-admin/dashboard)
                       ├── Society Profile (/org-admin/profile)
                       ├── Branch Management (/branches/dashboard)
                       │     ├── Branch Registry (/branches/management)
                       │     ├── Branch Profile (/branches/profile/:id)
                       │     ├── Manager Assignment (/branches/manager-assign)
                       │     ├── Branch Staff (/branches/employees)
                       │     ├── Branch Members (/branches/members)
                       │     └── Branch Reports (/branches/reports)
                       ├── User Management (/users/dashboard)
                       │     ├── User Directory (/users/list)
                       │     ├── Create User (/users/create)
                       │     ├── User Profile (/users/profile/:id)
                       │     ├── Branch Transfers (/users/transfers)
                       │     └── User Reports (/users/reports)
                       ├── Member Management (/members/dashboard)
                       │     ├── Member Registry (/members/list)
                       │     ├── New Enrollment (/members/register)
                       │     ├── Member Profile (/members/profile/:id)
                       │     ├── Pending Approvals (/members/approvals)
                       │     ├── KYC Verification (/members/kyc)
                       │     └── Member Reports (/members/reports)
                       ├── Roles & Permissions (/roles/dashboard)
                       │     ├── Matrix Registry (/roles/list)
                       │     ├── Create Custom Role (/roles/create)
                       │     ├── Role Details (/roles/details/:id)
                       │     ├── User Role Assignment (/roles/assign)
                       │     └── Access Review (/roles/review)
                       ├── Group Management (/groups/dashboard)
                       │     ├── Group Registry (/groups/list)
                       │     ├── Create Group (/groups/create)
                       │     ├── Group Profile (/groups/profile/:id)
                       │     ├── Leader Desk (/groups/leader)
                       │     └── Member Allocation (/groups/members)
                       └── Society Settings (/org-admin/settings)
```

### 🏢 Branch Manager & Employee Flow
```
Login (/login) ──► Dashboard (/branches/dashboard or /employee/dashboard)
                       ├── Members (/members/list)
                       │     └── Register New Member (/members/register)
                       ├── Member Groups (/groups/list)
                       │     └── Member Allocation (/groups/members)
                       ├── Operational Reports (/members/reports)
                       └── Profile & Settings (/users/profile/:id)
```

---

## 2. Master Route Hierarchy & Module Map

| Module | Route | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` | Public | Public landing page, features, inquiry modal |
| **Auth** | `/login` | Public | JWT login with Email/Username |
| **Auth** | `/forgot-password` | Public | 3-step OTP password recovery |
| **Super Admin** | `/super-admin/dashboard` | Super Admin | Master platform metrics & health |
| **Super Admin** | `/super-admin/approvals` | Super Admin | Tenant registration approvals |
| **Super Admin** | `/super-admin/organizations` | Super Admin | List all registered societies |
| **Super Admin** | `/super-admin/monitoring` | Super Admin | System performance & server latency |
| **Super Admin** | `/super-admin/settings` | Super Admin | Platform-wide config settings |
| **Super Admin** | `/super-admin/audit-logs` | Super Admin | Master platform audit trail |
| **Org Admin** | `/org-admin/dashboard` | Org Admin, Super Admin, Execs | Society dashboard with Quick Action cards |
| **Org Admin** | `/org-admin/profile` | Org Admin, Super Admin, Execs | Society profile & emblem upload |
| **Org Admin** | `/org-admin/branches` | Org Admin, Super Admin, Execs | Branch overview & analytics |
| **Org Admin** | `/org-admin/settings` | Org Admin, Super Admin | Currency & financial year settings |
| **Branch Ops** | `/branches/dashboard` | Staff / Admins | Multi-branch operations hub |
| **Branch Ops** | `/branches/management` | Staff / Admins | Branch list, add & soft delete |
| **Branch Ops** | `/branches/profile/:id` | Staff / Admins | Branch details & manager assignment |
| **Branch Ops** | `/branches/reports` | Staff / Admins | Branch PDF & Excel export reports |
| **User Mgmt** | `/users/dashboard` | Admins / Execs | User metrics & role distribution |
| **User Mgmt** | `/users/list` | Admins / Execs | Searchable user directory & bcrypt reset |
| **User Mgmt** | `/users/create` | Admins / Execs | Account onboarding form |
| **User Mgmt** | `/users/transfers` | Admins / Execs | Inter-branch staff transfer desk |
| **User Mgmt** | `/users/reports` | Admins / Execs | User distribution reports |
| **Member Mgmt** | `/members/dashboard` | Staff / Admins | Member metrics & growth charts |
| **Member Mgmt** | `/members/list` | Staff / Admins | Member registry & status toggles |
| **Member Mgmt** | `/members/register` | Staff / Admins | Enrollment wizard & KYC upload |
| **Member Mgmt** | `/members/profile/:id` | Staff / Admins | Profile & Digital Membership Certificate |
| **Member Mgmt** | `/members/approvals` | Board / Admins | Board application approval desk |
| **Member Mgmt** | `/members/kyc` | Staff / Admins | Aadhaar & PAN document verification |
| **Member Mgmt** | `/members/reports` | Staff / Admins | Member reports with PDF/Excel export |
| **RBAC** | `/roles/dashboard` | Admins / Execs | RBAC metrics & permission stats |
| **RBAC** | `/roles/list` | Admins / Execs | Matrix registry & role cloning |
| **RBAC** | `/roles/create` | Admins / Execs | Interactive 13x8 Permission Checkbox Grid |
| **RBAC** | `/roles/assign` | Admins / Execs | User-to-Role assignment desk |
| **RBAC** | `/roles/review` | Admins / Execs | User effective access inspection |
| **Group Mgmt** | `/groups/dashboard` | Staff / Admins | SHG / JLG metrics & growth charts |
| **Group Mgmt** | `/groups/list` | Staff / Admins | Group registry & status controls |
| **Group Mgmt** | `/groups/create` | Staff / Admins | SHG/JLG group registration form |
| **Group Mgmt** | `/groups/profile/:id` | Staff / Admins | Group profile, roster & financials |
| **Group Mgmt** | `/groups/leader` | Staff / Admins | Group leader assignment desk |
| **Group Mgmt** | `/groups/members` | Staff / Admins | Member allocation & inter-group transfer |
| **Group Mgmt** | `/groups/reports` | Staff / Admins | Group member, savings & loan reports |
| **Global 404** | `*` | All | 404 Page Not Found error handler |
| **Global 403** | `/unauthorized` | All | 403 Access Denied error handler |

---

## 3. Sidebar Navigation Hierarchy (Unified Master Sidebar)

```
SAHAKARA ERP
├── Main Dashboard (/org-admin/dashboard)
├── Platform Governance (/super-admin/approvals) [Super Admin Only]
├── Organization Profile (/org-admin/profile)
├── Branch Management (/branches/dashboard)
├── User Accounts (/users/dashboard)
├── Member Lifecycle (/members/dashboard)
├── Roles & Permissions (/roles/dashboard)
├── Member Groups (SHG/JLG) (/groups/dashboard)
├── Reports & Analytics (/members/reports)
├── Audit Trail Logs (/users/logs)
├── Society Settings (/org-admin/settings)
├── Savings Management (/savings/dashboard)
├── Loan Management (/loans/dashboard)
├── EMI & Repayments (/repayments/dashboard)
└── Logout Session
```

---

## 4. Sub-Module Navigation Flow

### 11. Loan Management Module
**Base Route:** `/loans`
**Routes:**
- **Dashboard** (`/loans/dashboard`)
- **Loan Types** (`/loans/types`)
# SAHAKARA ERP - Master Navigation & Integration Map

This document details the complete page hierarchy, parent-child routes, role flows, sidebar layout structure, and navigation diagrams across all 9 completed modules in **SAHAKARA ERP**.

---

## 1. User Role Flow Diagrams

### 🌐 Public Landing Flow
```
Landing Page (/) ──► About ──► Features ──► Benefits ──► Inquiry Modal ──► Login (/login)
```

### 👑 Super Admin Flow
```
Login (/login) ──► Super Admin Dashboard (/super-admin/dashboard)
                       ├── Pending Approvals (/super-admin/approvals)
                       ├── Organizations (/super-admin/organizations)
                       │     └── Organization Details (/super-admin/organizations/:id)
                       ├── Platform Monitoring (/super-admin/monitoring)
                       ├── Audit Logs (/super-admin/audit-logs)
                       └── System Settings (/super-admin/settings)
```

### 🏢 Organization Admin Flow
```
Login (/login) ──► Organization Dashboard (/org-admin/dashboard)
                       ├── Society Profile (/org-admin/profile)
                       ├── Branch Management (/branches/dashboard)
                       │     ├── Branch Registry (/branches/management)
                       │     ├── Branch Profile (/branches/profile/:id)
                       │     ├── Manager Assignment (/branches/manager-assign)
                       │     ├── Branch Staff (/branches/employees)
                       │     ├── Branch Members (/branches/members)
                       │     └── Branch Reports (/branches/reports)
                       ├── User Management (/users/dashboard)
                       │     ├── User Directory (/users/list)
                       │     ├── Create User (/users/create)
                       │     ├── User Profile (/users/profile/:id)
                       │     ├── Branch Transfers (/users/transfers)
                       │     └── User Reports (/users/reports)
                       ├── Member Management (/members/dashboard)
                       │     ├── Member Registry (/members/list)
                       │     ├── New Enrollment (/members/register)
                       │     ├── Member Profile (/members/profile/:id)
                       │     ├── Pending Approvals (/members/approvals)
                       │     ├── KYC Verification (/members/kyc)
                       │     └── Member Reports (/members/reports)
                       ├── Roles & Permissions (/roles/dashboard)
                       │     ├── Matrix Registry (/roles/list)
                       │     ├── Create Custom Role (/roles/create)
                       │     ├── Role Details (/roles/details/:id)
                       │     ├── User Role Assignment (/roles/assign)
                       │     └── Access Review (/roles/review)
                       ├── Group Management (/groups/dashboard)
                       │     ├── Group Registry (/groups/list)
                       │     ├── Create Group (/groups/create)
                       │     ├── Group Profile (/groups/profile/:id)
                       │     ├── Leader Desk (/groups/leader)
                       │     └── Member Allocation (/groups/members)
                       └── Society Settings (/org-admin/settings)
```

### 🏢 Branch Manager & Employee Flow
```
Login (/login) ──► Dashboard (/branches/dashboard or /employee/dashboard)
                       ├── Members (/members/list)
                       │     └── Register New Member (/members/register)
                       ├── Member Groups (/groups/list)
                       │     └── Member Allocation (/groups/members)
                       ├── Operational Reports (/members/reports)
                       └── Profile & Settings (/users/profile/:id)
```

---

## 2. Master Route Hierarchy & Module Map

| Module | Route | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` | Public | Public landing page, features, inquiry modal |
| **Auth** | `/login` | Public | JWT login with Email/Username |
| **Auth** | `/forgot-password` | Public | 3-step OTP password recovery |
| **Super Admin** | `/super-admin/dashboard` | Super Admin | Master platform metrics & health |
| **Super Admin** | `/super-admin/approvals` | Super Admin | Tenant registration approvals |
| **Super Admin** | `/super-admin/organizations` | Super Admin | List all registered societies |
| **Super Admin** | `/super-admin/monitoring` | Super Admin | System performance & server latency |
| **Super Admin** | `/super-admin/settings` | Super Admin | Platform-wide config settings |
| **Super Admin** | `/super-admin/audit-logs` | Super Admin | Master platform audit trail |
| **Org Admin** | `/org-admin/dashboard` | Org Admin, Super Admin, Execs | Society dashboard with Quick Action cards |
| **Org Admin** | `/org-admin/profile` | Org Admin, Super Admin, Execs | Society profile & emblem upload |
| **Org Admin** | `/org-admin/branches` | Org Admin, Super Admin, Execs | Branch overview & analytics |
| **Org Admin** | `/org-admin/settings` | Org Admin, Super Admin | Currency & financial year settings |
| **Branch Ops** | `/branches/dashboard` | Staff / Admins | Multi-branch operations hub |
| **Branch Ops** | `/branches/management` | Staff / Admins | Branch list, add & soft delete |
| **Branch Ops** | `/branches/profile/:id` | Staff / Admins | Branch details & manager assignment |
| **Branch Ops** | `/branches/reports` | Staff / Admins | Branch PDF & Excel export reports |
| **User Mgmt** | `/users/dashboard` | Admins / Execs | User metrics & role distribution |
| **User Mgmt** | `/users/list` | Admins / Execs | Searchable user directory & bcrypt reset |
| **User Mgmt** | `/users/create` | Admins / Execs | Account onboarding form |
| **User Mgmt** | `/users/transfers` | Admins / Execs | Inter-branch staff transfer desk |
| **User Mgmt** | `/users/reports` | Admins / Execs | User distribution reports |
| **Member Mgmt** | `/members/dashboard` | Staff / Admins | Member metrics & growth charts |
| **Member Mgmt** | `/members/list` | Staff / Admins | Member registry & status toggles |
| **Member Mgmt** | `/members/register` | Staff / Admins | Enrollment wizard & KYC upload |
| **Member Mgmt** | `/members/profile/:id` | Staff / Admins | Profile & Digital Membership Certificate |
| **Member Mgmt** | `/members/approvals` | Board / Admins | Board application approval desk |
| **Member Mgmt** | `/members/kyc` | Staff / Admins | Aadhaar & PAN document verification |
| **Member Mgmt** | `/members/reports` | Staff / Admins | Member reports with PDF/Excel export |
| **RBAC** | `/roles/dashboard` | Admins / Execs | RBAC metrics & permission stats |
| **RBAC** | `/roles/list` | Admins / Execs | Matrix registry & role cloning |
| **RBAC** | `/roles/create` | Admins / Execs | Interactive 13x8 Permission Checkbox Grid |
| **RBAC** | `/roles/assign` | Admins / Execs | User-to-Role assignment desk |
| **RBAC** | `/roles/review` | Admins / Execs | User effective access inspection |
| **Group Mgmt** | `/groups/dashboard` | Staff / Admins | SHG / JLG metrics & growth charts |
| **Group Mgmt** | `/groups/list` | Staff / Admins | Group registry & status controls |
| **Group Mgmt** | `/groups/create` | Staff / Admins | SHG/JLG group registration form |
| **Group Mgmt** | `/groups/profile/:id` | Staff / Admins | Group profile, roster & financials |
| **Group Mgmt** | `/groups/leader` | Staff / Admins | Group leader assignment desk |
| **Group Mgmt** | `/groups/members` | Staff / Admins | Member allocation & inter-group transfer |
| **Group Mgmt** | `/groups/reports` | Staff / Admins | Group member, savings & loan reports |
| **Global 404** | `*` | All | 404 Page Not Found error handler |
| **Global 403** | `/unauthorized` | All | 403 Access Denied error handler |

---

## 3. Sidebar Navigation Hierarchy (Unified Master Sidebar)

```
SAHAKARA ERP
├── Main Dashboard (/org-admin/dashboard)
├── Platform Governance (/super-admin/approvals) [Super Admin Only]
├── Organization Profile (/org-admin/profile)
├── Branch Management (/branches/dashboard)
├── User Accounts (/users/dashboard)
├── Member Lifecycle (/members/dashboard)
├── Roles & Permissions (/roles/dashboard)
├── Member Groups (SHG/JLG) (/groups/dashboard)
├── Reports & Analytics (/members/reports)
├── Audit Trail Logs (/users/logs)
├── Society Settings (/org-admin/settings)
├── Savings Management (/savings/dashboard)
├── Loan Management (/loans/dashboard)
├── EMI & Repayments (/repayments/dashboard)
├── Accounting & Ledgers (/accounting/dashboard)
├── Transaction Center (/transactions/dashboard)
└── Logout Session
```

---

## 4. Sub-Module Navigation Flow

### 11. Loan Management Module
**Base Route:** `/loans`
**Routes:**
- **Dashboard** (`/loans/dashboard`)
- **Loan Types** (`/loans/types`)
- **Apply for Loan** (`/loans/apply`)
- **My Loans** (`/loans/my-loans`)
- **Applications List** (`/loans/applications`)
- **Active Loans** (`/loans/active`)
- **Loan Details** (`/loans/details/:id`)

### 12. EMI & Repayments Module
**Base Route:** `/repayments`
**Routes:**
- **Dashboard** (`/repayments/dashboard`)
- **EMI Schedule** (`/repayments/schedule/:loanId`)
- **Record Repayment** (`/repayments/record`)
- **Transaction History** (`/repayments/transactions`)
- **Upcoming EMIs** (`/repayments/upcoming`)
- **Overdue EMIs** (`/repayments/overdue`)

### 13. Accounting Module
**Base Route:** `/accounting`
**Routes:**
- **Dashboard** (`/accounting/dashboard`)
- **Chart of Accounts** (`/accounting/accounts`)
- **Journal Entries** (`/accounting/journals`)
- **General Ledger** (`/accounting/ledger`)
- **Trial Balance** (`/accounting/trial-balance`)

### 14. Transaction Management Module
**Base Route:** `/transactions`
**Routes:**
- **Dashboard** (`/transactions/dashboard`)
- **All Transactions** (`/transactions/list`)
- **Transaction Details** (`/transactions/:id`)

### 15. Meeting Management Module
**Base Route:** `/meetings`
**Routes:**
- **Dashboard** (`/meetings/dashboard`)
- **Calendar** (`/meetings/calendar`)
- **Meeting Directory** (`/meetings/list`)
- **Schedule Meeting** (`/meetings/create`)
- **Edit Meeting** (`/meetings/edit/:id`)
- **Meeting Details** (`/meetings/details/:id`)
- **Governance Reports** (`/meetings/reports`)
