import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Loader2, 
  Building2, 
  GitBranch, 
  Eye, 
  PlusCircle, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  UserPlus,
  Edit,
  ArrowRightLeft,
  KeyRound,
  Power,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { 
  fetchOrgEmployees, 
  fetchOrganizations, 
  fetchBranchesList, 
  fetchBranchEmployees,
  updateUserApi,
  transferUserBranchApi,
  resetUserPasswordApi,
  toggleUserStatusApi,
  createUserApi
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchEmployeesPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isOrgAdmin = user?.role === 'Organization Admin';
  const isBranchManager = user?.role === 'Branch Manager';
  const [searchParams, setSearchParams] = useSearchParams();

  // Scope Filters
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(searchParams.get('organizationId') || 'All');
  const [selectedBranchId, setSelectedBranchId] = useState(
    isBranchManager ? (user?.branchId || searchParams.get('branchId') || 'All') : (searchParams.get('branchId') || 'All')
  );
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Add Form State
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'Employee',
    organizationId: '',
    branchId: '',
    gender: 'Male'
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'Employee',
    branchId: '',
    gender: 'Male'
  });

  // Transfer Form State
  const [transferBranchId, setTransferBranchId] = useState('');

  // Password Form State
  const [newPassword, setNewPassword] = useState('');

  // Load Organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
            if (!addForm.organizationId && res.data.data.length > 0) {
              setAddForm(prev => ({ ...prev, organizationId: res.data.data[0]._id }));
            }
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

  // Load Staff
  const loadStaffData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      if (selectedBranchId && selectedBranchId !== 'All') {
        params.branchId = selectedBranchId;
      }
      if (roleFilter && roleFilter !== 'All') {
        params.role = roleFilter;
      }

      const res = await fetchOrgEmployees(params);
      if (res.data && res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.warn('Error loading staff:', err.message);
      setErrorMsg(err.message || 'Unable to load branch employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
    const query = {};
    if (selectedOrgId !== 'All') query.organizationId = selectedOrgId;
    if (selectedBranchId !== 'All') query.branchId = selectedBranchId;
    setSearchParams(query);
  }, [selectedOrgId, selectedBranchId, roleFilter]);

  const handleOrgChange = (orgId) => {
    setSelectedOrgId(orgId);
    setSelectedBranchId('All');
    if (orgId !== 'All') {
      setAddForm(prev => ({ ...prev, organizationId: orgId }));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name || '',
      phone: emp.phone || '',
      role: emp.role || 'Employee',
      branchId: emp.branchId?._id || emp.branchId || '',
      gender: emp.gender || 'Male'
    });
    setShowEditModal(true);
  };

  // Open Transfer Modal
  const handleOpenTransfer = (emp) => {
    setSelectedEmployee(emp);
    setTransferBranchId(emp.branchId?._id || emp.branchId || '');
    setShowTransferModal(true);
  };

  // Open Password Modal
  const handleOpenPassword = (emp) => {
    setSelectedEmployee(emp);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  // Submit Add Personnel
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    setMsg('');

    try {
      const payload = {
        ...addForm,
        organizationId: addForm.organizationId || (selectedOrgId !== 'All' ? selectedOrgId : undefined),
        branchId: addForm.branchId || (selectedBranchId !== 'All' ? selectedBranchId : undefined),
      };

      const res = await createUserApi(payload);
      if (res.data && res.data.success) {
        setMsg(`Personnel '${addForm.name}' onboarded successfully!`);
        setShowAddModal(false);
        setAddForm({
          name: '',
          username: '',
          email: '',
          phone: '',
          password: 'password123',
          role: 'Employee',
          organizationId: selectedOrgId !== 'All' ? selectedOrgId : '',
          branchId: '',
          gender: 'Male'
        });
        loadStaffData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to onboard personnel.');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Edit Personnel
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setModalLoading(true);
    setErrorMsg('');

    try {
      const res = await updateUserApi(selectedEmployee._id, editForm);
      if (res.data && res.data.success) {
        setMsg(`Personnel details for '${editForm.name}' updated.`);
        setShowEditModal(false);
        loadStaffData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update personnel details.');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Branch Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !transferBranchId) return;
    setModalLoading(true);
    setErrorMsg('');

    try {
      const res = await transferUserBranchApi(selectedEmployee._id, { branchId: transferBranchId });
      if (res.data && res.data.success) {
        setMsg(`Branch assignment for '${selectedEmployee.name}' updated.`);
        setShowTransferModal(false);
        loadStaffData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to transfer branch assignment.');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Password Reset
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !newPassword) return;
    setModalLoading(true);
    setErrorMsg('');

    try {
      const res = await resetUserPasswordApi(selectedEmployee._id, { newPassword });
      if (res.data && res.data.success) {
        setMsg(`Password reset successfully for '${selectedEmployee.name}'.`);
        setShowPasswordModal(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (emp) => {
    try {
      const res = await toggleUserStatusApi(emp._id);
      if (res.data && res.data.success) {
        setMsg(`Status updated for '${emp.name}'.`);
        loadStaffData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle status.');
    }
  };

  // Filter Employees in view
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (emp.name || '').toLowerCase().includes(term) ||
      (emp.username || '').toLowerCase().includes(term) ||
      (emp.email || '').toLowerCase().includes(term) ||
      (emp.phone || '').toLowerCase().includes(term) ||
      (emp.role || '').toLowerCase().includes(term) ||
      (emp.branchId?.branchName || '').toLowerCase().includes(term) ||
      (emp.organizationId?.name || '').toLowerCase().includes(term);

    const matchesStatus = 
      statusFilter === 'All' ? true : 
      statusFilter === 'Active' ? emp.isActive !== false : 
      emp.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const selectedOrgDetails = organizations.find(o => o._id === selectedOrgId);
  const selectedBranchDetails = branches.find(b => b._id === selectedBranchId);

  // Statistics
  const totalStaffCount = employees.length;
  const branchManagersCount = employees.filter(e => e.role === 'Branch Manager').length;
  const employeesCount = employees.filter(e => e.role === 'Employee' || !['Branch Manager', 'Organization Admin'].includes(e.role)).length;
  const activeLocationsCount = new Set(employees.map(e => e.branchId?._id || e.branchId).filter(Boolean)).size;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Master Scope Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Branch Personnel & Operations Team</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedBranchDetails ? (
                <>
                  {selectedBranchDetails.branchName}{' '}
                  <span className="text-teal-800 font-mono text-xl">({selectedBranchDetails.branchCode}) Personnel</span>
                </>
              ) : selectedOrgDetails ? (
                <>
                  {selectedOrgDetails.name}{' '}
                  <span className="text-teal-800 font-mono text-xl">({selectedOrgDetails.code || 'ORG'}) Staff</span>
                </>
              ) : (
                'All Cooperative Personnel & Tellers'
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              {selectedBranchDetails ? (
                <span>
                  Authorized branch managers, counter tellers, and loan officers stationed at <strong className="text-slate-800">{selectedBranchDetails.branchName}</strong>
                </span>
              ) : selectedOrgDetails ? (
                <span>
                  All operating employees, tellers, and administrative executives registered under <strong className="text-slate-800">{selectedOrgDetails.name}</strong>
                </span>
              ) : (
                <span>Platform Staff Registry: Inspect and manage operational personnel across all cooperative branches</span>
              )}
            </p>
          </div>

          {/* Scope Controls */}
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

            {(isSuperAdmin || isOrgAdmin) && (
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

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Personnel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-teal-600 hover:text-teal-900 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Staff Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Branch Personnel</div>
          <div className="text-3xl font-black text-slate-900">{totalStaffCount}</div>
          <div className="text-[11px] text-teal-800 font-bold">Active Staff Records</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Managers</div>
          <div className="text-3xl font-black text-teal-800">{branchManagersCount}</div>
          <div className="text-[11px] text-slate-500">Designated Branch In-Charges</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tellers & Field Staff</div>
          <div className="text-3xl font-black text-slate-900">{employeesCount}</div>
          <div className="text-[11px] text-slate-500">Branch Operations & Field Execution</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Branch Locations</div>
          <div className="text-3xl font-black text-slate-900">{activeLocationsCount}</div>
          <div className="text-[11px] text-teal-800 font-bold">Branches with Assigned Staff</div>
        </div>
      </div>

      {/* Search & Staff Directory */}
      <div className="space-y-4">
        
        {/* Controls Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff name, username, email, role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Staff Roles</option>
                <option value="Branch Manager">Branch Manager (In-Charge)</option>
                <option value="Employee">Employee (Teller / Field / Clerk)</option>
                <option value="Organization Admin">Organization Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Staff</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>

            <button
              onClick={loadStaffData}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs transition-colors"
              title="Refresh staff directory"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mx-auto font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Personnel Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active personnel or branch officers matched the selected filters.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard First Employee</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Employee Name & Profile</th>
                    <th className="px-6 py-3.5">Society & Branch Placement</th>
                    <th className="px-6 py-3.5">Role Designation</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions & Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-teal-50/30 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-mono font-black text-sm">
                            {emp.name ? emp.name[0] : 'U'}
                          </div>
                          <div>
                            <div className="text-slate-900 font-black text-sm">{emp.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono font-normal">@{emp.username}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{emp.email || emp.phone || 'Contact N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Society & Branch Placement */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">
                            {emp.branchId ? (
                              <span className="inline-flex items-center gap-1.5 text-teal-900 font-bold">
                                <GitBranch className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>{emp.branchId.branchName || 'Assigned Branch'}</span>
                                {emp.branchId.branchCode && (
                                  <span className="font-mono text-[10px] text-teal-700">({emp.branchId.branchCode})</span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Head Office / Central Society</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {emp.organizationId?.name || 'Cooperative Society'}
                          </div>
                        </div>
                      </td>

                      {/* Role Designation */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          emp.role === 'Branch Manager'
                            ? 'bg-teal-50 border-teal-300 text-teal-800'
                            : emp.role === 'Organization Admin'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : ['President', 'Secretary', 'Treasurer'].includes(emp.role)
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          {emp.role || 'Employee'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          emp.isActive !== false
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {emp.isActive !== false ? 'Active Staff' : 'Inactive'}
                        </span>
                      </td>

                      {/* Management Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Edit Personnel Details"
                          >
                            <Edit className="w-3.5 h-3.5 text-teal-600" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>

                          {/* Reassign / Transfer Branch */}
                          <button
                            onClick={() => handleOpenTransfer(emp)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Transfer / Assign Branch"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden xl:inline">Transfer</span>
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenPassword(emp)}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
                            title="Reset Staff Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className={`p-1.5 rounded-xl border shadow-xs transition-colors ${
                              emp.isActive !== false
                                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                                : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700'
                            }`}
                            title={emp.isActive !== false ? 'Deactivate Personnel' : 'Reactivate Personnel'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
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

      {/* ========================================================================= */}
      {/* 1. ONBOARD NEW PERSONNEL MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-black text-slate-900">Onboard New Personnel</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="e.g. ramesh_teller"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="ramesh@coop.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 98470 11223"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Staff Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Employee">Branch Employee (Teller / Clerk / Field)</option>
                    <option value="Branch Manager">Branch Manager (In-Charge)</option>
                    <option value="Organization Admin">Organization Admin</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Group executives (President, Secretary, Treasurer) are elected within Groups.</p>
                </div>
              </div>

              {/* Organization & Branch selection */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cooperative Society *</label>
                  <select
                    value={addForm.organizationId}
                    onChange={(e) => setAddForm({ ...addForm, organizationId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name} ({org.code || 'ORG'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Branch (Optional)</label>
                <select
                  value={addForm.branchId}
                  onChange={(e) => setAddForm({ ...addForm, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">Head Office / Unassigned</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>{modalLoading ? 'Onboarding...' : 'Onboard Personnel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT PERSONNEL MODAL */}
      {/* ========================================================================= */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-black text-slate-900">Edit Personnel Profile</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Staff Role *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="Employee">Branch Employee (Teller / Clerk / Field)</option>
                  <option value="Branch Manager">Branch Manager (In-Charge)</option>
                  <option value="Organization Admin">Organization Admin</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Group executives (President, Secretary, Treasurer) are elected within Groups.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Operational Branch</label>
                <select
                  value={editForm.branchId}
                  onChange={(e) => setEditForm({ ...editForm, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">Head Office / Unassigned</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                  <span>{modalLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRANSFER BRANCH MODAL */}
      {/* ========================================================================= */}
      {showTransferModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">Branch Transfer & Placement</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Reassign staff member <strong className="text-slate-900">{selectedEmployee.name}</strong> to a different cooperative branch.
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Branch *</label>
                <select
                  value={transferBranchId}
                  onChange={(e) => setTransferBranchId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">Select Destination Branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !transferBranchId}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                  <span>{modalLoading ? 'Transferring...' : 'Execute Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {showPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">Reset Staff Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a new login password for <strong className="text-slate-900">{selectedEmployee.name}</strong> (@{selectedEmployee.username}).
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !newPassword}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>{modalLoading ? 'Updating...' : 'Set Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchEmployeesPage;
