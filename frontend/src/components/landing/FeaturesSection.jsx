import React from 'react';
import { 
  Building, 
  Users, 
  Wallet, 
  Landmark, 
  Calculator, 
  FileText, 
  ShieldCheck, 
  Lock, 
  BarChart3, 
  Clock, 
  Bell, 
  CheckCircle 
} from 'lucide-react';

const modulesList = [
  {
    icon: Building,
    title: 'Multi-Org & Branch Support',
    description: 'Completely isolated data per society. Manage multiple operational branches under one central administration.',
    tag: 'Multi-Tenant Architecture',
  },
  {
    icon: Users,
    title: 'Member & Group Management',
    description: 'Digital registration, KYC document uploads, group formations, and complete member ledger histories.',
    tag: 'Core Operations',
  },
  {
    icon: Wallet,
    title: 'Savings & Recurring Deposits',
    description: 'Flexible interest rates, auto-accruals, deposit passbooks, and real-time withdrawal controls.',
    tag: 'Financial Module',
  },
  {
    icon: Landmark,
    title: 'Loan Approval & Disbursement',
    description: 'Custom loan schemes, multi-level approval workflows (President/Treasurer), and guarantor tracking.',
    tag: 'Lending Engine',
  },
  {
    icon: Calculator,
    title: 'Automated EMI & Repayment',
    description: 'Fixed & reducing interest calculations, penalty triggers, automated EMI schedules, and receipt generation.',
    tag: 'Automated Billing',
  },
  {
    icon: FileText,
    title: 'Double-Entry Accounting',
    description: 'Journal vouchers, cash books, trial balance, balance sheets, and audit-ready financial reporting.',
    tag: 'Audit & Compliance',
  },
  {
    icon: ShieldCheck,
    title: '7-Level RBAC Control',
    description: 'Strict role hierarchy: Super Admin, Org Admin, President, Secretary, Treasurer, Employee, & Member.',
    tag: 'Security & Access',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Interactive graphical dashboards, monthly recovery projections, and exportable financial PDFs/Excels.',
    tag: 'Business Intelligence',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs">
            <span>25 Enterprise Modules Built-In</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Modern <span className="gradient-text">Cooperative Operations</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Replace legacy offline registers with an all-in-one digital ERP engineered for precision, accountability, and member trust.
          </p>
        </div>

        {/* Grid of Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modulesList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5 text-teal-700 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 mb-3 inline-block font-mono">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-teal-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
