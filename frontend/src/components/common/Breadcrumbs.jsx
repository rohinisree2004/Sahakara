import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === '') return null;

  // Map path segment to human readable title
  const segmentTitles = {
    'super-admin': 'Super Admin',
    'org-admin': 'Organization Admin',
    'branches': 'Branches',
    'users': 'Users',
    'members': 'Members',
    'roles': 'Roles & Permissions',
    'groups': 'Member Groups',
    'dashboard': 'Dashboard',
    'list': 'Registry Directory',
    'create': 'New Onboarding',
    'profile': 'Profile Details',
    'approvals': 'Pending Approvals',
    'kyc': 'KYC Verification',
    'reports': 'Reports & Analytics',
    'logs': 'Audit Trail',
    'transfers': 'Branch Transfers',
    'assign': 'Role Assignment',
    'review': 'Access Review',
    'leader': 'Leader Desk',
    'management': 'Branch Operations',
    'savings': 'Savings Desks',
    'loans': 'Loan Portfolios',
    'passbook': 'Passbook Journal',
    'repayments': 'EMI Repayments',
    'accounting': 'General Ledger',
    'meetings': 'Group AGMs',
    'complaints': 'Support Desk',
  };

  let currentPath = '';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-1">
      <Link to="/" className="hover:text-teal-700 flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline font-medium">Home</span>
      </Link>

      {pathnames.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathnames.length - 1;
        const title = segmentTitles[segment] || (segment.length > 15 ? `${segment.substring(0, 8)}...` : segment);

        return (
          <React.Fragment key={currentPath}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-bold text-teal-700 capitalize">{title}</span>
            ) : (
              <Link to={currentPath} className="hover:text-teal-800 capitalize transition-colors font-medium">
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
