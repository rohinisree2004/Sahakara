import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  Building2, 
  GitBranch, 
  Eye, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Briefcase,
  User
} from 'lucide-react';
import { 
  fetchMembersList, 
  fetchMemberDashboard, 
  fetchOrganizations, 
  fetchBranchesList 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchMembersPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const [searchParams, setSearchParams] = useSearchParams();

  // Scope Filters
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(searchParams.get('organizationId') || 'All');
  const [selectedBranchId, setSelectedBranchId] = useState(
    isBranchScoped ? userBranchId : (searchParams.get('branchId') || 'All')
  );

  // Members & Stats State
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    regular: 0,
    associate: 0,
    nominal: 0,
    active: 0,
    kycVerified: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Member for Detail Modal
  const [viewingMember, setViewingMember] = useState(null);

  // Load Organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
          }
        } catch (err) {
          console.warn('Error loading organizations:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  // Load Branches based on selected organization
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const params = {};
        if (selectedOrgId && selectedOrgId !== 'All') {
          params.organizationId = selectedOrgId;
        }
        const res = await fetchBranchesList(params);
        if (res.data && res.data.success) {
          setBranches(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading branches:', err.message);
      }
    };
    loadBranches();
  }, [selectedOrgId]);

  // Load Members List and Calculate Real Statistics
  const loadMembersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      if (selectedBranchId && selectedBranchId !== 'All') {
        params.branchId = selectedBranchId;
      }
      if (categoryFilter && categoryFilter !== 'All') {
        params.category = categoryFilter;
      }
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const res = await fetchMembersList(params);
      if (res.data && res.data.success) {
        const data = res.data.data || [];
        setMembers(data);

        // Compute live metrics from data
        const total = data.length;
        const regular = data.filter(m => (m.category || '').includes('Regular')).length;
        const associate = data.filter(m => (m.category || '').includes('Associate')).length;
        const nominal = data.filter(m => (m.category || '').includes('Nominal')).length;
        const active = data.filter(m => m.membershipStatus === 'Active').length;
        const kyc = data.filter(m => m.kycDocuments?.kycVerified === true).length;

        setStats({ total, regular, associate, nominal, active, kycVerified: kyc });
      }
    } catch (err) {
      console.warn('Error loading members:', err.message);
      setError(err.message || 'Unable to load branch members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembersData();
    const query = {};
    if (selectedOrgId !== 'All') query.organizationId = selectedOrgId;
    if (selectedBranchId !== 'All') query.branchId = selectedBranchId;
    setSearchParams(query);
  }, [selectedOrgId, selectedBranchId, categoryFilter, statusFilter]);

  const handleOrgChange = (orgId) => {
    setSelectedOrgId(orgId);
    setSelectedBranchId('All'); // Reset branch when org changes
  };

  // Client-side search filtering
  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (m.fullName || '').toLowerCase().includes(term) ||
      (m.memberId || '').toLowerCase().includes(term) ||
      (m.phone || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.branchId?.branchName || '').toLowerCase().includes(term) ||
      (m.branchId?.branchCode || '').toLowerCase().includes(term);
    return matchesSearch;
  });

  const selectedOrgDetails = organizations.find(o => o._id === selectedOrgId);
  const selectedBranchDetails = branches.find(b => b._id === selectedBranchId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Master Scope Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Branch Member Accounts & Registry</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedBranchDetails ? (
                <>
                  {selectedBranchDetails.branchName}{' '}
                  <span className="text-teal-800 font-mono text-xl">({selectedBranchDetails.branchCode})</span>
                </>
              ) : selectedOrgDetails ? (
                <>
                  {selectedOrgDetails.name}{' '}
                  <span className="text-teal-800 font-mono text-xl">({selectedOrgDetails.code || 'ORG'})</span>
                </>
              ) : (
                'All Cooperative Members Directory'
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              {selectedBranchDetails ? (
                <span>
                  Member account registry scoped to <strong className="text-slate-800">{selectedBranchDetails.branchName}</strong> • {selectedBranchDetails.district || 'Branch Location'}
                </span>
              ) : selectedOrgDetails ? (
                <span>
                  Cooperative member accounts registered across all branches of <strong className="text-slate-800">{selectedOrgDetails.name}</strong>
                </span>
              ) : (
                <span>Multi-Tenant Member Accounts: Select an organization and branch location to filter accounts</span>
              )}
            </p>
          </div>

          {/* Scope Selectors & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-2 shadow-xs">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Society:</span>
                <select
                  value={selectedOrgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="All">All Societies</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Branch Selector */}
            {!isBranchScoped && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-2 shadow-xs">
                <GitBranch className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="All">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/members/register"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Register New Member</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats.total} <span className="text-xs font-normal text-slate-400">Accounts</span>
          </div>
          <div className="text-[11px] text-teal-800 font-bold">
            {stats.active} Active Cooperative Members
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Regular Members</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.regular}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Primary Voting & Savings Holders
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Associate / Nominal</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.associate + stats.nominal}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            {stats.associate} Associate • {stats.nominal} Nominal
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>KYC Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.kycVerified}</div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {stats.total > 0 ? `${Math.round((stats.kycVerified / stats.total) * 100)}% Compliance Verified` : 'No records'}
          </div>
        </div>

      </div>

      {/* Members Table Section */}
      <div className="space-y-4">
        
        {/* Table Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Registered Branch Members</span>
            </h2>
            <p className="text-xs text-slate-500">
              Search by member name, unique member code, phone, or filter by category and approval status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member name, ID, phone..."
                className="pl-9 pr-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 shadow-xs w-48 sm:w-64 font-semibold"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Regular Member">Regular Member</option>
                <option value="Associate Member">Associate Member</option>
                <option value="Nominal Member">Nominal Member</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={loadMembersData}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs"
              title="Refresh Members"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mx-auto font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                No Member Accounts Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No cooperative members matched the selected branch, category, or search filters.
              </p>
            </div>
            <Link
              to="/members/register"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Member</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Member Name & ID</th>
                    <th className="px-6 py-3.5">Branch & Society</th>
                    <th className="px-6 py-3.5">Enrolled Groups</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Contact & Location</th>
                    <th className="px-6 py-3.5">Status & KYC</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-black text-sm">
                            {m.fullName ? m.fullName[0] : 'M'}
                          </div>
                          <div>
                            <div className="text-slate-900 text-sm font-black flex items-center gap-2">
                              <span>{m.fullName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold">
                                {m.memberId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {m.userId?.username ? `@${m.userId.username}` : (m.email || 'Email N/A')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {m.branchId?.branchName || 'Main Branch'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {m.organizationId?.name ? `${m.organizationId.name} (${m.organizationId.code || 'ORG'})` : 'Main Society'}
                        </div>
                      </td>

                      {/* Enrolled Groups (1 to 4 groups) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {m.groupIds && m.groupIds.length > 0 ? (
                            m.groupIds.map((g, idx) => (
                              <span
                                key={g._id || idx}
                                className="px-2 py-0.5 rounded-lg bg-teal-50/90 border border-teal-200 text-teal-900 text-[10px] font-bold inline-flex items-center gap-1"
                                title={g.groupName}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                <span className="truncate max-w-[120px]">{g.groupName || g.groupCode || 'Group'}</span>
                              </span>
                            ))
                          ) : m.groupId ? (
                            <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-bold">
                              {m.groupId.groupName || 'Primary Group'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Unassigned</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.category === 'Regular Member'
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : m.category === 'Associate Member'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          {m.category || 'Regular Member'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{m.phone || 'Phone N/A'}</div>
                        <div className="text-[11px] text-slate-400">{m.district || 'Location N/A'}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.membershipStatus === 'Active'
                              ? 'bg-teal-50 border-teal-200 text-teal-800'
                              : m.membershipStatus === 'Pending'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {m.membershipStatus || 'Active'}
                          </span>

                          {m.kycDocuments?.kycVerified && (
                            <span className="p-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200" title="KYC Verified">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingMember(m)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Quick View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                            <span>View</span>
                          </button>

                          <Link
                            to={`/members/profile/${m._id}`}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-700 border border-slate-200 shadow-xs transition-colors"
                            title="Open Full Member Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MEMBER DETAIL MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-base shadow-xs">
                  {viewingMember.fullName ? viewingMember.fullName[0] : 'M'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{viewingMember.fullName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold">
                      {viewingMember.memberId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingMember.branchId?.branchName || 'Main Branch'} • {viewingMember.organizationId?.name || 'Cooperative Society'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setViewingMember(null)} 
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Membership Category</span>
                <p className="font-bold text-slate-900 text-sm">{viewingMember.category || 'Regular Member'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Account Status</span>
                <p className="font-bold text-teal-800 text-sm">{viewingMember.membershipStatus || 'Active'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</span>
                <p className="font-bold text-slate-900">{viewingMember.phone || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Email Address</span>
                <p className="font-bold text-slate-900">{viewingMember.email || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Occupation</span>
                <p className="font-bold text-slate-900">{viewingMember.occupation || 'Self-Employed'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Joining Date</span>
                <p className="font-bold text-slate-900">
                  {viewingMember.joiningDate ? new Date(viewingMember.joiningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Residential Address</span>
                <p className="font-semibold text-slate-900">
                  {viewingMember.address || 'Address not configured'}, {viewingMember.district || ''}, {viewingMember.state || 'Kerala'} {viewingMember.pincode || ''}
                </p>
              </div>

              {/* Enrolled Groups (1 to 4 Groups) */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Enrolled Member Groups ({viewingMember.groupIds?.length || (viewingMember.groupId ? 1 : 0)} of max 4)</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {viewingMember.groupIds && viewingMember.groupIds.length > 0 ? (
                    viewingMember.groupIds.map((grp, idx) => (
                      <div key={grp._id || idx} className="p-2.5 rounded-xl bg-white border border-teal-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{grp.groupName}</div>
                          <div className="text-[10px] text-teal-700 font-mono">{grp.groupCode} • {grp.groupType || 'SHG'}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold">Enrolled</span>
                      </div>
                    ))
                  ) : viewingMember.groupId ? (
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{viewingMember.groupId.groupName}</div>
                        <div className="text-[10px] text-teal-700 font-mono">{viewingMember.groupId.groupCode}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold">Primary</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium col-span-2">No group affiliations assigned</div>
                  )}
                </div>
              </div>

              {viewingMember.nominee?.name && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Nominee Configuration</span>
                  <p className="font-bold text-slate-900">
                    {viewingMember.nominee.name} ({viewingMember.nominee.relationship || 'Nominee'}) • Share: {viewingMember.nominee.sharePercentage || 100}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button 
                onClick={() => setViewingMember(null)} 
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>

              <Link
                to={`/members/profile/${viewingMember._id}`}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20"
              >
                <span>Open Full Member Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BranchMembersPage;
