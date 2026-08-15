# Sahakara ERP – Database Seed Data Plan

## Purpose

This document defines the development/demo data that should be inserted into the Sahakara ERP MongoDB database.

The data is **synthetic** and intended only for development, testing, screenshots, demonstrations, and viva purposes. It must not contain real people's personal information, real Aadhaar/PAN numbers, real bank details, or real confidential financial information.

## Data Rules

### Geographic Scope
Use Kerala-based locations and realistic Kerala administrative structure.

Recommended districts:
- Thiruvananthapuram
- Kollam
- Pathanamthitta
- Alappuzha
- Kottayam
- Idukki
- Ernakulam
- Thrissur
- Palakkad
- Malappuram
- Kozhikode
- Wayanad
- Kannur
- Kasaragod

Use realistic towns/localities such as:
- Kottayam
- Changanassery
- Pala
- Ernakulam
- Aluva
- Thrissur
- Palakkad
- Ottapalam
- Kozhikode
- Kannur
- Thiruvananthapuram
- Kollam

Do not imply that the fictional organizations below are real registered societies.

## Seed Organizations

Create 3–5 fictional cooperative organizations.

Example names:
1. Kerala Unity Employees Cooperative Society
2. Sahodaya Community Cooperative Society
3. Green Valley Farmers Cooperative Society
4. Malabar Community Welfare Cooperative Society

Each organization should have:
- Unique organization ID
- Registration number using a clearly synthetic format
- Society type
- Address
- District
- State = Kerala
- PIN code appropriate to the selected locality
- Email using example.com
- Synthetic phone number clearly marked for development
- Logo placeholder
- Status = Active
- Created date

## Branches

Create 2–3 branches for each organization.

Each branch must contain:
- organizationId
- branchCode
- branchName
- Kerala location
- address
- district
- PIN
- synthetic phone/email
- managerId
- status

Branch codes must be unique within an organization.

## Users

Create users for the existing roles:

- Super Admin
- Organization Admin
- President
- Secretary
- Treasurer
- Branch Manager
- Employee
- Member

Rules:
- Every organization-specific user must have organizationId.
- Branch-specific users must have branchId.
- Passwords must be hashed using the existing authentication system.
- Do not store plaintext passwords in the database.
- Use development-only credentials documented separately from production secrets.

## Members

Create realistic but completely fictional Kerala-style member data.

Each member should include:
- organizationId
- branchId
- memberId
- fictional name
- gender
- date of birth
- phone marked as synthetic
- email using example.com
- Kerala address
- occupation
- joining date
- membership status
- nominee/family information where supported

Do not use real Aadhaar, PAN, bank account, or identity numbers.

For KYC fields, use:
- `verificationStatus: "Verified"` only as a test state
- synthetic document references such as `KYC-TEST-0001`

## Groups

Create several groups under different branches.

Example:
- Palakkad Savings Group A
- Kottayam Community Group
- Thrissur Farmers Group
- Kozhikode Employee Group

Each group must:
- Belong to one organization
- Belong to one branch
- Have a valid leaderId
- Contain valid memberIds from the same organization/branch according to business rules

## Savings

Create realistic development transactions.

Include:
- Savings accounts
- Opening balances
- Monthly deposits
- Different payment methods
- Transaction dates
- Balance after each transaction

Use reasonable amounts such as:
- ₹500
- ₹1,000
- ₹1,500
- ₹2,000
- ₹2,500
- ₹5,000

Do not create impossible balances.

Every savings transaction must update the corresponding account balance consistently.

## Loans

Create realistic test loan data.

Loan types:
- Personal Loan
- Emergency Loan
- Education Loan
- Agricultural Loan
- Housing Loan

Use reasonable development amounts, for example:
- ₹25,000
- ₹50,000
- ₹75,000
- ₹1,00,000
- ₹2,00,000

