import React, { useState, useEffect, useCallback } from 'react';
import { fetchMeetingReports } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Printer, 
  ArrowLeft, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';

const MeetingReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hierarchical Filter
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const res = await fetchMeetingReports(params);
      if (res.data && res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load governance reports');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handlePrint = () => {
    window.print();
  };

  const { totalCount = 0, byType = [], byStatus = [] } = reportData || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Printable Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/meetings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider mb-2 font-mono"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Governance Hub
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-teal-600" />
              Governance & Meeting Analytics Report
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Aggregated governance compliance, assembly category distributions, and completion rates.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Governance Report
          </button>
        </div>

        {/* Hierarchical Filter */}
        <HierarchicalFilterBar
          onFilterChange={({ organizationId, branchId }) => {
            setSelectedOrgId(organizationId);
            setSelectedBranchId(branchId);
          }}
          showGroupFilter={false}
          showMemberFilter={false}
        />
      </div>

      {/* Summary KPI Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Meetings Registered</span>
          <p className="text-4xl font-extrabold text-slate-900">{totalCount}</p>
          <p className="text-xs font-medium text-teal-700 font-mono">Real-time MongoDB aggregated total</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
          <Calendar className="w-7 h-7" />
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Breakdown by Type */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-600" />
            Meetings by Category & Classification
          </h2>

          <div className="space-y-3">
            {byType.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No categorized meetings found.</p>
            ) : (
              byType.map((t) => {
                const pct = totalCount > 0 ? Math.round((t.count / totalCount) * 100) : 0;
                return (
                  <div key={t._id || 'other'} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{t._id || 'Other / Unclassified'}</span>
                      <span className="font-mono text-teal-800">{t.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Breakdown by Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Meetings by Operational Status
          </h2>

          <div className="space-y-3">
            {byStatus.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No status data found.</p>
            ) : (
              byStatus.map((s) => {
                const pct = totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0;
                const statusColor = s._id === 'Completed' ? 'bg-emerald-600' : s._id === 'Cancelled' ? 'bg-rose-600' : 'bg-teal-600';
                return (
                  <div key={s._id || 'other'} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{s._id || 'Unspecified'}</span>
                      <span className="font-mono text-teal-800">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className={`${statusColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MeetingReportsPage;
