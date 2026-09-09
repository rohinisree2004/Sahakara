import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Wallet, 
  Landmark, 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2,
  GitBranch,
  Edit3,
  PlusCircle,
  KeyRound,
  Power,
  Trash2,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  fetchOrganizationDetails, 
  updateOrganizationApi, 
  updateOrgStatus,
  createBranchApi,
  createUserApi,
  resetUserPasswordApi,
  toggleUserStatusApi,
  deleteUserApi
} from '../../services/api';

const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'branches' | 'users'
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Organization Profile Modal
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editOrgLoading, setEditOrgLoading] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({
    name: '',
    code: '',
    registrationNumber: '',
    societyType: 'Credit Cooperative',
    email: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
  });

  // Add Branch Modal
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchForm, setBranchForm] = useState({
    branchName: '',
    branchCode: '',
    district: '',
    state: '',
    phone: '',
    email: '',
    address: '',
    managerName: '',
  });

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    username: '',
    password: 'password123',
    role: 'Employee',
    branchId: '',
    phone: '',
    gender: 'Male',
  });

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchOrganizationDetails(id);
      if (res.data && res.data.success) {
        setData(res.data.data);
        const p = res.data.data.profile;
        if (p) {
          setEditOrgForm({
            name: p.name || '',
            code: p.code || '',
            registrationNumber: p.registrationNumber || '',
            societyType: p.societyType || 'Credit Cooperative',
            email: p.email || '',
            phone: p.phone || '',
            address: p.address || '',
            state: p.state || '',
            city: p.city || '',
            pincode: p.pincode || '',
          });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load organization details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Handle Edit Org Submit
  const handleEditOrgSubmit = async (e) => {
    e.preventDefault();
    setEditOrgLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await updateOrganizationApi(id, editOrgForm);
      if (res.data && res.data.success) {
        setMsg('Organization profile updated successfully.');
        setShowEditOrgModal(false);
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update organization.');
    } finally {
      setEditOrgLoading(false);
    }
  };

  // Handle Toggle Org Status
  const handleToggleStatus = async (currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Are you sure you want to change organization status to ${nextStatus}?`)) return;

    try {
      const res = await updateOrgStatus(id, nextStatus);
      if (res.data && res.data.success) {
        setMsg(`Organization status changed to ${nextStatus}.`);
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change status.');
    }
  };

  // Handle Create Branch Submit
  const handleCreateBranchSubmit = async (e) => {
    e.preventDefault();
    setBranchLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const payload = {
        ...branchForm,
        organizationId: id,
      };
      const res = await createBranchApi(payload);
      if (res.data && res.data.success) {
        setMsg(`Branch '${branchForm.branchName}' added successfully.`);
        setShowAddBranchModal(false);
        setBranchForm({
          branchName: '',
          branchCode: '',
          district: '',
          state: '',
          phone: '',
          email: '',
          address: '',
          managerName: '',
        });
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create branch.');
    } finally {
      setBranchLoading(false);
    }
  };

  // Handle Create User Submit
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const payload = {
        ...userForm,
        organizationId: id,
        branchId: userForm.branchId || undefined,
      };
      const res = await createUserApi(payload);
      if (res.data && res.data.success) {
        setMsg(`User account '${userForm.username}' created successfully.`);
        setShowAddUserModal(false);
        setUserForm({
          name: '',
          email: '',
          username: '',
          password: 'password123',
          role: 'Employee',
          branchId: '',
          phone: '',
          gender: 'Male',
        });
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user.');
    } finally {
      setUserLoading(false);
    }
  };

  // Handle Toggle User Status
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await toggleUserStatusApi(userId);
      if (res.data && res.data.success) {
        setMsg('User status toggled successfully.');
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle user status.');
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    setResetting(true);
    setErrorMsg('');
    try {
      const res = await resetUserPasswordApi(resetModalUser._id, { newPassword });
      if (res.data && res.data.success) {
        setMsg(`Password reset successfully for ${resetModalUser.username}.`);
        setResetModalUser(null);
        setNewPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user account '${u.name}' (${u.username})?`)) return;
    try {
      const res = await deleteUserApi(u._id);
      if (res.data && res.data.success) {
        setMsg(`User '${u.name}' deleted.`);
        loadDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-600 bg-white p-8 rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Organization Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{errorMsg || 'Unable to retrieve records.'}</p>
        <Link to="/super-admin/organizations" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-600/20">
          Back to Organizations Registry
        </Link>
      </div>
    );
  }

  const profile = data?.profile || {};
  const metrics = data?.metrics || {
    totalBranches: 0,
    totalMembers: 0,
    totalEmployees: 0,
    totalSavingsManaged: '₹ 0',
    totalLoansDisbursed: '₹ 0',
    auditComplianceScore: '98%',
  };
  const branches = data?.branches || [];
  const users = data?.users || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <Link to="/super-admin/organizations" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>Back to Organizations Registry</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowEditOrgModal(true);
              setErrorMsg('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => handleToggleStatus(profile.status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors shadow-xs ${
              profile.status === 'Active'
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
            }`}
          >
            {profile.status === 'Active' ? 'Suspend Organization' : 'Reactivate Organization'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  profile.status === 'Active'
                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  {profile.status}
                </span>
              </div>
              <p className="text-xs font-mono text-teal-800 font-bold mt-1">
                Code: {profile.code} • {profile.societyType} {profile.registrationNumber && `• Reg: ${profile.registrationNumber}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{profile.address ? `${profile.address}, ` : ''}{profile.city ? `${profile.city}, ` : ''}{profile.state} {profile.pincode}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{profile.phone}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Overview & Financials</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'branches'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Staff ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Operational Branches</span>
                <GitBranch className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalBranches}</div>
              <div className="text-[11px] text-slate-400 font-medium">Active branch locations</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Registered Members</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-800">{metrics.totalMembers.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 font-medium">Shareholders & members</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Society Staff & Officers</span>
                <UserCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalEmployees}</div>
              <div className="text-[11px] text-slate-400 font-medium">Admins, tellers & managers</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Audit Score</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-800">{metrics.auditComplianceScore}</div>
              <div className="text-[11px] text-slate-400 font-medium">Compliance status</div>
            </div>
          </div>

          {/* Financial Portfolios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-teal-600" />
                  <span>Savings & Deposit Portfolio</span>
                </h3>
                <span className="text-xs font-mono text-teal-800 font-bold">{metrics.totalSavingsManaged}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Includes member savings accounts, fixed deposits, recurring deposit schemes, and interest accrual ledgers managed within this tenant organization.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-teal-600" />
                  <span>Loan & EMI Portfolio</span>
                </h3>
                <span className="text-xs font-mono text-teal-800 font-bold">{metrics.totalLoansDisbursed}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Active personal, agricultural, and gold loan disbursals with automated EMI calculation schedules and repayment recovery logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-teal-600" />
              <span>Branches of {profile.name}</span>
            </h3>
            <button
              onClick={() => {
                setShowAddBranchModal(true);
                setErrorMsg('');
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Branch</span>
            </button>
          </div>

          {branches.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs">
              <GitBranch className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">No branches created for this organization yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Branch Name</th>
                    <th className="px-6 py-3.5">Branch Code</th>
                    <th className="px-6 py-3.5">District / Location</th>
                    <th className="px-6 py-3.5">Manager</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.map(b => (
                    <tr key={b._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-teal-600" />
                        <span>{b.branchName}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-teal-800 font-bold">{b.branchCode}</td>
                      <td className="px-6 py-4 text-slate-700">{b.district ? `${b.district}, ` : ''}{b.state}</td>
                      <td className="px-6 py-4 text-slate-700">{b.managerName || 'Not Assigned'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                          {b.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS & STAFF */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>User Accounts & Officers of {profile.name}</span>
            </h3>
            <button
              onClick={() => {
                setShowAddUserModal(true);
                setErrorMsg('');
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add User / Staff</span>
            </button>
          </div>

          {users.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">No user accounts found for this organization.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Name & Email</th>
                    <th className="px-6 py-3.5">Username</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Branch</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-teal-800 font-bold">{u.username}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{u.branchId?.branchName || 'All Branches'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.isActive !== false
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setResetModalUser(u);
                              setNewPassword('');
                              setErrorMsg('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(u._id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.isActive !== false
                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                            }`}
                            title="Toggle Status"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditOrgModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Organization Profile</h3>
                <p className="text-xs text-slate-500">Update cooperative society master registration records</p>
              </div>
            </div>

            <form onSubmit={handleEditOrgSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editOrgForm.name}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editOrgForm.code}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editOrgForm.email}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editOrgForm.phone}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Society Type</label>
                  <select
                    value={editOrgForm.societyType}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, societyType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Credit Cooperative">Credit Cooperative</option>
                    <option value="Agricultural Cooperative">Agricultural Cooperative</option>
                    <option value="Housing Cooperative">Housing Cooperative</option>
                    <option value="Multi-Purpose Cooperative">Multi-Purpose Cooperative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reg. Number</label>
                  <input
                    type="text"
                    value={editOrgForm.registrationNumber}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editOrgForm.address}
                  onChange={(e) => setEditOrgForm({ ...editOrgForm, address: e.target.value })}
                  placeholder="Street address..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editOrgForm.state}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editOrgForm.city}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editOrgForm.pincode}
                    onChange={(e) => setEditOrgForm({ ...editOrgForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditOrgModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editOrgLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {editOrgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddBranchModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <GitBranch className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Add Operational Branch</h3>
                <p className="text-xs text-slate-500">Add branch under {profile.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreateBranchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchForm.branchName}
                    onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                    placeholder="e.g. Indiranagar Branch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branch Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchForm.branchCode}
                    onChange={(e) => setBranchForm({ ...branchForm, branchCode: e.target.value })}
                    placeholder="e.g. BR-IND-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / Area</label>
                  <input
                    type="text"
                    value={branchForm.district}
                    onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })}
                    placeholder="e.g. Bengaluru Urban"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={branchForm.managerName}
                    onChange={(e) => setBranchForm({ ...branchForm, managerName: e.target.value })}
                    placeholder="e.g. Suresh Gowda"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="+91 99000 11223"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Email</label>
                  <input
                    type="email"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    placeholder="branch@coop.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="Street address, building number..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={branchLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {branchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Create Branch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Create User / Staff Account</h3>
                <p className="text-xs text-slate-500">Onboard officer or employee for {profile.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@coop.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="unique_username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Organization Admin">Organization Admin</option>
                    <option value="President">President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Employee">Employee</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Branch</label>
                  <select
                    value={userForm.branchId}
                    onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="">All Branches / Main Society</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={userForm.gender}
                    onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {userLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setResetModalUser(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">For {resetModalUser.name} ({resetModalUser.username})</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono font-bold"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizationDetailsPage;