Include different statuses:
- Pending
- Under Review
- Approved
- Rejected
- Disbursed
- Active
- Closed

Every loan must reference:
- organizationId
- branchId
- memberId
- loanTypeId

Do not create loans for nonexistent members.

## Loan Reviews and Documents

Create synthetic review records and document metadata.

Examples:
- Identity Proof – TEST
- Address Proof – TEST
- Income Proof – TEST
- Loan Application – TEST

Do not upload or store real identity documents.

## Transactions

Create consistent financial transaction records for:
- Savings deposits
- Loan disbursements
- Loan repayments when applicable
- Income
- Expenses

Do not create arbitrary transaction records that contradict savings or loan balances.

## Meetings

Create sample meetings for each organization.

Example:
- Monthly General Meeting
- Board Meeting
- Savings Review Meeting
- Loan Review Meeting

Each meeting should contain:
- organizationId
- branchId
- title
- date
- time
- venue
- agenda
- status

Add attendance only for valid members.

## Notifications

Create realistic notifications such as:
- Savings deposit recorded
- Loan application submitted
- Loan approved
- Meeting scheduled
- Payment due

Every notification must reference the correct organization/user.

## Audit Logs

Create sample audit logs for:
- Login
- Organization approval
- Member creation
- Savings deposit
- Loan application
- Loan approval
- User update

## Data Integrity Rules

The seed process must validate:

1. No orphan references.
2. Every organization-specific record has organizationId.
3. Every branch belongs to an existing organization.
4. Every user belongs to an existing organization where required.
5. Every member belongs to an existing organization and branch.
6. Every group member belongs to the correct organization.
7. Every savings account belongs to an existing member.
8. Every savings transaction belongs to an existing savings account.
9. Savings balances equal the sum of valid transactions.
10. Every loan belongs to an existing member.
11. Every loan type belongs to the correct organization.
12. Every loan review belongs to an existing loan.
13. Every attendance record references an existing meeting and member.
14. No cross-organization references.
15. Dates must be logically ordered.

## Frontend Data Rule

The frontend must NOT contain hardcoded fake business data.

Remove arrays such as:
- `dummyOrganizations`
- `mockMembers`
- `fakeLoans`
- `sampleSavings`
- `mockTransactions`

unless they are explicitly used for isolated UI component testing.

All actual application pages must retrieve data through the backend APIs.

The flow must be:

React Page
→ API Service
→ Express Route
→ Controller
→ MongoDB
→ API Response
→ React State
→ UI

## Seed Script Requirements

Create a proper backend seed system.

Recommended structure:

backend/
├── seed/
│   ├── seed.js
│   ├── data/
│   │   ├── organizations.js
│   │   ├── branches.js
│   │   ├── users.js
│   │   ├── members.js
│   │   ├── groups.js
│   │   ├── savings.js
│   │   ├── loanTypes.js
│   │   ├── loans.js
│   │   ├── meetings.js
│   │   └── notifications.js
│   └── README.md

The seed process should:
1. Connect to MongoDB.
2. Clear only development seed data or provide an explicit `--reset` option.
3. Insert parent records first.
4. Store generated IDs.
5. Insert dependent records using those IDs.
6. Validate references.
7. Print a clear insertion summary.
8. Close the database connection.

Never make the seed script destructive by default.

## Required Seed Output

After execution, display something similar to:

Organizations inserted: 4
Branches inserted: 10
Users inserted: 28
Members inserted: 80
Groups inserted: 12
Savings accounts inserted: 80
Savings transactions inserted: 320
Loan types inserted: 20
Loans inserted: 45
Loan reviews inserted: 30
Meetings inserted: 20
Notifications inserted: 50
Audit logs inserted: 100

## Important

The goal is to make the application show data that actually exists in MongoDB.

Do not solve missing database data by adding fallback/mock data inside React.

If an API returns an empty result, fix the database/seed/API integration instead.

Document every seed collection and relationship in this file.
