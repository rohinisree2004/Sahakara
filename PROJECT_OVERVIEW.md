# SAHAKARA ERP — Project Overview & Architecture Guide

**Comprehensive Cooperative Society, SHG & JLG Enterprise Resource Planning System**  
*Compliant with Kerala Cooperative Societies Act (1969), RBI Financial Inclusion Directives & NABARD SHG-Bank Linkage Framework*  
**Document Version:** `v1.0.0 (Master Architecture Document)`  

---

## 1. Project Introduction & Purpose

**Sahakara ERP** is a full-stack, cloud-native Enterprise Resource Planning (ERP) platform developed specifically for Primary Agricultural Credit Societies (PACS), Urban Cooperative Societies, Kudumbashree Units, Self-Help Groups (SHGs), and Joint Liability Groups (JLGs).

### The Problem It Solves:
1. **Manual & Fragmented Bookkeeping**: Grassroots cooperative groups frequently maintain physical paper ledgers, leading to calculation errors, missing passbooks, and delayed financial reporting.
2. **Lack of Credit Transparency**: Informal lending within SHGs lacks standardized credit evaluation (CIBIL score approximation, debt-to-income verification), increasing default risks.
3. **Multi-Tier Communication Silos**: Escalating member grievances or submitting loan applications to branch managers involves tedious physical paperwork and multi-week approval delays.
4. **Commingling of Multi-Group Funds**: Members enrolled in multiple SHG groups require separate, isolated thrift savings folios and loan records to prevent co-mingling of community savings.

### The Solution:
Sahakara ERP digitizes the entire lifecycle of cooperative banking—from public society onboarding, digital KYC enrollment, and dynamic SHG leadership rotation, to thrift deposits, automated EMI repayments, democratic meeting governance with minutes generation, and complete double-entry general ledger accounting.

---

## 2. User Personas & Organizational Hierarchy

Sahakara ERP operates on an 8-tier role hierarchy designed to reflect real-world cooperative society governance:

```
                      ┌──────────────────────────────┐
                      │      1. SUPER ADMIN          │
                      │  (Platform Owner / Regulator)│
                      └──────────────┬───────────────┘
                                     │
                      ┌──────────────▼───────────────┐
                      │    2. ORGANIZATION ADMIN     │
                      │  (Society General Manager)   │
                      └──────────────┬───────────────┘
                                     │
                      ┌──────────────▼───────────────┐
                      │     3. BRANCH MANAGER        │
                      │   (Branch Credit Committee)  │
                      └───────┬──────────────┬───────┘
                              │              │
        ┌─────────────────────┴──────┐  ┌────┴────────────────────────┐
        │        7. EMPLOYEE         │  │     SHG / JLG LEADERSHIP     │
        │   (Field Loan Officer)     │  │  ┌────────────────────────┐ │
        └────────────────────────────┘  │  │     4. PRESIDENT       │ │
                                        │  │ (Democratic Leader)    │ │
                                        │  └───────────┬────────────┘ │
                                        │              │              │
                                        │  ┌───────────▼────────────┐ │
                                        │  │     5. SECRETARY       │ │
                                        │  │  (Meetings & Minutes)  │ │
                                        │  └───────────┬────────────┘ │
                                        │              │              │
                                        │  ┌───────────▼────────────┐ │
                                        │  │     6. TREASURER       │ │
                                        │  │ (Thrift & Collections) │ │
                                        │  └───────────┬────────────┘ │
                                        └──────────────┼──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │         8. MEMBER           │
                                        │ (Grassroots SHG Contributor)│
                                        └─────────────────────────────┘
```

### Detailed Persona Profiles:

#### 1. Super Admin (Platform Owner / Apex Regulatory Tier)
- **Role**: Manages multi-society onboarding, reviews pending cooperative registrations, configures global platform parameters, and monitors database health and audit logs.
- **Key Actions**: Approve/Reject new cooperative society applications, inspect global transaction volume, monitor system response time, review security audit trails.

#### 2. Organization Admin (Society General Manager / Board)
- **Role**: Executive head of a specific cooperative society (e.g. *Kerala Unity Employees Cooperative Society*).
- **Key Actions**: Create and configure physical branches, manage organization-wide employee rosters, set statutory thrift reserve rules (minimum ₹500 buffer), define loan schemes and interest rate policies, inspect society-wide consolidated balance sheets.

