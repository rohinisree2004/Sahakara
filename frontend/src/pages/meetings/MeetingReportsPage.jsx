import React, { useState, useEffect } from 'react';
import { fetchMeetingReports } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Printer, 
  ArrowLeft, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const MeetingReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetchMeetingReports();
        setReportData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load governance reports');
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-6">
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 rounded-xl">
          {error || 'Unable to generate meeting reports.'}
        </div>
      </div>
    );
  }

  const { totalCount = 0, byType = [], byStatus = [] } = reportData;

  return (
    <div className="p-6 space-y-6">
      {/* Printable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/meetings/dashboard" className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Governance & Meeting Analytics Report
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time MongoDB aggregated metrics across society operations</p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          Print Governance Report
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Meetings Recorded</div>
          <div className="text-3xl font-extrabold text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Calendar className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Type */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            Meetings by Category & Type
          </h2>

          <div className="space-y-3">
            {byType.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No categories recorded.</div>
            ) : (
              byType.map((t) => {
                const pct = totalCount > 0 ? Math.round((t.count / totalCount) * 100) : 0;
                return (
                  <div key={t._id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{t._id || 'Unspecified'}</span>
                      <span className="text-emerald-400">{t.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Breakdown by Status */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            Meetings by Operational Status
          </h2>

          <div className="space-y-3">
            {byStatus.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No statuses recorded.</div>
            ) : (
              byStatus.map((s) => {
                const pct = totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0;
                return (
                  <div key={s._id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{s._id || 'Scheduled'}</span>
                      <span className="text-amber-400">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all" style={{ width: `${pct}%` }}></div>
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
