import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { fetchMemberPassbook, fetchSavingsAccounts } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Printer, 
  Download, 
  User, 
  Wallet, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ArrowDownLeft, 
  ArrowUpRight,
  Building2,
  GitBranch,
  CreditCard,
  Sparkles,
  Loader2,
  Search,
  Users,
  Check
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const PassbookPage = () => {
  const { accountId: paramAccountId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryAccountId = searchParams.get('accountId');
  const queryMemberId = searchParams.get('memberId');

  const { user, activeGroup } = useAuth();
  const activeRole = activeGroup?.role || user?.role || 'Member';
  const isPlatformStaff = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'].includes(activeRole);
  const isExecutive = ['President', 'Treasurer', 'Secretary'].includes(activeRole);
  const isRegularMember = !isPlatformStaff && !isExecutive;

  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(paramAccountId || queryAccountId || null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [filterParams, setFilterParams] = useState(queryMemberId ? { memberId: queryMemberId } : {});

  const { switchActiveGroup } = useAuth();

  const getBackRoute = () => {
    if (activeRole === 'President') return '/executive/dashboard';
    if (activeRole === 'Treasurer') return '/treasurer/dashboard';
    if (activeRole === 'Secretary') return '/secretary/dashboard';
    if (activeRole === 'Member') return '/member/dashboard';
    return '/savings/dashboard';
  };

  // React to URL param changes
  useEffect(() => {
    if (paramAccountId) {
      setSelectedAccountId(paramAccountId);
    } else if (queryAccountId) {
      setSelectedAccountId(queryAccountId);
    }
  }, [paramAccountId, queryAccountId]);

  // Load available savings accounts
  const loadAccounts = useCallback(async (customFilterParams = filterParams) => {
    try {
      const params = { limit: 100 };
      if (customFilterParams.organizationId && customFilterParams.organizationId !== 'All') params.organizationId = customFilterParams.organizationId;
      if (customFilterParams.branchId && customFilterParams.branchId !== 'All') params.branchId = customFilterParams.branchId;
      
      if (isRegularMember) {
        params.myOnly = 'true';
        if (activeGroup?._id) {
          params.groupId = activeGroup._id;
        } else if (customFilterParams.groupId && customFilterParams.groupId !== 'All') {
          params.groupId = customFilterParams.groupId;
        }
      } else {
        if (!isPlatformStaff && activeGroup?._id) {
          params.groupId = activeGroup._id;
        } else if (customFilterParams.groupId && customFilterParams.groupId !== 'All') {
          params.groupId = customFilterParams.groupId;
        } else if (activeGroup?._id) {
          params.groupId = activeGroup._id;
        }
      }

      if (customFilterParams.memberId && customFilterParams.memberId !== 'All') params.memberId = customFilterParams.memberId;
      else if (queryMemberId && !customFilterParams.memberId) params.memberId = queryMemberId;

      const res = await fetchSavingsAccounts(params);
      if (res.data && res.data.success && res.data.data) {
        const accList = res.data.data;
        setAvailableAccounts(accList);
        
        let targetId = paramAccountId || queryAccountId;
        
        // Match by memberId if queryMemberId was supplied
        if (!targetId && queryMemberId) {
          const matchMem = accList.find(a => (a.memberId?._id || a.memberId)?.toString() === queryMemberId.toString());
          if (matchMem) targetId = matchMem._id;
        }

        // For regular members, prioritize account matching activeGroup._id
        if (!targetId && isRegularMember && activeGroup?._id) {
          const matchActiveGrp = accList.find(a => (a.groupId?._id || a.groupId)?.toString() === activeGroup._id.toString());
          if (matchActiveGrp) targetId = matchActiveGrp._id;
        }

        if (targetId) {
          const match = accList.find(a => a._id === targetId);
          if (match) setSelectedAccountId(match._id);
          else setSelectedAccountId(targetId);
        } else if (accList.length > 0) {
          setSelectedAccountId(accList[0]._id);
        } else if (accList.length === 0) {
          setSelectedAccountId(null);
          setAccount(null);
          setTransactions([]);
        }
      }
    } catch (err) {
      console.warn('Error loading savings accounts for passbook:', err.message);
    }
  }, [paramAccountId, queryAccountId, queryMemberId, filterParams, isRegularMember, isPlatformStaff, activeGroup]);

  useEffect(() => {
    loadAccounts(filterParams);
  }, [loadAccounts, filterParams]);

  // Sync selected account when active group changes for a regular member
  useEffect(() => {
    if (isRegularMember && activeGroup?._id && availableAccounts.length > 0 && !paramAccountId && !queryAccountId) {
      const matchActiveGrp = availableAccounts.find(a => (a.groupId?._id || a.groupId)?.toString() === activeGroup._id.toString());
      if (matchActiveGrp && matchActiveGrp._id !== selectedAccountId) {
        setSelectedAccountId(matchActiveGrp._id);
      }
    }
  }, [activeGroup, availableAccounts, isRegularMember, paramAccountId, queryAccountId, selectedAccountId]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  // Load passbook for selected account
  useEffect(() => {
    const loadPassbook = async () => {
      if (!selectedAccountId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const passbookParams = activeGroup?._id ? { groupId: activeGroup._id } : {};
        const response = await fetchMemberPassbook(selectedAccountId, passbookParams);
        if (response.data?.success) {
          const accDoc = response.data.data.account;
          setAccount(accDoc);
          setTransactions(response.data.data.transactions || []);
        }
      } catch (error) {
        console.warn('Failed to load passbook', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadPassbook();
  }, [selectedAccountId, activeGroup]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(dateString));
  };

  const filteredAccounts = availableAccounts.filter(acc => {
    if (!memberSearch.trim()) return true;
    const term = memberSearch.toLowerCase();
    const name = (acc.memberId?.fullName || '').toLowerCase();
    const memCode = (acc.memberId?.memberId || '').toLowerCase();
    const accNum = (acc.accountNumber || '').toLowerCase();
    const phone = (acc.memberId?.phone || '').toLowerCase();
    const grpName = (acc.groupId?.groupName || '').toLowerCase();
    const grpCode = (acc.groupId?.groupCode || '').toLowerCase();
    return name.includes(term) || memCode.includes(term) || accNum.includes(term) || phone.includes(term) || grpName.includes(term) || grpCode.includes(term);
  });

  const totalDeposits = transactions
    .filter(t => t.transactionType === 'Deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={getBackRoute()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span>Digital Member Passbook</span>
                  {account && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold">
                      {account.accountNumber}
                    </span>
                  )}
                </h1>
                {activeGroup && !isPlatformStaff && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                    Group: {activeGroup.groupName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Verified savings ledger, passbook print desk & transaction history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Passbook</span>
          </button>
        </div>
      </div>

      {/* Governance & Cascading Filter Desk (Platform Staff Only) */}
      {isPlatformStaff && (
        <HierarchicalFilterBar onFilterChange={handleFilterChange} />
      )}

      {/* Group Members Passbook Directory & Quick Switcher (for President / Treasurer / Staff) */}
      {!isRegularMember && availableAccounts.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Group Member Passbook Roster
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click any group member below to open and inspect their digital passbook ({availableAccounts.length} members)
                </p>
              </div>
            </div>

            {/* Quick Search & Select Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search member name or ID..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <select
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer max-w-[260px]"
              >
                {filteredAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>
                    {acc.memberId?.fullName || 'Member'} ({acc.memberId?.memberId || 'ID'}) • {acc.accountNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Passbook Cards Quick Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {filteredAccounts.map(acc => {
              const isSelected = acc._id === selectedAccountId;
              return (
                <button
                  key={acc._id}
                  onClick={() => setSelectedAccountId(acc._id)}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 ${
                    isSelected 
                      ? 'bg-teal-50/90 border-teal-500 shadow-xs ring-2 ring-teal-500/20' 
                      : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {acc.memberId?.fullName ? acc.memberId.fullName.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {acc.memberId?.fullName || 'Member'}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {acc.accountNumber}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Bal:</span>
                    <span className={`font-mono font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                      ₹{acc.currentBalance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : !account ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-900">No Passbook Account Selected</h2>
          <p className="text-xs text-slate-500 text-center">
            No active savings account found matching the current filter parameters. Select a member or change scope filters above.
          </p>
        </div>
      ) : (
        <>
          {/* Physical Passbook Style Cover & Details Card */}
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6 border border-teal-700/50">
            
            {/* Background watermarks */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-700/60 pb-6 relative z-10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-teal-300 font-bold">
                  Cooperative Society Passbook Folio
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {account.organizationId?.name || 'Sahakara Cooperative Bank Ltd.'}
                </h2>
                <div className="text-xs text-teal-200 flex items-center gap-2 mt-1">
                  <GitBranch className="w-3.5 h-3.5 text-teal-400" />
                  <span>{account.branchId?.branchName || 'Main Branch'}</span>
                  <span>•</span>
                  <span>Branch Code: {account.branchId?.branchCode || 'BR-01'}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-teal-300 uppercase tracking-widest font-bold">Current Passbook Balance</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight">
                  {formatCurrency(account.currentBalance)}
                </div>
                <div className="text-[10px] text-teal-200 mt-0.5">
                  Status: <strong className="text-white font-bold">{account.status || 'Active'}</strong>
                </div>
              </div>
            </div>

            {/* Member and account metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs relative z-10">
              <div>
                <span className="text-teal-300/80 text-[10px] font-bold uppercase tracking-wider">Account Holder</span>
                <p className="text-white font-bold text-sm mt-0.5">{account.memberId?.fullName}</p>
                <p className="text-teal-200 font-mono text-[11px]">ID: {account.memberId?.memberId}</p>
              </div>

              <div>
                <span className="text-teal-300/80 text-[10px] font-bold uppercase tracking-wider">SHG / Group Unit</span>
                <p className="text-white font-bold text-sm mt-0.5 truncate">{account.groupId?.groupName || activeGroup?.groupName || 'Primary SHG'}</p>
                <p className="text-teal-200 font-mono text-[11px]">Code: {account.groupId?.groupCode || 'SHG'}</p>
              </div>

              <div>
                <span className="text-teal-300/80 text-[10px] font-bold uppercase tracking-wider">Account Number</span>
                <p className="text-white font-bold font-mono text-sm mt-0.5 truncate">{account.accountNumber}</p>
                <p className="text-teal-200 text-[11px]">{account.accountType || 'Savings Deposit'}</p>
              </div>

              <div>
                <span className="text-teal-300/80 text-[10px] font-bold uppercase tracking-wider">Interest Rate</span>
                <p className="text-white font-bold text-sm mt-0.5">{account.interestRate || 4.5}% p.a.</p>
                <p className="text-teal-200 text-[11px]">Compounded Quarterly</p>
              </div>

              <div>
                <span className="text-teal-300/80 text-[10px] font-bold uppercase tracking-wider">Opening Date</span>
                <p className="text-white font-bold text-sm mt-0.5">{formatDate(account.createdAt)}</p>
                <p className="text-teal-200 text-[11px]">KYC Verified</p>
              </div>
            </div>

          </div>

          {/* Statement Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Recorded Inflow</div>
              <div className="text-2xl font-black text-teal-800">{formatCurrency(totalDeposits)}</div>
              <div className="text-[11px] text-slate-500">Cumulative member deposits</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Withdrawals</div>
              <div className="text-2xl font-black text-rose-700">{formatCurrency(totalWithdrawals)}</div>
              <div className="text-[11px] text-slate-500">Authorized debit settlements</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Journal Entries</div>
              <div className="text-2xl font-black text-slate-900">{transactions.length} Transactions</div>
              <div className="text-[11px] text-slate-500">Recorded passbook lines</div>
            </div>

          </div>

          {/* Passbook Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Passbook Transaction Journal
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Chronological record of deposits, withdrawals, interest credits, and running balance
                </p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {transactions.length} Records
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No transactions recorded on this passbook yet.</p>
                <p className="text-xs text-slate-500">Deposits and credits will be recorded here chronologically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Transaction ID & Ref</th>
                      <th className="py-4 px-6">Narration / Particulars</th>
                      <th className="py-4 px-6 text-right">Debit (₹)</th>
                      <th className="py-4 px-6 text-right">Credit (₹)</th>
                      <th className="py-4 px-6 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transactions.map((txn) => {
                      const isDeposit = txn.transactionType === 'Deposit' || txn.transactionType === 'Interest';
                      const isLoanEmiDebit = txn.referenceNumber?.includes('EMI') ||
                                             txn.paymentMethod === 'Savings Auto-Debit' ||
                                             txn.paymentMethod === 'Savings Account Auto-Debit' ||
                                             txn.remarks?.toLowerCase().includes('emi') ||
                                             txn.remarks?.toLowerCase().includes('loan');

                      return (
                        <tr key={txn._id} className={`hover:bg-teal-50/20 transition-colors font-mono ${isLoanEmiDebit ? 'bg-amber-50/30' : ''}`}>
                          <td className="py-4 px-6 font-sans text-slate-700">
                            {formatDate(txn.transactionDate || txn.createdAt)}
                          </td>

                          <td className="py-4 px-6 font-bold text-teal-800">
                            <div>{txn.transactionId}</div>
                            {txn.referenceNumber && (
                              <div className={`text-[10px] ${isLoanEmiDebit ? 'text-amber-800 font-bold' : 'text-slate-400 font-normal'}`}>
                                {txn.referenceNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-6 font-sans text-slate-800 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold">{txn.remarks || txn.transactionType}</span>
                              {isLoanEmiDebit && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                  🏦 Loan EMI Recovery
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Method: <strong className={isLoanEmiDebit ? 'text-amber-800' : 'text-slate-700'}>{txn.paymentMethod || 'Cash'}</strong>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right text-rose-600 font-bold">
                            {!isDeposit ? formatCurrency(txn.amount) : '—'}
                          </td>

                          <td className="py-4 px-6 text-right text-emerald-700 font-bold">
                            {isDeposit ? formatCurrency(txn.amount) : '—'}
                          </td>

                          <td className="py-4 px-6 text-right font-black text-slate-900">
                            {formatCurrency(txn.balanceAfterTransaction)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};

export default PassbookPage;
