# SAHAKARA ERP — API Endpoints & Frontend Architecture Documentation

**Complete Technical Reference for Backend REST APIs & Frontend Portal Pages**  
**Document Version:** `v1.0.0 (Production Master)`  

---

# PART 1: BACKEND REST API ENDPOINTS

Base URL: `http://localhost:5000/api/v1` (or production host)  
Standard Headers:
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`
- `x-active-group: <GROUP_ID>` (Mandatory for group-scoped executive & member operations)
- `x-active-group-role: <ROLE_NAME>` (Optional explicit contextual override)

---

## 1. Authentication & Session Module (`/api/v1/auth`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Registers a new primary cooperative user / society member. Hashes password with bcrypt. |
| `POST` | `/auth/login` | Public | Authenticates user with email/phone & password. Returns JWT token, user object, active branch, and list of enrolled groups with dynamic roles. |
| `GET` | `/auth/me` | Authenticated | Returns currently logged-in user profile, role permissions, active branch, and active organization details. |
| `POST` | `/auth/forgot-password` | Public | Generates a 6-digit OTP for password recovery and sends it via SMS/Email. |
| `POST` | `/auth/reset-password` | Public | Validates OTP and sets a new bcrypt-hashed password for the user account. |

---

## 2. Organization & Society Governance (`/api/v1/organizations`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/organizations` | Super Admin | Lists all onboarded cooperative societies with pagination, search, and status filtering (`Pending`, `Active`, `Suspended`). |
| `POST` | `/organizations` | Super Admin | Onboards a new cooperative society with name, registration number, state, district, and apex settings. |
| `GET` | `/organizations/:id` | Super Admin, Org Admin | Returns detailed profile of a society including branch count, total member count, and settings. |
| `PUT` | `/organizations/:id` | Super Admin, Org Admin | Updates society profile, contact details, registration bylaws, or operational status. |
| `GET` | `/organizations/:id/stats` | Org Admin, Super Admin | Aggregates society-level financial stats: gross savings, active loans, overdue ratio, and member count. |

---

## 3. Branch Operations & Staffing (`/api/v1/branches`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/branches` | Super Admin, Org Admin, Staff | Lists all physical branches within the user's organization with pagination and search. |
| `POST` | `/branches` | Super Admin, Org Admin | Creates a new branch (e.g. *Kottayam Main Branch*) with branch code, IFSC, address, and contact details. |
| `GET` | `/branches/:id` | All Staff & Admins | Returns detailed branch metrics: assigned employees, affiliated SHGs, active loans, and cash balance. |
| `PUT` | `/branches/:id` | Super Admin, Org Admin | Updates branch details or modifies branch operational status (`Active`, `Inactive`). |
| `POST` | `/branches/:id/assign-manager` | Org Admin, Super Admin | Assigns a Branch Manager to the branch, updating their user profile and permissions. |
| `GET` | `/branches/:id/employees` | Branch Manager, Org Admin | Lists all staff members and field officers assigned to the specified branch. |

---

## 4. User Management & Access Control (`/api/v1/users`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Super Admin, Org Admin, Branch Mgr | Lists users filtered by organization, branch, and role. |
| `POST` | `/users` | Super Admin, Org Admin | Creates a new staff or administrative user with assigned role and temporary password. |
| `GET` | `/users/:id` | All Authenticated | Returns specific user profile, contact details, and role assignments. |
| `PUT` | `/users/:id` | Super Admin, Org Admin | Updates user information, active status, or security permissions. |
| `POST` | `/users/:id/transfer-branch` | Org Admin, Super Admin | Transfers an employee or officer from one branch to another, logging the transfer event. |

---

## 5. Member Registry & KYC Pipeline (`/api/v1/members`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/members` | Staff, Admins, Executives | Retrieves member roster scoped to branch/group with search, category, and KYC status filters. |
| `POST` | `/members` | Staff, Admins, Employees | Enrolls a new member into the registry with personal details, Aadhaar, PAN, and address. |
| `GET` | `/members/:id` | Staff, Admins, Member Self | Fetches full member KYC dossier, bank account details, and group memberships. |
| `PUT` | `/members/:id` | Staff, Admins, Member Self | Updates member contact, address, or nominee information. |
| `PUT` | `/members/:id/kyc` | Branch Manager, Org Admin | Verifies or rejects member KYC documentation with compliance remarks. |
| `GET` | `/members/my/profile` | Member | Returns the authenticated member's personal profile and active group affiliations. |

