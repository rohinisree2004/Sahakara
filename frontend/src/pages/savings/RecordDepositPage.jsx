import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  fetchSavingsAccounts, 
  recordDepositApi,
  fetchOrganizations,
  fetchBranchesList,
  fetchGroupsList 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Wallet, 
  Calendar, 
  FileText, 
  CheckCircle,
  Building2,
  GitBranch,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const RecordDepositPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const prefillAccountId = location.state?.prefillAccountId || '';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState(isSuperAdmin ? 'All' : (user?.organizationId?._id || user?.organizationId || ''));
  const [selectedBranchId, setSelectedBranchId] = useState(isBranchScoped ? userBranchId : (user?.branchId || 'All'));
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    savingsAccountId: prefillAccountId,
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: ''
  });

  // Load orgs for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations();
          if (res.data?.success) {
            const orgs = res.data.data || [];
            setOrganizations(orgs);
            if (orgs.length > 0) setSelectedOrgId(orgs[0]._id);
          }
        } catch (err) {
          console.warn('Error loading orgs:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  // Load branches, groups, accounts when Scope changes
  useEffect(() => {
    const loadScopeAccounts = async () => {
      setIsLoading(true);
      try {
        const orgParam = selectedOrgId && selectedOrgId !== 'All' ? { organizationId: selectedOrgId } : {};
        if (isBranchScoped && userBranchId) {
          orgParam.branchId = userBranchId;
        }

        const [bRes, gRes, accRes] = await Promise.all([
          fetchBranchesList(orgParam),
          fetchGroupsList(orgParam),
          fetchSavingsAccounts({ ...orgParam, status: 'Active', limit: 200 })
        ]);

        if (bRes.data?.success) {
          const bList = bRes.data.data || [];
          setBranches(bList);
          if (isBranchScoped && userBranchId) {
            setSelectedBranchId(userBranchId);
          }
        }
        if (gRes.data?.success) setGroups(gRes.data.data || []);
        if (accRes.data?.success) {
          const accs = accRes.data.data || [];
          setAccounts(accs);
          if (prefillAccountId) {
            setFormData(f => ({ ...f, savingsAccountId: prefillAccountId }));
          } else if (accs.length > 0 && !formData.savingsAccountId) {
            setFormData(f => ({ ...f, savingsAccountId: accs[0]._id }));
          }
        }
      } catch (err) {
        console.warn('Scope accounts error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadScopeAccounts();
  }, [selectedOrgId, isBranchScoped, userBranchId]);

  // Filter accounts by Branch and Group
  const filteredAccounts = accounts.filter((acc) => {
    if (selectedBranchId && selectedBranchId !== 'All') {
      const bId = (acc.branchId?._id || acc.branchId)?.toString();
      if (bId !== selectedBranchId.toString()) return false;
    }
    if (selectedGroupId && selectedGroupId !== 'All') {
      const gDoc = groups.find(g => g._id === selectedGroupId);
      if (gDoc) {
        const memIds = (gDoc.memberIds || []).map(id => (id?._id || id)?.toString());
        const accMemId = (acc.memberId?._id || acc.memberId)?.toString();
        return memIds.includes(accMemId);
      }
    }
    return true;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.savingsAccountId) {
      setError('Please select a target savings account.');
      return;
    }
    if (Number(formData.amount) <= 0) {
      setError('Deposit amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await recordDepositApi({
        ...formData,
        accountId: formData.savingsAccountId,
        savingsAccountId: formData.savingsAccountId,
        amount: Number(formData.amount)
      });

      if (response.data && response.data.success) {
        setSuccessData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  // Success Confirmation Screen
  if (successData) {
    return (
      <div className="max-w-xl mx-auto space-y-6 text-center py-8">
        <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-800 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-teal-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-900">Deposit Voucher Credited</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Transaction Ref: <strong className="text-teal-800">{successData.transaction?.transactionId || 'TXN-SUCCESS'}</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-xs space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">Deposited Amount</span>
            <span className="text-emerald-700 font-black font-mono text-base">+{formatCurrency(successData.transaction?.amount || formData.amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">Payment Method</span>
            <span className="text-slate-900 font-bold">{formData.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-2 text-xs">
            <span className="text-slate-500 font-bold">Updated Account Balance</span>
            <span className="text-slate-900 font-black font-mono text-base">{formatCurrency(successData.newBalance)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link 
            to={`/savings/passbook/${formData.savingsAccountId}`}
            className="px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Passbook</span>
          </Link>
          <button 
            onClick={() => {
              setSuccessData(null);
              setFormData({ ...formData, amount: '', referenceNumber: '', remarks: '' });
            }}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Record Another Deposit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/savings/dashboard"
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wallet className="w-7 h-7 text-teal-600" />
            <span>Record Savings Deposit</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Credit cash, bank transfer, or weekly SHG thrift collections to member folio
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Account Selection & Location Scope */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Member Account & Location Scope
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Society (Super Admin) */}
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Society *</span>
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>{org.name} ({org.code})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                <span>Branch *</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={isBranchScoped}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 disabled:opacity-80"
              >
                {!isBranchScoped && <option value="All">All Branches</option>}
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Filter by Group</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="All">All Groups</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Savings Account Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-teal-600" />
              <span>Target Savings Passbook * ({filteredAccounts.length} available)</span>
            </label>
            <select
              name="savingsAccountId"
              value={formData.savingsAccountId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="">-- Choose Savings Account --</option>
              {filteredAccounts.map(acc => (
                <option key={acc._id} value={acc._id}>
                  {acc.accountNumber} — {acc.memberId?.fullName} ({acc.memberId?.memberId}) [Balance: ₹{acc.currentBalance?.toLocaleString('en-IN')}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Deposit Voucher Terms */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wallet className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Deposit Voucher & Payment Method
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Deposit Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="e.g. 1000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Payment Channel *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Bank Transfer">NEFT / IMPS Bank Transfer</option>
                <option value="Cheque">Cheque Deposit</option>
                <option value="Thrift Collection">Weekly Group Thrift</option>
              </select>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Reference / Receipt / UTR No.
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g. UTR-98273921"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Narration / Deposit Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Weekly SHG savings contribution for Week #34"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/savings/dashboard"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Credit Deposit to Account</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default RecordDepositPage;
