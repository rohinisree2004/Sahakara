import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  ArrowLeft, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Banknote, 
  Printer, 
  Sparkles,
  Building2,
  FileText
} from 'lucide-react';
import { fetchEmiSchedule, generateLoanScheduleApi } from '../../services/api';

const EmiSchedulePage = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchEmiSchedule(loanId);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load EMI schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loanId) {
      loadSchedule();
    }
  }, [loanId]);

  const handleGenerateSchedule = async () => {
    try {
      setGenerating(true);
      await generateLoanScheduleApi(loanId, {});
      await loadSchedule();
    } catch (err) {
      alert('Error generating schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const loan = data?.loan;
  const schedule = data?.schedule || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calculator className="w-7 h-7 text-teal-600" />
                <span>Loan Repayment Amortization Schedule</span>
              </h1>
              {loan?.applicationId && (
                <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs">
                  {loan.applicationId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete installment breakdown & ledger synchronization for {loan?.memberId?.fullName || 'Borrower'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Schedule</span>
          </button>

          {schedule.length === 0 && (
            <button
              onClick={handleGenerateSchedule}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              <span>Generate Amortization Schedule</span>
            </button>
          )}

          <Link
            to={`/repayments/record?loanId=${loan?._id || loanId}`}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <Banknote className="w-4 h-4" />
            <span>Collect Installment</span>
          </Link>
        </div>
      </div>

      {/* Loan Profile & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Borrower Folio Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Borrower Account
            </h3>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center justify-center text-lg">
              {loan?.memberId?.fullName?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{loan?.memberId?.fullName || 'Member Name'}</div>
              <div className="text-xs text-slate-500 font-mono">{loan?.memberId?.memberId || 'MEM-Folio'}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Society:</span>
              <span className="font-bold text-slate-900">{loan?.organizationId?.name || 'Cooperative Society'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Branch:</span>
              <span className="font-bold text-slate-900">{loan?.branchId?.branchName || 'Main Branch'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Contact:</span>
              <span className="font-bold text-slate-900">{loan?.memberId?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Financial Terms Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Banknote className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Financial Terms & Recovery Status
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Disbursed Amount</p>
              <p className="text-base font-black font-mono text-slate-900 mt-1">
                {formatCurrency(loan?.disbursedAmount || loan?.approvedAmount)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200">
              <p className="text-[10px] text-teal-800 font-bold uppercase">Total Recovered</p>
              <p className="text-base font-black font-mono text-teal-800 mt-1">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200">
              <p className="text-[10px] text-rose-800 font-bold uppercase">Outstanding Balance</p>
              <p className="text-base font-black font-mono text-rose-800 mt-1">
                {formatCurrency(summary.outstandingBalance !== undefined ? summary.outstandingBalance : loan?.outstandingAmount)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Interest & Tenure</p>
              <p className="text-base font-black font-mono text-slate-900 mt-1">
                {loan?.interestRate || 12}% / {loan?.tenure || 12}M
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Installment Schedule Breakdown ({schedule.length} EMIs)
          </h3>
          <span className="text-xs font-bold text-slate-400">Total Payable: {formatCurrency(summary.totalPayable)}</span>
        </div>

        {schedule.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Calculator className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No amortization schedule generated yet.</p>
            <p className="text-xs text-slate-500">Click "Generate Amortization Schedule" above to generate the monthly installments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Principal</th>
                  <th className="py-4 px-6">Interest</th>
                  <th className="py-4 px-6">Total EMI</th>
                  <th className="py-4 px-6">Paid Amount</th>
                  <th className="py-4 px-6">Remaining Balance</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schedule.map((emi) => {
                  const isPaid = emi.status === 'Paid';
                  const isOverdue = emi.status === 'Overdue' || (!isPaid && new Date(emi.dueDate) < new Date());

                  return (
                    <tr key={emi._id || emi.emiNumber} className={`hover:bg-slate-50/60 transition-colors ${isPaid ? 'bg-teal-50/10' : ''}`}>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        #{emi.emiNumber}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {formatDate(emi.dueDate)}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-800">
                        {formatCurrency(emi.principalAmount)}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-800">
                        {formatCurrency(emi.interestAmount)}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {formatCurrency(emi.emiAmount)}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-teal-800">
                        {formatCurrency(emi.paidAmount || 0)}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-600">
                        {formatCurrency(emi.remainingAmount)}
                      </td>

                      <td className="py-4 px-6">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[10px]">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> Upcoming
                          </span>
                        )}
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

export default EmiSchedulePage;