---

## 6. Dynamic Roles & Permissions (`/api/v1/roles`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/roles` | Super Admin, Org Admin | Lists all system and custom cooperative roles (President, Secretary, Treasurer, Manager, etc.). |
| `POST` | `/roles` | Super Admin, Org Admin | Creates a new granular role with customized permission flags across modules. |
| `GET` | `/roles/:id` | Super Admin, Org Admin | Returns specific role definition and associated permission array. |
| `POST` | `/roles/assign` | Admins, Group Leaders | Assigns a dynamic role to a user for a specific group or branch context (`RoleAssignment`). |
| `GET` | `/roles/user/:userId` | Admins, Executives | Fetches all active and past role assignments for a specific user. |

---

## 7. SHG & JLG Group Federation (`/api/v1/groups`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/groups` | Staff, Admins, Executives | Lists all SHGs/JLGs with filters for branch, group type (`SHG`, `JLG`, `Micro-Enterprise`), and status. |
| `POST` | `/groups` | Staff, Admins, Field Officers | Forms a new cooperative group with name, code, meeting frequency, and minimum savings rules. |
| `GET` | `/groups/:id` | All Authenticated | Returns detailed group profile, total thrift fund, assigned President, Secretary, and Treasurer. |
| `PUT` | `/groups/:id` | Admins, Branch Manager | Updates group profile, bylaws, or changes active leadership. |
| `GET` | `/groups/:id/members` | All Group Members & Staff | Lists all enrolled members of the group with their join date, designation, and savings status. |
| `POST` | `/groups/:id/members` | Group Leaders, Branch Manager | Enrolls a verified member into the group and auto-initializes their group savings account. |
| `POST` | `/groups/:id/leaders` | Branch Manager, Org Admin | Elects or rotates President, Secretary, and Treasurer designations for the group. |

---

## 8. Savings Accounts & Digital Passbook (`/api/v1/savings`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/savings/accounts` | All Roles (Scoped) | Lists savings accounts. When queried by a member with `myOnly=true` and `x-active-group`, returns **only** the active group's passbook folio. |
| `POST` | `/savings/accounts` | Staff, Group Leaders | Creates a new thrift savings account for a member under an SHG unit. |
| `GET` | `/savings/accounts/:id` | Staff, Account Holder | Returns account balance, interest rate, minimum statutory reserve, and KYC status. |
| `POST` | `/savings/deposit-request` | Member, Group Leaders | Submits a deposit request with amount, payment mode (UPI/Cash), and transaction reference. |
| `POST` | `/savings/withdraw-request` | Member, Group Leaders | Submits a withdrawal request validating that remaining balance ≥ ₹500 statutory buffer. |
| `GET` | `/savings/pending-requests` | Treasurer, Branch Mgr | Lists unapproved deposit and withdrawal requests for the active group/branch. |
| `PUT` | `/savings/requests/:id/approve`| Treasurer, Branch Mgr | Approves request, updates ledger balance, and posts double-entry GL journal entry. |
| `PUT` | `/savings/requests/:id/reject` | Treasurer, Branch Mgr | Rejects pending request with explanatory rejection remarks. |
| `GET` | `/savings/passbook/:accountId` | Staff, Account Holder | Generates complete printable passbook statement with journal line items, running balance, and totals. |

---

## 9. Loan Credit Evaluation & Lifecycle (`/api/v1/loans`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/loans` | All Roles (Scoped) | Lists loan applications and active loans scoped to organization, branch, group, or personal profile. |
| `POST` | `/loans/apply` | Member, Staff | Submits a loan application capturing requested amount, tenure, purpose, and `groupId`. Auto-calculates CIBIL score. |
| `GET` | `/loans/:id` | Staff, Applicant | Returns full loan dossier: borrower profile, credit score, group recommendation, and sanction status. |
| `PUT` | `/loans/:id/review` | Group President | President reviews member loan application and records democratic group recommendation (`Recommended`). |
| `PUT` | `/loans/:id/approve` | Branch Manager | Branch Manager conducts credit appraisal, sets approved amount/interest, and sanctions loan (`Approved`). |
| `POST` | `/loans/:id/disburse` | Branch Manager | Disburses loan funds via Bank/NEFT/Cash, activates loan (`Active`), generates EMI amortization schedule, and posts GL journal entries. |
| `GET` | `/loans/types` | All Authenticated | Lists configured loan products (Agricultural Loan, Micro-Enterprise Loan, Education Loan). |
| `POST` | `/loans/types` | Org Admin, Super Admin | Creates a new loan product with min/max amount, interest rate, max tenure, and processing fee. |

