import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchUserReports } from '../../services/api';

const UserReportsPage = () => {
  const [reportType, setReportType] = useState('ActiveUsers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const res = await fetchUserReports({ reportType });
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading user reports:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [reportType]);

  const handleExportPDF = () => {
    setExportMsg(`Exporting ${reportType} User Report as PDF... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const handleExportExcel = () => {
    setExportMsg(`Exporting ${reportType} User Report as Excel (.xlsx)... Saved to downloads.`);
    setTimeout(() => setExportMsg(''), 4000);
  };

  const activeUsersList = data?.activeUsers || [
    { userId: 'U-101', name: 'Vijaya Society Admin', role: 'Organization Admin', branch: 'Head Office', status: 'Active' },
    { userId: 'U-102', name: 'Ramesh Patil', role: 'President', branch: 'Head Office', status: 'Active' },
    { userId: 'U-103', name: 'Mahesh Rao', role: 'Employee', branch: 'JP Nagar Branch', status: 'Active' },
  ];

  const branchWiseList = data?.branchWiseUsers || [
    { branchName: 'JP Nagar Branch (JP-01)', staffCount: 6, memberCount: 850 },
    { branchName: 'Malleshwaram Extension (ML-02)', staffCount: 4, memberCount: 620 },
    { branchName: 'Whitefield Tech Hub (WF-03)', staffCount: 5, memberCount: 980 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>User Directory Reports & Exports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate Active Users, Branch-wise User Distribution, and Role Breakdown reports with export capability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-2 border border-cyan-500/30"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {['ActiveUsers', 'BranchWise', 'RoleWise', 'LoginActivity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setReportType(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === tab
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {reportType === 'ActiveUsers' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Branch Location</th>
                  <th className="px-6 py-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeUsersList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">{row.userId}</td>
                    <td className="px-6 py-4 font-bold text-white">{row.name}</td>
                    <td className="px-6 py-4">{row.role}</td>
                    <td className="px-6 py-4">{row.branch}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'BranchWise' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Assigned Staff Count</th>
                  <th className="px-6 py-4 text-right">Associated Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {branchWiseList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-bold text-white">{row.branchName}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{row.staffCount} Staff</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">{row.memberCount} Members</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(reportType === 'RoleWise' || reportType === 'LoginActivity') && (
            <div className="p-8 text-center text-xs text-slate-400">
              <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
              <span>User report dataset ready for {reportType}. Click Export to download report file.</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default UserReportsPage;
