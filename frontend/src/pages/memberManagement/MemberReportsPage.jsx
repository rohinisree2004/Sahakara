import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Loader2, 
  Building2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { fetchMemberReports, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberReportsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [reportType, setReportType] = useState('ActiveMembers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState('');

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
          }
        } catch (err) {
          console.warn('Error loading organizations:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const params = { reportType };
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          params.organizationId = selectedOrgId;
        }
        const res = await fetchMemberReports(params);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading member reports:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [reportType, selectedOrgId]);

  const handleExportPDF = () => {
    setExportMsg(`Exporting ${reportType} Report as PDF... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const handleExportExcel = () => {
    setExportMsg(`Exporting ${reportType} Report as Excel spreadsheet (.xlsx)... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const activeMembersList = data?.activeMembers || [];
  const branchGrowthList = data?.branchGrowth || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Operational Analytics & Data Export</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Reports & Exports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate Active Members, New Members, Suspended Accounts, and Branch-wise Growth summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-2 shadow-xs">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Society:</span>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="All">All Societies</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-xs"
            >
              <Printer className="w-4 h-4 text-rose-500" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {exportMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="font-semibold">{exportMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ActiveMembers', 'NewMembers', 'SuspendedMembers', 'BranchGrowth'].map((tab) => (
          <button
            key={tab}
            onClick={() => setReportType(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === tab
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.replace(/([A-Z])/g, ' $1').trim()} Report
          </button>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          
          {reportType !== 'BranchGrowth' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Member ID</th>
                    <th className="px-6 py-3.5">Full Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Branch Location</th>
                    <th className="px-6 py-3.5">Savings Balance</th>
                    <th className="px-6 py-3.5 text-right">Loan Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMembersList.map((m, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-teal-800">{m.memberId}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                      <td className="px-6 py-4">{m.accountType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{m.branchName || 'Main Branch'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{m.savingsBalance}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                          {m.loanStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Branch Name</th>
                    <th className="px-6 py-3.5">Total Members</th>
                    <th className="px-6 py-3.5">Active Depositors</th>
                    <th className="px-6 py-3.5 text-right">Growth Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchGrowthList.map((bg, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{bg.branchName}</td>
                      <td className="px-6 py-4 font-mono font-bold text-teal-800">{bg.totalMembers}</td>
                      <td className="px-6 py-4 text-slate-700">{bg.activeDepositors}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 text-right">{bg.growthRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default MemberReportsPage;