---

## 10. EMI Repayments & Amortization Engine (`/api/v1/repayments`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/repayments/schedule/:loanId` | Staff, Borrower | Returns the complete amortization schedule (installment #, due date, principal, interest, status). |
| `POST` | `/repayments/record` | Treasurer, Staff, Member | Records an EMI installment payment (Cash, UPI, or Savings Auto-Debit). Deducts from balance and posts GL entries. If loan is fully settled, automatically transitions status to `'Closed'`. |
| `POST` | `/repayments/loan/:loanId/close`| Staff, Branch Mgr, Treas| Formally closes a loan account with full settlement calculation and no-dues certificate issuance. |
| `GET` | `/repayments/upcoming` | Staff, Borrower | Lists upcoming EMI payments due within the next 30 days. |
| `GET` | `/repayments/overdue` | Staff, Branch Mgr, Treas | Lists defaulted or overdue EMI installments with calculated penal interest. |
| `POST` | `/repayments/auto-deduct/:loanId`| Staff, Treasurer | Executes automated recovery of overdue installment directly from borrower's group savings account. |

---

## 11. Double-Entry Accounting & General Ledger (`/api/v1/accounting`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/accounting/chart-of-accounts`| Admins, Branch Mgr, Staff | Returns the complete Chart of Accounts hierarchy (Assets, Liabilities, Equity, Revenue, Expenses). |
| `POST` | `/accounting/chart-of-accounts`| Org Admin, Super Admin | Creates a new ledger account code with account type and classification. |
| `GET` | `/accounting/journal-entries` | Admins, Branch Mgr, Staff | Lists all posted journal entries with filtering by date range, branch, and reference number. |
| `POST` | `/accounting/journal-entries` | Admins, Branch Mgr, Staff | Records a manual journal entry, strictly validating that Total Debits == Total Credits. |
| `GET` | `/accounting/general-ledger` | Admins, Branch Mgr, Staff | Generates general ledger account statements with opening balance, journal lines, and closing balance. |
| `GET` | `/accounting/trial-balance` | Admins, Branch Mgr, Staff | Generates real-time Trial Balance verifying ledger equilibrium across all account heads. |

---

## 12. Democratic Meeting Governance (`/api/v1/meetings`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/meetings` | All Roles (Scoped) | Lists scheduled and concluded meetings filtered by group, branch, or date. |
| `POST` | `/meetings` | Secretary, President, Staff | Schedules a new group meeting with title, date, time, venue/link, and agenda items. |
| `GET` | `/meetings/:id` | All Group Members & Staff | Returns meeting agenda, attendee roster, quorum status, recorded resolutions, and minutes. |
| `PUT` | `/meetings/:id` | Secretary, President | Updates meeting details, reschedules date, or edits agenda topics. |
| `POST` | `/meetings/:id/attendance` | Secretary, President | Records digital attendance for all members. Automatically validates Quorum requirement (≥ 50%). |
| `POST` | `/meetings/:id/minutes` | Secretary, President | Records formal meeting resolutions, approved thrift amounts, and action items. Marks status as `'Completed'`. |

---

## 13. Support, Grievance Escalation & Account Closure (`/api/v1/complaints`, `/api/v1/account-closures`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/complaints` | All Roles (Scoped) | Lists grievances. Members see personal complaints; Presidents see group complaints; Branch Managers see escalated branch complaints. |
| `POST` | `/complaints` | Member, Staff | Submits a grievance with category (`Loan`, `Savings`, `Meeting`, `Governance`), priority, and description. |
| `PUT` | `/complaints/:id/resolve` | President, Branch Mgr, Admin | Resolves complaint ticket with resolution notes and closure remarks. |
| `PUT` | `/complaints/:id/escalate` | President, Branch Mgr | Escalates unresolved ticket to the next administrative tier (President -> Branch Manager -> Org Admin). |
| `POST` | `/account-closures/request` | Member, Staff | Initiates formal membership termination and savings account closure request. |
| `PUT` | `/account-closures/:id/approve` | Branch Manager, Org Admin | Approves closure after verifying no active loan liabilities exist; disburses remaining thrift balance. |

---