#### 3. Branch Manager (Branch Credit Committee Head)
- **Role**: Administrative head of a regional branch (e.g. *Kottayam Main Branch*).
- **Key Actions**: Verify and approve member KYC submissions, act as the final sanctioning authority for credit applications, disburse approved loans via bank NEFT or cash, assign field employees, review branch general ledger and trial balance.

#### 4. Group President (Democratic SHG / JLG Chairperson)
- **Role**: Elected leader of an SHG or JLG unit (e.g. *Kottayam Micro-Enterprise Group*).
- **Key Actions**: First-tier review and recommendation of member loan applications, chairperson for bi-weekly/monthly group meetings, resolves initial group complaints or formally transfers complex grievances to the Branch Manager.

#### 5. Group Secretary (Administrative & Records Officer)
- **Role**: Custodian of group governance and democratic proceedings.
- **Key Actions**: Schedules physical/virtual meetings with agendas, takes live attendance with quorum verification (requires ≥ 50% attendance), drafts meeting resolutions, records actionable decisions, and publishes official PDF meeting minutes.

#### 6. Group Treasurer (Financial Custodian & Cashier)
- **Role**: Manages weekly/monthly thrift collections and repayments.
- **Key Actions**: Reviews member deposit slips (cash/UPI/bank transfer), approves savings withdrawals, collects loan EMI installments, reconciles the physical cash bag with digital ledger accounts.

#### 7. Employee / Field Officer
- **Role**: On-ground support staff facilitating member onboarding and community outreach.
- **Key Actions**: Assists rural members with document uploads and KYC submission, assists in creating new SHGs, conducts doorstep savings collections.

#### 8. Regular Member
- **Role**: Verified grassroots member belonging to one or more SHG units.
- **Key Actions**: Inspects real-time digital passbook folio, deposits savings into group thrift fund, applies for micro-enterprise / agricultural loans, tracks EMI repayment schedule, attends meetings, files grievances, chats with fellow group members.

---

## 3. Flow of Data & Control

### A. Hierarchical Multi-Tenancy Data Scoping
Data is strictly partitioned according to the organizational hierarchy:
```
Organization (Society) ──> Branch ──> Group (SHG/JLG) ──> Member / User
```
- **Global Requests** enforce tenant context through JWT claims (`organizationId`, `branchId`) and dynamic request headers (`x-active-group`, `x-active-group-role`).
- **Data Isolation Rules**:
  - Super Admin views all societies.
  - Org Admin views all branches and groups within their society.
  - Branch Manager views all groups and members enrolled under their branch.
  - Group Executives (President, Secretary, Treasurer) view only records belonging to their active group.
  - Members view only their personal records scoped strictly to their active group space.

---

### B. Core Business Workflows

#### 1. Member KYC Onboarding Flow
```
[Public / Field Registration]
             │
             ▼
[Member Profile Created: Status = 'Pending']
             │
             ▼ (Uploads Aadhaar, PAN, Bank Details)
[KYC Documents Submitted: Status = 'Under Review']
             │
             ▼
[Branch Manager / Org Admin KYC Verification]
             │
      ┌──────┴──────┐
      │             │
[Approved]     [Rejected / Return with Remarks]
      │
      ▼
[Active Member Account Created]
      │
      ▼
[Automatic Savings Account Generated: SAV-{GroupCode}-{MemberCode}]
```

#### 2. Credit Sanction & Loan Lifecycle State Machine
```
[Member Loan Application] (Requested Amount, Tenure, Purpose)
             │
             ▼ (Auto-Calculates CIBIL Credit Bureau Score & Debt Ratios)
[Status: 'Pending']
             │
             ▼
[Group President Review] (Democratic Group Evaluation)
             │
      ┌──────┴────────────────────────┐
      │                               │
[Recommended to Branch]          [Returned / Rejected]
      │
      ▼
[Status: 'Recommended']
             │
             ▼
[Branch Manager Credit Committee Evaluation]
             │
      ┌──────┴────────────────────────┐
      │                               │
[Approved Amount & Interest Set]  [Rejected / Returned]
      │
      ▼
[Status: 'Approved']
             │
             ▼
[Loan Disbursement Desk] (Bank Transfer / Savings Credit / Cash)
             │
             ▼
[Status: 'Active']
 ├── Generates Equal Monthly Installment (EMI) Schedule (Principal + Interest Amortization)
 └── Posts Double-Entry Accounting Journal:
       Debit: Loan Asset Account (1030)
       Credit: Cash/Bank Account (1010)
             │
             ▼ (Installment Repayments recorded monthly)
[Repayment Sinking Engine]
 ├── Online UPI / Cash / Savings Auto-Recovery
 └── Updates Outstanding Balance
             │
             ▼ (When Outstanding Balance reaches ₹0 & all schedules settled)
[Status: 'Closed'] (Auto-stamps Closure Date, Terminal Audit & No-Dues Clearance)
```

