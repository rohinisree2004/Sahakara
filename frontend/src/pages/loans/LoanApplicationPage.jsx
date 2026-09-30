import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  fetchLoanTypes, 
  fetchMembersList, 
  checkLoanEligibilityApi, 
  applyForLoanApi,
  fetchOrganizations,
  fetchBranchesList,
  fetchGroupsList
} from '../../services/api';
import { 
  Banknote, 
  User, 
  Calendar, 
  Save, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  Building2,
  GitBranch,
  Users,
  ShieldCheck,
  Percent,
  Coins,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const { user, activeGroup } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isMember = user?.role === 'Member';
  
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const isGroupScopedRole = ['President', 'Secretary', 'Treasurer'].includes(user?.role);

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState(isSuperAdmin ? 'All' : (user?.organizationId?._id || user?.organizationId || ''));
  const [selectedBranchId, setSelectedBranchId] = useState(isBranchScoped ? userBranchId : (user?.branchId || 'All'));
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    memberId: isMember ? user?._id : '',
    loanTypeId: '',
    requestedAmount: '',
    tenure: '',
    purpose: '',
    remarks: '',
    branchId: isBranchScoped ? userBranchId : ''
  });

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const promises = [fetchLoanTypes({ status: 'Active' })];
        if (isSuperAdmin) promises.push(fetchOrganizations());
        if (!isMember) {
          const branchParams = isBranchScoped && userBranchId ? { branchId: userBranchId } : {};
          promises.push(fetchBranchesList(branchParams));
        }

        const results = await Promise.all(promises);
        const ltRes = results[0];
        if (ltRes.data?.success) setLoanTypes(ltRes.data.data || []);

        if (isSuperAdmin && results[1]?.data?.success) {
          const orgList = results[1].data.data || [];
          setOrganizations(orgList);
          if (orgList.length > 0) setSelectedOrgId(orgList[0]._id);
        }

        if (isMember) {
          try {
            const memRes = await fetchMembersList({ limit: 5 });
            if (memRes.data?.success && memRes.data.data?.length > 0) {
              const myMem = memRes.data.data[0];
              setFormData(prev => ({
                ...prev,
                memberId: myMem._id,
                branchId: myMem.branchId?._id || myMem.branchId || prev.branchId
              }));
            }
          } catch (mErr) {}
        }
      } catch (err) {
        console.warn('Init error in loan application:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [isSuperAdmin, isMember, isBranchScoped, userBranchId]);

  // Load branches, groups, and members when Organization changes
  useEffect(() => {
    if (isMember) return;
    const loadScopeData = async () => {
      try {
        const orgParam = selectedOrgId && selectedOrgId !== 'All' ? { organizationId: selectedOrgId } : {};
        if (isBranchScoped && userBranchId) {
          orgParam.branchId = userBranchId;
        }

        const [bRes, gRes, mRes] = await Promise.all([
          fetchBranchesList(orgParam),
          fetchGroupsList(orgParam),
          fetchMembersList({ ...orgParam, limit: 200, status: 'Active' })
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
      }
    };
    loadScopeData();
  }, [selectedOrgId, isMember, isBranchScoped, userBranchId]);

  // Filter members by Branch and Group
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setEligibility(null);
    setErrorMsg('');
  };

  const selectedLoanType = loanTypes.find(lt => lt._id === formData.loanTypeId);

  const handleCheckEligibility = async () => {
    if (!formData.memberId || !formData.loanTypeId || !formData.requestedAmount) {
      setErrorMsg('Please select Member, Loan Scheme, and enter Requested Amount first.');
      return;
    }
    
    setCheckingEligibility(true);
    setErrorMsg('');
    try {
      const response = await checkLoanEligibilityApi({
        memberId: formData.memberId,
        loanTypeId: formData.loanTypeId,
        requestedAmount: formData.requestedAmount
      });
      if (response.data?.success) {
        setEligibility(response.data.data);
      }
    } catch (err) {
      setEligibility({ 
        isEligible: false, 
        reason: err.response?.data?.message || err.message || 'Eligibility algorithm returned rejection.' 
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (eligibility && !eligibility.isEligible) {
      setErrorMsg('Cannot submit: Member is not eligible under current policy constraints.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        branchId: formData.branchId || selectedBranchId,
        groupId: isMember 
          ? (activeGroup?._id || user?.groupId) 
          : (selectedGroupId && selectedGroupId !== 'All' ? selectedGroupId : activeGroup?._id)
      };
      const response = await applyForLoanApi(payload);
      if (response.data && response.data.success) {
        navigate(isMember ? '/my-loans' : '/loans/applications');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit loan application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link 
            to={isMember ? "/my-loans" : "/loans/dashboard"} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMember ? 'Back to My Loans' : 'Back to Loan Dashboard'}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Banknote className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                New Loan Application
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Verify member eligibility, calculate risk terms, and submit credit sanction request
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SHG Group Scoping Banner if applying under an SHG unit */}
      {activeGroup && (
        <div className="p-4 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 text-xs text-teal-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">Applying Under SHG Unit</span>
              <span className="font-bold text-slate-900 text-sm">{activeGroup.groupName}</span>
              <span className="text-slate-500 font-mono ml-2">({activeGroup.groupCode || 'SHG'})</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-100/80 border border-teal-300 text-teal-800 font-mono font-bold text-[11px]">
            Linked Passbook: Dedicated {activeGroup.groupName} Folio
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Member & Scope Selection (Staff only) */}
        {!isMember && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Select Applicant Member & Branch
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

              {/* SHG / JLG Group Filter */}
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
                <span>Borrower Member Account * ({filteredMembers.length} available)</span>
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
                    {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''} {m.category ? `• [${m.category}]` : ''}
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}

        {/* Section 2: Loan Product & Financial Terms */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Coins className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Loan Scheme & Financial Terms
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Loan Product */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Credit Product / Scheme *
              </label>
              <select
                name="loanTypeId"
                value={formData.loanTypeId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="">-- Select Loan Product --</option>
                {loanTypes.map(lt => (
                  <option key={lt._id} value={lt._id}>
                    {lt.name} — {lt.interestRate}% p.a. (Max: ₹{lt.maximumAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              {selectedLoanType && (
                <p className="text-[11px] text-teal-800 font-medium mt-1">
                  Range: ₹{selectedLoanType.minimumAmount?.toLocaleString('en-IN')} - ₹{selectedLoanType.maximumAmount?.toLocaleString('en-IN')} • Max Tenure: {selectedLoanType.maximumTenure} Mo
                </p>
              )}
            </div>

            {/* Requested Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Requested Principal Amount (₹) *
              </label>
              <input
                type="number"
                name="requestedAmount"
                value={formData.requestedAmount}
                onChange={handleChange}
                required
                placeholder="e.g. 50000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tenure in Months *
              </label>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                required
                placeholder="e.g. 12"
                max={selectedLoanType?.maximumTenure || 60}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Purpose of Credit *
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                placeholder="e.g. Agricultural Inputs / Dairy Livestock"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Additional Remarks / Notes
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              placeholder="Enter any guarantor details, meeting resolutions or special sanction terms..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Real-time Eligibility Verification Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCheckEligibility}
              disabled={checkingEligibility || !formData.memberId || !formData.loanTypeId || !formData.requestedAmount}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40"
            >
              {checkingEligibility ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <Sparkles className="w-4 h-4 text-teal-400" />}
              <span>Verify Credit Eligibility Algorithm</span>
            </button>
          </div>

          {/* Eligibility Result Display */}
          {eligibility && (
            <div className={`p-5 rounded-2xl border text-xs space-y-3 ${
              eligibility.isEligible 
                ? 'bg-teal-50 border-teal-200 text-teal-950' 
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {eligibility.isEligible ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    <span>Member is Eligible for Loan Sanction</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Eligibility Check Failed</span>
                  </>
                )}
              </div>

              {eligibility.details && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-teal-200/50">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Savings Thrift</div>
                    <div className="font-mono font-bold text-slate-900">₹ {eligibility.details.totalSavings?.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Active Outstanding</div>
                    <div className="font-mono font-bold text-slate-900">₹ {eligibility.details.totalOutstanding?.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Credit Score</div>
                    <div className="font-mono font-bold text-teal-800">{eligibility.details.creditScore} ({eligibility.details.eligibilityGrade})</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">KYC Status</div>
                    <div className="font-bold text-emerald-800">{eligibility.details.kycStatus}</div>
                  </div>
                </div>
              )}

              {eligibility.reason && (
                <p className="text-xs font-semibold text-rose-700">{eligibility.reason}</p>
              )}
            </div>
          )}

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/loans/applications"
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
            <span>Submit Loan Application</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default LoanApplicationPage;
