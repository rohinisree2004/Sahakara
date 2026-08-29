import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  ArrowLeft, 
  Banknote, 
  Calendar, 
  User, 
  Loader2, 
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { fetchUpcomingEMIs } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const UpcomingEmiPage = () => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParams, setFilterParams] = useState({});

  const fetchUpcoming = useCallback(async (currentFilters = filterParams) => {
    try {
      setLoading(true);
      const params = {};
      if (currentFilters.organizationId && currentFilters.organizationId !== 'All') params.organizationId = currentFilters.organizationId;
      if (currentFilters.branchId && currentFilters.branchId !== 'All') params.branchId = currentFilters.branchId;
      if (currentFilters.groupId && currentFilters.groupId !== 'All') params.groupId = currentFilters.groupId;
      if (currentFilters.memberId && currentFilters.memberId !== 'All') params.memberId = currentFilters.memberId;

      const res = await fetchUpcomingEMIs(params);
      if (res.data && res.data.success) {
        setEmis(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch upcoming EMIs.');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchUpcoming(filterParams);
  }, [fetchUpcoming, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const filteredEmis = emis.filter((e) => {
    const term = searchTerm.toLowerCase();
    const memberName = (e.memberId?.fullName || `${e.memberId?.firstName || ''} ${e.memberId?.lastName || ''}`).toLowerCase();
    const loanApp = (e.loanId?.applicationId || '').toLowerCase();
    const memberId = (e.memberId?.memberId || '').toLowerCase();
    return memberName.includes(term) || loanApp.includes(term) || memberId.includes(term);
  });

  const totalAmount = filteredEmis.reduce((sum, e) => sum + (e.emiAmount - (e.paidAmount || 0)), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/repayments/dashboard"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-teal-600" />
              <span>Upcoming EMI Collections</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Scheduled loan installments falling due in the next 30 days across society network
            </p>
          </div>
        </div>

        <Link
          to="/repayments/record"
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
        >
          <Banknote className="w-4 h-4" />
          <span>Record Counter Repayment</span>
        </Link>
      </div>

      {/* Hierarchical Filter */}
      <HierarchicalFilterBar onFilterChange={handleFilterChange} initialValues={filterParams} />

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scheduled Installments</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">{filteredEmis.length}</div>
            <p className="text-[11px] text-amber-700 font-bold mt-0.5">Due in Next 30 Calendar Days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Projected Cash Recovery</span>
            <div className="text-3xl font-black font-mono text-teal-800 mt-1">{formatCurrency(totalAmount)}</div>
            <p className="text-[11px] text-teal-700 font-bold mt-0.5">Principal + Accrued Interest Corpus</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
            <Banknote className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
        
        {/* Search Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search member name, member ID, or loan reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredEmis.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No upcoming EMIs found.</p>
            <p className="text-xs text-slate-500">All loan accounts in this scope are fully settled or have no installments due within 30 days.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Member Applicant</th>
                  <th className="py-4 px-6">Loan Account</th>
                  <th className="py-4 px-6">Society & Branch</th>
                  <th className="py-4 px-6">Installment #</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">EMI Amount</th>
                  <th className="py-4 px-6 text-center">Collection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEmis.map((emi) => {
                  const netDue = emi.emiAmount - (emi.paidAmount || 0);
                  const memberName = emi.memberId?.fullName || `${emi.memberId?.firstName || ''} ${emi.memberId?.lastName || ''}`;

                  return (
                    <tr key={emi._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{memberName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emi.memberId?.memberId || 'MEM-Folio'}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-teal-800 font-mono">{emi.loanId?.applicationId}</div>
                        <div className="text-[10px] text-slate-400">{emi.loanId?.loanTypeId?.name || 'Micro Loan'}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{emi.organizationId?.name || 'Cooperative Society'}</div>
                        <div className="text-[10px] text-slate-400">{emi.branchId?.branchName || 'Main Branch'}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                          EMI #{emi.emiNumber}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {formatDate(emi.dueDate)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-slate-900 text-sm">{formatCurrency(netDue)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Principal: {formatCurrency(emi.principalAmount)}</div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/repayments/record?loanId=${emi.loanId?._id || emi.loanId}&emiNumber=${emi.emiNumber}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 text-xs font-bold transition-all shadow-xs"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Collect Payment</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default UpcomingEmiPage;