#### 3. Meeting Governance & Quorum Flow
```
[Secretary Schedules Meeting] (Date, Time, Venue, Agenda Topics)
             │
             ▼
[Automated Notifications Sent to All Group Members]
             │
             ▼
[Live Meeting Proceeding]
             │
             ▼
[Digital Attendance Roster]
 ├── Validates Quorum (Requires ≥ 50% Members Present)
 └── Records Attendance: Present, Absent, Excused
             │
             ▼
[Resolutions & Minutes Recording]
 ├── Decisions Documented (Thrift amount changes, loan approvals)
 └── Action Items assigned with due dates
             │
             ▼
[Meeting Status: 'Completed'] -> Official PDF Minutes Generated
```

#### 4. Grievance Redressal & Multi-Tier Escalation Flow
```
[Member Submits Complaint] (Category, Priority, Description)
             │
             ▼
[Initial Routing to Group President]
             │
      ┌──────┴────────────────────────┐
      │                               │
[President Resolves Ticket]     [President Escalates to Branch]
      │                               │
      ▼                               ▼
[Status: 'Resolved']             [Addressed To: 'Branch Manager']
                                      │
                               ┌──────┴───────────────────────┐
                               │                              │
                        [Branch Resolves]              [Branch Escalates to Society Board]
                               │                              │
                               ▼                              ▼
                        [Status: 'Resolved']           [Addressed To: 'Organization Admin']
```

---

## 4. Financial Architecture & Double-Entry Accounting

Sahakara ERP includes a dedicated double-entry General Ledger (GL) module adhering to Indian Cooperative Accounting Standards:

### Chart of Accounts Structure:
- **1000 - Assets**: Cash on Hand (1010), Bank Balances (1020), Member Loan Portfolio Asset (1030), Fixed Assets (1040).
- **2000 - Liabilities**: Member Thrift Savings Deposits (2010), Fixed Deposit Liabilities (2020), Borrowings (2030).
- **3000 - Equity**: Share Capital (3010), Statutory Reserve Fund (3020), Retained Surplus (3030).
- **4000 - Income**: Interest on Member Loans (4010), Membership Application Fees (4020), Penalty Charges (4030).
- **5000 - Expenses**: Interest Paid on Thrift Deposits (5010), Administrative Expenses (5020), Audit Fees (5030).

### Automatic Transaction Posting Engine:
Every financial transaction automatically constructs and commits a balanced `JournalEntry` with corresponding `JournalLine` debits and credits:
1. **Savings Deposit**: `Debit 1010 (Cash) | Credit 2010 (Member Savings Liability)`
2. **Savings Withdrawal**: `Debit 2010 (Member Savings Liability) | Credit 1010 (Cash)`
3. **Loan Disbursement**: `Debit 1030 (Loan Portfolio Asset) | Credit 1010 (Cash)`
4. **Loan EMI Payment**:
   - `Debit 1010 (Cash)` for Total EMI
   - `Credit 1030 (Loan Asset)` for Principal Portion
   - `Credit 4010 (Interest Income)` for Interest Portion

---

## 5. Security, Tenancy & Compliance Controls

1. **Authentication & Password Security**:
   - Passwords hashed using bcrypt with salt factor 10.
   - JWT tokens generated with `HS256`, including user ID, organization ID, and role.
2. **Contextual Role Switching**:
   - Users with multiple role assignments (e.g. Member of Group A, President of Group B) switch contexts via the secure `/select-group` gateway.
   - All subsequent HTTP requests carry the `x-active-group` header, enforcing strict authorization at the controller layer.
3. **Audit Trails & Non-Repudiation**:
   - Every state-altering action generates an immutable `AuditLog` entry recording `userId`, `performerName`, `performerRole`, `action`, `module`, `ipAddress`, and `timestamp`.
4. **Statutory Reserve Protection**:
   - The savings engine prevents members from withdrawing below the statutory reserve buffer (default ₹500), ensuring the cooperative society maintains liquidity reserves.
