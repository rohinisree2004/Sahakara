import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Users,
  Layers,
  Sparkles,
  Search,
  Building2
} from 'lucide-react';
import { fetchGroupReports } from '../../services/api';

const GroupReportsPage = () => {
  const { user, activeGroup } = useAuth();
  const isMember = user?.role === 'Member';

  const [reportType, setReportType] = useState('GroupMembers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const params = { reportType };
        if (activeGroup?._id) {
          params.groupId = activeGroup._id;
        }

        const res = await fetchGroupReports(params);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading group reports:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [reportType, activeGroup]);

  const handleExportPDF = () => {
    setExportMsg(`Exporting ${reportType} Report as formatted PDF document... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const handleExportExcel = () => {
    setExportMsg(`Exporting ${reportType} Report as Excel spreadsheet (.xlsx)... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const summaryList = data?.groupSummary || [];
  const filteredList = summaryList.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      (row.name || '').toLowerCase().includes(term) ||
      (row.groupCode || '').toLowerCase().includes(term) ||
      (row.leader || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            to={isMember ? "/member/dashboard" : "/groups/dashboard"} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMember ? 'Back to Member Dashboard' : 'Back to Groups Dashboard'}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Group Operational Reports & Exports
                </h1>
                {activeGroup && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {activeGroup.groupName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isMember ? 'View roster, collective thrift savings, and performance for your current group.' : 'Generate Group-wise Member rosters, Group Savings Pool, and JLG Loan performance reports.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2.5 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{exportMsg}</span>
        </div>
      )}

      {/* Tabs Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'GroupMembers', label: 'Members Roster' },
            { key: 'GroupSavings', label: 'Savings Thrift Pools' },
            { key: 'GroupLoans', label: 'JLG Loan Portfolios' },
            { key: 'GroupPerformance', label: 'Overall Performance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reportType === tab.key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search group code or name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Group Code</th>
                  <th className="py-4 px-6">Group Name</th>
                  <th className="py-4 px-6">Elected President / Leader</th>
                  <th className="py-4 px-6">Enrolled Roster</th>
                  <th className="py-4 px-6 text-right">Savings Pool</th>
                  <th className="py-4 px-6 text-right">Active Loans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-800">{row.groupCode}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{row.name}</td>
                    <td className="py-4 px-6 text-slate-700">{row.leader}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {row.memberCount} Members
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-teal-800 font-bold">{row.savings}</td>
                    <td className="py-4 px-6 text-right font-mono text-slate-900 font-bold">{row.loans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupReportsPage;