## 14. Cooperative Real-Time Chat & Platform Monitoring (`/api/v1/chat`, `/api/v1/super-admin`)

| Method | Endpoint | Allowed Roles | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/messages/:groupId` | Group Members & Staff | Retrieves real-time chat history for an SHG group. |
| `POST` | `/chat/messages` | Group Members & Staff | Sends a message to the group chat channel. |
| `GET` | `/super-admin/monitoring` | Super Admin | Returns server uptime, memory usage, MongoDB status, active connections, and latency. |
| `GET` | `/super-admin/audit-logs` | Super Admin, Org Admin | Forensic audit log stream with filtering by actor, action type, IP address, and date range. |

---

# PART 2: FRONTEND APPLICATION ARCHITECTURE & PAGES

The frontend is structured into modular domain directories under `frontend/src/pages/`:

```
frontend/src/pages/
├── accounting/          # Double-Entry GL, Chart of Accounts, Trial Balance
├── auth/                # Login, Register, Password Reset, Group Selection Gateway
├── branchManager/       # Branch Dashboard, Staff Assignment, Member KYC Approvals
├── common/              # 404, Unauthorized, Global Error Pages
├── communication/       # Real-Time Cooperative Group Chat
├── dashboards/          # Persona-Specific Dedicated Dashboards (President, Secretary, Treasurer, Member, Employee)
├── groupManagement/     # SHG/JLG Roster, Formation, Leadership Election
├── landing/             # Public Hero, Features, Loan Calculator, Inquiries
├── loans/               # Loan Products, Application, Review, Approval, Disbursement
├── meetings/            # Meeting Calendar, Quorum Attendance, Minutes Generator
├── memberManagement/    # Member Directory, KYC Verification, Onboarding
├── orgAdmin/            # Society Dashboard, Branch Management, Consolidated Reports
├── repayments/          # EMI Schedules, Repayment Collection, Auto-Recovery
├── roleManagement/      # Dynamic Role Definition, Matrix Review, Permissions
├── savings/             # Savings Accounts, Digital Passbook, Deposit/Withdrawal Desk
├── superAdmin/          # Platform Health, Society Onboarding Approvals, Global Audits
├── support/             # Grievance Redressal, Multi-Tier Escalation, Account Closure
├── transactions/        # Global Transaction Ledger & Receipts
└── userManagement/      # Staff User Accounts, Branch Transfers, Credential Management
```

---

## Complete Frontend Route & Page Catalog

| URL Path | Component Path | Permitted User Roles | Key UI Features & Functions |
| :--- | :--- | :--- | :--- |
| `/` | `pages/landing/LandingPage.jsx` | Public | Public landing portal with hero banner, live cooperative statistics, micro-loan calculator, and society inquiry modal. |
| `/login` | `pages/auth/LoginPage.jsx` | Public | Secure login with email/phone, password visibility toggle, error handling, and redirect to group selection or dashboard. |
| `/register` | `pages/auth/PublicRegisterPage.jsx` | Public | Multi-step member self-registration with personal info, Aadhaar/PAN capture, and initial group selection. |
| `/select-group` | `pages/auth/GroupSelectionPage.jsx` | All Authenticated | Dynamic group selection gateway allowing multi-group members to select their active group space and role. |
| `/super-admin/dashboard` | `pages/superAdmin/SuperAdminDashboardPage.jsx` | Super Admin | Platform health overview, pending society applications counter, active user gauge, and recent system alerts. |
| `/super-admin/approvals` | `pages/superAdmin/OrganizationApprovalsPage.jsx` | Super Admin | Society onboarding review desk with verification checklist, bylaws inspection, and one-click Approval/Rejection. |
| `/super-admin/monitoring`| `pages/superAdmin/PlatformMonitoringPage.jsx` | Super Admin | Live server metrics: CPU utilization, RAM consumption, MongoDB heartbeat, and active HTTP request rate. |
| `/super-admin/audit-logs`| `pages/superAdmin/AuditLogsPage.jsx` | Super Admin | Forensic audit log viewer with searchable filters for actor name, IP address, module, and timestamp. |
| `/org-admin/dashboard` | `pages/orgAdmin/OrgDashboardPage.jsx` | Org Admin, Super Admin | Society-wide analytics: gross loan portfolio, total thrift deposits, branch comparison matrix, and staff count. |
| `/org-admin/branches` | `pages/orgAdmin/OrgBranchesPage.jsx` | Org Admin, Super Admin | Grid of society branches with operational status, employee counts, and "Add Branch" modal. |
| `/branches/dashboard` | `pages/branchManager/BranchDashboardPage.jsx` | Branch Manager, Admins | Branch performance KPIs, daily cash in hand, pending loan sanction queue, and field collection summary. |
| `/branches/management` | `pages/branchManager/BranchManagementPage.jsx` | Staff, Admins | Branch administrative table with search, manager assignment modal, and branch configuration settings. |
| `/members/dashboard` | `pages/memberManagement/MemberDashboardPage.jsx` | Staff, Admins | Member registry metrics: KYC completion percentage, gender breakdown, active vs pending count. |
| `/members/list` | `pages/memberManagement/MemberListPage.jsx` | Staff, Admins, Leaders | Searchable member table with filtering by group, KYC status, and direct links to Member Profile & KYC Dossier. |
| `/members/register` | `pages/memberManagement/MemberRegisterPage.jsx` | Staff, Admins, Employees | Comprehensive on-ground member onboarding form with document file upload and automatic savings account generation. |
| `/members/kyc` | `pages/memberManagement/MemberKYCPage.jsx` | Branch Mgr, Org Admin | Document verification desk displaying uploaded Aadhaar, PAN, and Bank Passbook with verification actions. |
| `/groups/dashboard` | `pages/groupManagement/GroupDashboardPage.jsx` | Staff, Admins, Leaders | SHG/JLG federation overview: total groups formed, average thrift savings per group, and meeting compliance rate. |
| `/groups/list` | `pages/groupManagement/GroupListPage.jsx` | Staff, Admins, Leaders | Group directory displaying group type, assigned President/Secretary/Treasurer, and member count. |
| `/groups/create` | `pages/groupManagement/CreateGroupPage.jsx` | Staff, Admins, Employees | Group creation wizard: sets group code, meeting schedule, thrift contribution frequency, and branch linkage. |
| `/groups/profile/:id` | `pages/groupManagement/GroupProfilePage.jsx` | All Group Members & Staff| Deep group profile displaying member roster, total accumulated savings pool, active loans, and meeting logs. |
| `/groups/leaders` | `pages/groupManagement/GroupLeaderPage.jsx` | Branch Mgr, Org Admin | Dynamic leadership election and rotation desk to assign President, Secretary, and Treasurer designations. |
| `/savings/dashboard` | `pages/savings/SavingsDashboardPage.jsx` | Staff, Admins, Leaders | Thrift savings aggregate metrics, recent deposit inflow feed, and pending withdrawal requests count. |
| `/savings/accounts` | `pages/savings/SavingsAccountsPage.jsx` | Staff, Admins, Leaders | Master savings account ledger table with account numbers, member names, groups, and balances. |
| `/passbook` | `pages/savings/PassbookPage.jsx` | All Roles (Scoped) | Physical-passbook styled digital ledger: displays branch info, account details, journal transactions, and Print Passbook action. Strict single-group view for members. |
| `/loans/dashboard` | `pages/loans/LoanDashboardPage.jsx` | Staff, Admins, Leaders | Loan portfolio dashboard: Total Sanctioned Amount, Active Borrowers, Recovery Rate, and Default Risk index. |
| `/loans/types` | `pages/loans/LoanTypesPage.jsx` | All Authenticated | Catalog of loan schemes (SHG Micro-Enterprise Loan, Agricultural Crop Loan, Emergency Thrift Loan). |
| `/loans/apply` | `pages/loans/LoanApplicationPage.jsx` | Member, Staff | Loan application form with live active-group badge, tenure selector, auto EMI calculation, and CIBIL score display. |
| `/loans/review` | `pages/loans/LoanReviewPage.jsx` | Group President | Democratic President review desk: inspects borrower credentials and submits group recommendation to branch. |
| `/loans/approval` | `pages/loans/LoanApprovalPage.jsx` | Branch Manager | Branch Credit Committee approval desk: sets final sanctioned principal, interest rate, and approves loan. |
| `/loans/disbursement` | `pages/loans/LoanDisbursementPage.jsx` | Branch Manager | Disburses approved loans, generates EMI schedule, updates cash account, and activates repayment tracking. |
| `/loans/active` | `pages/loans/ActiveLoansPage.jsx` | Staff, Admins, Leaders | Real-time monitoring of all active loans with outstanding balances, paid installments, and risk status. |
| `/repayments/dashboard`| `pages/repayments/RepaymentDashboardPage.jsx`| Staff, Admins, Leaders | Repayment KPI cards: Total Recovered this Month, Upcoming Collections, and Overdue Default Portfolio. |
| `/repayments/schedule` | `pages/repayments/EmiSchedulePage.jsx` | Staff, Borrower | Detailed EMI installment table showing principal breakdown, interest component, due date, and payment status. |
| `/repayments/record` | `pages/repayments/RecordRepaymentPage.jsx` | Treasurer, Staff, Member | EMI collection form: records cash/UPI payment, deducts outstanding loan balance, and triggers auto-closure if balance reaches ₹0. |
| `/repayments/upcoming` | `pages/repayments/UpcomingEmiPage.jsx` | Staff, Borrower | Filterable list of EMI installments falling due in the next 30 days. |
| `/repayments/overdue` | `pages/repayments/OverdueEmiPage.jsx` | Staff, Branch Mgr, Treas | Delinquent loan tracking table with one-click "Auto-Deduct from Savings" action. |
| `/accounting/dashboard`| `pages/accounting/AccountingDashboardPage.jsx`| Admins, Branch Manager | General ledger summary: Total Assets, Total Liabilities, Net Surplus, and quick journal posting counter. |
| `/accounting/chart-of-accounts`| `pages/accounting/ChartOfAccountsPage.jsx`| Admins, Branch Manager | Interactive tree view of the cooperative Chart of Accounts (1000 Assets through 5000 Expenses). |
| `/accounting/journal` | `pages/accounting/JournalEntryPage.jsx` | Admins, Branch Manager | Manual double-entry journal posting form with live validation that Total Debits == Total Credits. |
| `/accounting/general-ledger`| `pages/accounting/GeneralLedgerPage.jsx`| Admins, Branch Manager | General ledger account inspector with opening balance, journal entries, and ending balance. |
| `/accounting/trial-balance`| `pages/accounting/TrialBalancePage.jsx`| Admins, Branch Manager | Official Trial Balance sheet verifying accounting equilibrium. |
| `/meetings/dashboard` | `pages/meetings/MeetingDashboardPage.jsx` | All Group Members & Staff| Meeting overview: upcoming group meetings, attendance compliance rate, and recently published minutes. |
| `/meetings/calendar` | `pages/meetings/MeetingCalendarPage.jsx` | All Group Members & Staff| Interactive visual calendar showing scheduled SHG meeting dates. |
| `/meetings/create` | `pages/meetings/CreateMeetingPage.jsx` | Secretary, President, Staff| Meeting scheduling form: title, date, time, venue/link, and structured agenda builder. |
| `/meetings/details/:id`| `pages/meetings/MeetingDetailsPage.jsx` | All Group Members & Staff| Meeting console: Live Attendance marking, Quorum validation (≥ 50%), and Minutes recording. |
| `/support/complaints` | `pages/support/ComplaintsPage.jsx` | All Roles (Scoped) | Grievance desk: file a new complaint, view ticket status, and resolve or escalate tickets. |
| `/support/closure` | `pages/support/AccountClosurePage.jsx` | Staff, Branch Manager | Formal membership termination and savings settlement console. |
| `/chat` | `pages/communication/ChatPage.jsx` | Group Members & Staff | Real-time cooperative group chat room for community announcements, meeting reminders, and peer support. |
| `/executive/dashboard` | `pages/dashboards/ExecutiveDashboard.jsx` | Group President | Dedicated President workspace: group overview, loan recommendations, and group grievance review. |
| `/secretary/dashboard` | `pages/dashboards/GroupSecretaryDashboard.jsx`| Group Secretary | Dedicated Secretary workspace: meeting scheduler, live quorum attendance, and minutes generator. |
| `/treasurer/dashboard` | `pages/dashboards/GroupTreasurerDashboard.jsx`| Group Treasurer | Dedicated Treasurer workspace: thrift savings collection desk, deposit approvals, and EMI collections. |
| `/employee/dashboard` | `pages/dashboards/EmployeeDashboard.jsx` | Employee / Field Officer | Dedicated Field Officer workspace: rapid member registration, SHG formation assistance, and collection counter. |
| `/member/dashboard` | `pages/dashboards/MemberDashboard.jsx` | Regular Member | Dedicated Member portal: active group savings balance, withdrawable funds, active loans, and passbook preview. |
