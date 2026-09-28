import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  fetchMembersList, 
  createSavingsAccountApi,
  fetchOrganizations,
  fetchBranchesList,
  fetchGroupsList
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Wallet, 
  Percent, 
  FileText, 
  Building2, 
  GitBranch, 
  Users, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const CreateSavingsAccountPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const isGroupScopedRole = ['President', 'Secretary', 'Treasurer'].includes(user?.role);

  const [selectedOrgId, setSelectedOrgId] = useState(isSuperAdmin ? 'All' : (user?.organizationId?._id || user?.organizationId || ''));
  const [selectedBranchId, setSelectedBranchId] = useState(isBranchScoped ? userBranchId : (user?.branchId || 'All'));
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    memberId: '',
    accountType: 'Regular Savings',
    openingBalance: '',
    minimumBalance: '100',
    interestRate: '4.5',
    remarks: '',
    branchId: isBranchScoped ? userBranchId : ''
  });

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations();
          if (res.data?.success) {
            setOrganizations(res.data.data || []);
          }
        } catch (err) {
          console.warn('Orgs load error:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  // Load branches, groups, members when Society changes
  useEffect(() => {
    const loadScopeData = async () => {
      setIsLoading(true);
      try {
        const orgParam = selectedOrgId && selectedOrgId !== 'All' ? { organizationId: selectedOrgId } : {};
        if (isBranchScoped && userBranchId) {
          orgParam.branchId = userBranchId;
        }

        const [bRes, gRes, mRes] = await Promise.all([
          fetchBranchesList(orgParam),
          fetchGroupsList(orgParam),
          fetchMembersList({ ...orgParam, status: 'Active', limit: 200 })
        ]);

        if (bRes.data?.success) {
          const bList = bRes.data.data || [];
          setBranches(bList);
          if (isBranchScoped && userBranchId) {
            setSelectedBranchId(userBranchId);
            setFormData(f => ({ ...f, branchId: userBranchId }));
          } else if (bList.length > 0) {
            setSelectedBranchId(bList[0]._id);
            setFormData(f => ({ ...f, branchId: bList[0]._id }));
          }
        }
        if (gRes.data?.success) {
          const gList = gRes.data.data || [];
          setGroups(gList);
          if (isGroupScopedRole && gList.length > 0) {
            setSelectedGroupId(gList[0]._id);
          }
        }
        if (mRes.data?.success) setMembers(mRes.data.data || []);
      } catch (err) {
        console.warn('Scope data error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadScopeData();
  }, [selectedOrgId, isBranchScoped, userBranchId]);

  // Filter members by branch and group
  const filteredMembers = members.filter((m) => {
    if (selectedBranchId && selectedBranchId !== 'All') {
      const bId = (m.branchId?._id || m.branchId)?.toString();
      if (bId !== selectedBranchId.toString()) return false;
    }
    if (selectedGroupId && selectedGroupId !== 'All') {
      const gDoc = groups.find(g => g._id === selectedGroupId);
      if (gDoc) {
        const memIds = (gDoc.memberIds || []).map(id => (id?._id || id)?.toString());
        return memIds.includes(m._id.toString());
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
    if (!formData.memberId) {
      setError('Please select an active member.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await createSavingsAccountApi({
        ...formData,
        branchId: formData.branchId || selectedBranchId,
        openingBalance: Number(formData.openingBalance || 0),
        minimumBalance: Number(formData.minimumBalance || 0),
        interestRate: Number(formData.interestRate || 0)
      });

      if (response.data && response.data.success) {
        navigate('/savings/accounts');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create savings account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/savings/accounts"
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wallet className="w-7 h-7 text-teal-600" />
            <span>Open Member Savings Account</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Issue a digital savings folio, establish thrift balance, and register passbook
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
        
        {/* Section 1: Member Selection & Scope */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-teal-600" />
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
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setFormData(f => ({ ...f, branchId: e.target.value }));
                }}
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
                disabled={isGroupScopedRole}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 disabled:opacity-80"
              >
                {!isGroupScopedRole && <option value="All">All Groups</option>}
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Member Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Target Member Holder * ({filteredMembers.length} available)</span>
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="">-- Choose Member --</option>
              {filteredMembers.map(m => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Account Terms */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wallet className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Savings Scheme & Initial Deposit
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Account Scheme Type *
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="Regular Savings">Regular Savings</option>
                <option value="Recurring Deposit">Recurring Deposit (RD)</option>
                <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                <option value="Pigmy Account">Pigmy Daily Collection</option>
                <option value="Compulsory Thrift">Compulsory Group Thrift</option>
              </select>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Initial Opening Deposit (₹)
              </label>
              <input
                type="number"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            {/* Minimum Balance */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Minimum Balance Requirement (₹)
              </label>
              <input
                type="number"
                name="minimumBalance"
                value={formData.minimumBalance}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                placeholder="e.g. 4.5"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Account Remarks / Passbook Endorsement
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              placeholder="Enter special instructions or resolution number..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/savings/accounts"
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
            <span>Open Savings Account</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateSavingsAccountPage;
