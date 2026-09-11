# 🌱 SAHAKARA ERP

### *Cloud-Native Multi-Tenant Cooperative Society & SHG/JLG ERP Platform*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![NodeJS](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-4EA94B?style=for-the-badge&logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-8.x-880000?style=for-the-badge&logo=mongoose)
![JWT](https://img.shields.io/badge/JWT-HS256-black?style=for-the-badge&logo=jsonwebtokens)

---

## 📌 Executive Summary

**Sahakara ERP** is an end-to-end Enterprise Resource Planning (ERP) platform designed for **Primary Agricultural Credit Societies (PACS)**, Urban Cooperative Societies, Kudumbashree Units, Self-Help Groups (**SHG**), and Joint Liability Groups (**JLG**).

Built in compliance with the **Kerala Cooperative Societies Act (1969)** and the **NABARD SHG-Bank Linkage Framework**, the system digitizes grassroots community finance with modern institutional banking standards.

---

## 🏛 Hierarchical Multi-Tenancy Architecture

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

---

## 🌟 Key Platform Modules & Capabilities

| Module | Core Functionality | Verification Status |
| :--- | :--- | :---: |
| **01. Public Portal** | Cooperative benefits, statutory info, inquiry desk | ✅ Operational |
| **02. Auth & RBAC** | JWT HS256, bcrypt hashing, dynamic role switching | ✅ Operational |
| **03. Super Admin** | Multi-society onboarding, health monitoring, audit logs | ✅ Operational |
| **04. Org Admin** | Branch setup, society-wide aggregates, loan policies | ✅ Operational |
| **05. Branch Operations** | Staff assignment, manager desks, KYC verification | ✅ Operational |
| **06. Member KYC** | Aadhaar/PAN/Bank KYC pipeline, compliance note stamps | ✅ Operational |
| **07. SHG/JLG Groups** | Group federation, leader elections, active context switching | ✅ Operational |
| **08. Thrift Savings** | Auto account generation (`SAV-{Group}-{Member}`), ₹500 buffer | ✅ Operational |
| **09. Digital Passbook** | Physical leather-bound theme, live ledger, `@media print` | ✅ Operational |
| **10. Loan Products & CIBIL**| Reducing-balance interest, rule-based CIBIL score (300-900) | ✅ Operational |
| **11. Democratic Sanction** | 2-tier approval: President review + Branch Manager sanction | ✅ Operational |
| **12. EMI Amortization** | Reducing-balance schedules, automated savings auto-recovery | ✅ Operational |
| **13. General Ledger** | Double-entry accounting (`Debits == Credits`), Chart of Accounts | ✅ Operational |
| **14. Trial Balance** | Real-time financial reports with zero-variance balance badge | ✅ Operational |
| **15. Meeting Governance** | Agenda planner, live attendance, quorum engine, minutes | ✅ Operational |
| **16. Grievance & Chat** | Tiered complaint escalation desk & real-time intra-group chat | ✅ Operational |

---

## 📊 Tailored Persona Workspaces

- **Super Admin Dashboard (`/super-admin/dashboard`)**: Platform-wide monitoring, society onboarding queue, audit search.
- **Organization Admin Dashboard (`/org-admin/dashboard`)**: Society KPIs, branch performance, interest & credit policy.
- **Branch Manager Dashboard (`/branches/dashboard`)**: Credit committee desk, loan sanctioning, branch GL/Trial balance.
- **Group President Workspace (`/executive/dashboard`)**: Member roster, 1st tier loan recommendation, grievance triage.
- **Group Secretary Workspace (`/secretary/dashboard`)**: Meeting scheduler, live attendance with quorum checks, minutes drafting.
- **Group Treasurer Workspace (`/treasurer/dashboard`)**: Savings deposit approvals, withdrawal desk, EMI installment collection.
- **Employee / Field Officer (`/employee/dashboard`)**: Doorstep collections, rapid KYC onboarding, SHG assistance.
- **Regular Member Self-Service (`/member/dashboard`)**: Digital passbook, loan applications, EMI tracking, group chat.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite 5
- **Styling**: TailwindCSS 3.4 & Lucide React
- **Routing**: React Router 6 with dynamic Role & Context guards
- **HTTP Client**: Axios with automatic `x-active-group` header injection

### Backend
- **Runtime**: Node.js 20 LTS & Express 4
- **Database**: MongoDB 7 with Mongoose 8 ORM
- **Security**: Helmet, CORS, Express Rate Limit, bcrypt, JWT
- **Accounting**: Double-entry ledger engine with atomic balance updates

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- MongoDB 6+ running locally or MongoDB Atlas URI

### 1. Clone Repository
```bash
git clone https://github.com/rohinisree2004/Sahakara.git
cd Sahakara
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment in backend/.env:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/sahakara_erp
# JWT_SECRET=your_super_secret_jwt_key
# JWT_EXPIRE=30d

# Seed comprehensive database (Societies, Branches, Users, Members, Loans, Accounting):
npm run seed

# Start backend development server:
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📚 Authoritative Project Documentation

Comprehensive technical documentation is maintained in the repository root:
- [PROJECT_OVERVIEW.md](file:///PROJECT_OVERVIEW.md) — Master Architecture and Persona Specification
- [PROJECT_PROGRESS.md](file:///PROJECT_PROGRESS.md) — 16-Module Quality Audit and Completion Matrix
- [PROJECT_DIARY.md](file:///PROJECT_DIARY.md) — Day-by-day 28-Day Development Chronicle
- [API_AND_FRONTEND_DOCS.md](file:///API_AND_FRONTEND_DOCS.md) — API Endpoints & Frontend Architecture
- [DATABASE_SCHEMA_AND_ARCHITECTURE.md](file:///DATABASE_SCHEMA_AND_ARCHITECTURE.md) — MongoDB Data Dictionary

---

## 📄 License & Academic Attribution
Developed as part of the MCA Mini Project curriculum.
Designed & Developed by **Rohini Sreekumar**.
All rights reserved.
