import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahakara_token') || sessionStorage.getItem('sahakara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for global error formatting
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.error
        ? error.response.data.error
        : error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default API;

// Landing Module APIs
export const submitSocietyInquiry = (inquiryData) => API.post('/landing/inquiry', inquiryData);
export const fetchLandingStats = () => API.get('/landing/stats');

// Module 2 Authentication APIs
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getAuthUser = () => API.get('/auth/me');
export const sendForgotPasswordOTP = (data) => API.post('/auth/forgot-password', data);
export const verifyForgotPasswordOTP = (data) => API.post('/auth/verify-otp', data);
export const resetUserPassword = (data) => API.post('/auth/reset-password', data);
export const logoutUser = () => API.post('/auth/logout');

// Module 3 Super Admin APIs
export const fetchSuperAdminDashboard = () => API.get('/super-admin/dashboard');
export const fetchPendingApprovals = () => API.get('/super-admin/approvals');
export const approveSocietyRequest = (id, data) => API.post(`/super-admin/approvals/${id}/approve`, data);
export const rejectSocietyRequest = (id, data) => API.post(`/super-admin/approvals/${id}/reject`, data);
export const fetchOrganizations = (params) => API.get('/super-admin/organizations', { params });
export const createOrganizationApi = (data) => API.post('/super-admin/organizations', data);
export const fetchOrganizationDetails = (id) => API.get(`/super-admin/organizations/${id}`);
export const updateOrganizationApi = (id, data) => API.put(`/super-admin/organizations/${id}`, data);
export const updateOrgStatus = (id, data) => API.put(`/super-admin/organizations/${id}/status`, data);
export const fetchSystemSettings = () => API.get('/super-admin/settings');
export const updateSystemSettings = (data) => API.put('/super-admin/settings', data);
export const fetchAuditLogs = (params) => API.get('/super-admin/audit-logs', { params });

// Module 4 Organization Management APIs
export const fetchOrgDashboard = (params) => API.get('/organizations/my-org/dashboard', { params });
export const fetchOrgProfile = (params) => API.get('/organizations/my-org/profile', { params });
export const updateOrgProfileApi = (formData) =>
  API.put('/organizations/my-org/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchOrgBranches = (params) => API.get('/organizations/my-org/branches', { params });
export const createOrgBranch = (data) => API.post('/organizations/my-org/branches', data);
export const updateOrgBranch = (id, data) => API.put(`/organizations/my-org/branches/${id}`, data);
export const deleteOrgBranch = (id) => API.delete(`/organizations/my-org/branches/${id}`);
export const fetchOrgSettings = (params) => API.get('/organizations/my-org/settings', { params });
export const updateOrgSettingsApi = (data) => API.put('/organizations/my-org/settings', data);
export const fetchOrgEmployees = (params) => API.get('/organizations/my-org/employees', { params });
export const fetchOrgLogs = (params) => API.get('/organizations/my-org/logs', { params });
export const fetchOrgStats = (params) => API.get('/organizations/my-org/stats', { params });

// Module 5 Branch Management APIs
export const fetchBranchDashboard = (params) => API.get('/branches/dashboard', { params });
export const fetchBranchesList = (params) => API.get('/branches', { params });
export const createBranchApi = (data) => API.post('/branches', data);
export const fetchBranchProfile = (id) => API.get(`/branches/${id}`);
export const updateBranchApi = (id, data) => API.put(`/branches/${id}`, data);
export const assignBranchManagerApi = (id, data) => API.put(`/branches/${id}/manager`, data);
export const fetchBranchEmployees = (id, params) => API.get(`/branches/${id}/employees`, { params });
export const fetchBranchMembers = (id, params) => API.get(`/branches/${id}/members`, { params });
export const fetchBranchReports = (id, params) => API.get(`/branches/${id}/reports`, { params });
export const fetchBranchLogs = (id, params) => API.get(`/branches/${id}/logs`, { params });
export const deleteBranchApi = (id) => API.delete(`/branches/${id}`);

// Module 6 User Management APIs
export const fetchUserDashboard = (params) => API.get('/users/dashboard', { params });
export const fetchUsersList = (params) => API.get('/users', { params });
export const createUserApi = (data) => API.post('/users', data);
export const fetchUserDetails = (id) => API.get(`/users/${id}`);
export const updateUserApi = (id, data) => API.put(`/users/${id}`, data);
export const transferUserBranchApi = (id, data) => API.put(`/users/${id}/transfer-branch`, data);
export const resetUserPasswordApi = (id, data) => API.put(`/users/${id}/reset-password`, data);
export const toggleUserStatusApi = (id) => API.put(`/users/${id}/status`);
export const deleteUserApi = (id) => API.delete(`/users/${id}`);
export const fetchUserReports = (params) => API.get('/users/reports', { params });
export const fetchUserLogs = (params) => API.get('/users/logs', { params });

// Module 7 Member Management APIs
export const fetchMemberDashboard = (params) => API.get('/members/dashboard', { params });
export const fetchMembersList = (params) => API.get('/members', { params });
export const registerMemberApi = (formData) =>
  API.post('/members', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchMemberProfile = (id) => API.get(`/members/${id}`);
export const updateMemberApi = (id, data) => API.put(`/members/${id}`, data);
export const approveMemberApi = (id, data) => API.put(`/members/${id}/approve`, data);
export const rejectMemberApi = (id, data) => API.put(`/members/${id}/reject`, data);
export const verifyMemberKYCApi = (id) => API.put(`/members/${id}/verify-kyc`);
export const toggleMemberStatusApi = (id) => API.put(`/members/${id}/status`);
export const deleteMemberApi = (id) => API.delete(`/members/${id}`);
export const fetchMemberReports = (params) => API.get('/members/reports', { params });
export const fetchMemberLogs = (params) => API.get('/members/logs', { params });

// Module 8 Roles & Permissions APIs
export const fetchRolesDashboard = (params) => API.get('/roles/dashboard', { params });
export const fetchRolesList = (params) => API.get('/roles', { params });
export const createRoleApi = (data) => API.post('/roles', data);
export const fetchRoleDetails = (id) => API.get(`/roles/${id}`);
export const updateRoleApi = (id, data) => API.put(`/roles/${id}`, data);
export const cloneRoleApi = (id, data) => API.post(`/roles/${id}/clone`, data);
export const assignRoleToUserApi = (data) => API.put('/roles/assign-user', data);
export const fetchUserAccessReview = (userId) => API.get(`/roles/user-access-review/${userId}`);
export const toggleRoleStatusApi = (id) => API.put(`/roles/${id}/status`);
export const deleteRoleApi = (id) => API.delete(`/roles/${id}`);
export const fetchRoleLogs = (params) => API.get('/roles/logs', { params });

// Module 9 Group Management APIs
export const fetchGroupDashboard = (params) => API.get('/groups/dashboard', { params });
export const fetchGroupsList = (params) => API.get('/groups', { params });
export const createGroupApi = (data) => API.post('/groups', data);
export const fetchGroupProfile = (id) => API.get(`/groups/${id}`);
export const updateGroupApi = (id, data) => API.put(`/groups/${id}`, data);
export const assignGroupLeaderApi = (id, data) => API.put(`/groups/${id}/leader`, data);
export const addGroupMembersApi = (id, data) => API.post(`/groups/${id}/members`, data);
export const removeGroupMemberApi = (id, memberId) => API.delete(`/groups/${id}/members/${memberId}`);
export const transferGroupMemberApi = (data) => API.post('/groups/transfer-member', data);
export const toggleGroupStatusApi = (id) => API.put(`/groups/${id}/status`);
export const deleteGroupApi = (id) => API.delete(`/groups/${id}`);
export const fetchGroupReports = (params) => API.get('/groups/reports', { params });
export const fetchGroupLogs = (params) => API.get('/groups/logs', { params });

// ==========================================
// MODULE 10: SAVINGS MANAGEMENT
// ==========================================
export const fetchSavingsDashboard = (params) => API.get('/savings/dashboard', { params });
export const fetchSavingsDashboardStats = (params) => API.get('/savings/dashboard', { params });
export const createSavingsAccountApi = (data) => API.post('/savings/accounts', data);
export const fetchSavingsAccounts = (params) => API.get('/savings/accounts', { params });
export const fetchSavingsAccountById = (id) => API.get(`/savings/accounts/${id}`);
export const recordDepositApi = (data) => API.post('/savings/deposit', data);
export const fetchSavingsTransactions = (params) => API.get('/savings/transactions', { params });
export const fetchMemberPassbook = (accountId, params) => API.get(`/savings/passbook/${accountId}`, { params });

// ==========================================
// MODULE 11: LOAN MANAGEMENT
// ==========================================
export const getLoanDashboard = async () => {
  const response = await API.get('/loans/dashboard');
  return response.data;
};
export const fetchLoanDashboardStats = getLoanDashboard;

export const getLoanTypes = async () => {
  const response = await API.get('/loans/types');
  return response.data;
};
export const fetchLoanTypes = getLoanTypes;

export const createLoanType = async (data) => {
  const response = await API.post('/loans/types', data);
  return response.data;
};
export const createLoanTypeApi = createLoanType;

export const applyForLoan = async (data) => {
  const response = await API.post('/loans/apply', data);
  return response.data;
};
export const applyForLoanApi = applyForLoan;

export const checkLoanEligibilityApi = async (data) => {
  return await API.post('/loans/eligibility', data);
};

export const getLoans = async (params) => {
  const response = await API.get('/loans', { params });
  return response.data;
};
export const fetchLoans = getLoans;

export const getLoanById = async (id) => {
  const response = await API.get(`/loans/${id}`);
  return response.data;
};
export const fetchLoanById = getLoanById;

export const reviewLoan = async (id, data) => {
  const response = await API.put(`/loans/${id}/review`, data);
  return response.data;
};
export const reviewLoanApi = reviewLoan;

export const approveLoan = async (id, data) => {
  const response = await API.put(`/loans/${id}/approve`, data);
  return response.data;
};
export const approveLoanApi = approveLoan;

export const rejectLoan = async (id, data) => {
  const response = await API.put(`/loans/${id}/reject`, data);
  return response.data;
};
export const rejectLoanApi = rejectLoan;

export const disburseLoan = async (id, data) => {
  const response = await API.put(`/loans/${id}/disburse`, data);
  return response.data;
};
export const disburseLoanApi = disburseLoan;

// ==========================================
// MODULE 12: EMI & REPAYMENTS
// ==========================================
export const getRepaymentDashboard = async () => {
  const response = await API.get('/repayments/dashboard');
  return response.data;
};
export const fetchRepaymentDashboard = getRepaymentDashboard;

export const getEmiSchedule = async (loanId) => {
  const response = await API.get(`/repayments/loan/${loanId}`);
  return response.data;
};
export const fetchEmiSchedule = getEmiSchedule;

export const recordRepayment = async (data) => {
  const response = await API.post('/repayments', data);
  return response.data;
};
export const recordRepaymentApi = recordRepayment;

// ==========================================
// MODULE 13: ACCOUNTING
// ==========================================
export const getAccountingDashboard = async () => {
  const response = await API.get('/accounting/dashboard');
  return response.data;
};

export const getChartOfAccounts = async () => {
  const response = await API.get('/accounting/accounts');
  return response.data;
};

export const getJournalEntries = async () => {
  const response = await API.get('/accounting/journals');
  return response.data;
};

export const getTrialBalance = async () => {
  const response = await API.get('/accounting/trial-balance');
  return response.data;
};

// ==========================================
// MODULE 14: TRANSACTION MANAGEMENT
// ==========================================
export const fetchTransactionDashboard = async () => {
  const response = await API.get('/transactions/dashboard');
  return response.data;
};

export const fetchTransactions = async (params) => {
  const response = await API.get('/transactions', { params });
  return response.data;
};

export const fetchTransactionDetails = async (id) => {
  const response = await API.get(`/transactions/${id}`);
  return response.data;
};

export const reverseTransaction = async (id, reason) => {
  const response = await API.post(`/transactions/${id}/reverse`, { reason });
  return response.data;
};

// ==========================================
// MODULE 15: MEETING MANAGEMENT
// ==========================================
export const fetchMeetingDashboard = async () => {
  const response = await API.get('/meetings/dashboard');
  return response.data;
};

export const fetchCalendarMeetings = async (params) => {
  const response = await API.get('/meetings/calendar', { params });
  return response.data;
};

export const fetchMeetingsList = async (params) => {
  const response = await API.get('/meetings', { params });
  return response.data;
};

export const fetchMeetingDetails = async (id) => {
  const response = await API.get(`/meetings/${id}`);
  return response.data;
};

export const createMeeting = async (data) => {
  const response = await API.post('/meetings', data);
  return response.data;
};

export const updateMeeting = async (id, data) => {
  const response = await API.put(`/meetings/${id}`, data);
  return response.data;
};

export const cancelMeeting = async (id) => {
  const response = await API.post(`/meetings/${id}/cancel`);
  return response.data;
};

export const addAgendaItem = async (id, data) => {
  const response = await API.post(`/meetings/${id}/agenda`, data);
  return response.data;
};

export const updateAgendaItem = async (id, agendaId, data) => {
  const response = await API.put(`/meetings/${id}/agenda/${agendaId}`, data);
  return response.data;
};

export const deleteAgendaItem = async (id, agendaId) => {
  const response = await API.delete(`/meetings/${id}/agenda/${agendaId}`);
  return response.data;
};

export const searchParticipants = async (query) => {
  const response = await API.get('/meetings/participants/search', { params: { query } });
  return response.data;
};

export const addParticipants = async (id, participants) => {
  const response = await API.post(`/meetings/${id}/participants`, { participants });
  return response.data;
};

export const removeParticipant = async (id, participantId) => {
  const response = await API.delete(`/meetings/${id}/participants/${participantId}`);
  return response.data;
};

export const markAttendance = async (id, attendanceRecords) => {
  const response = await API.post(`/meetings/${id}/attendance`, { attendanceRecords });
  return response.data;
};

export const saveMinutes = async (id, data) => {
  const response = await API.post(`/meetings/${id}/minutes`, data);
  return response.data;
};

export const finalizeMinutes = async (id) => {
  const response = await API.post(`/meetings/${id}/minutes/finalize`);
  return response.data;
};

export const addActionItem = async (id, data) => {
  const response = await API.post(`/meetings/${id}/action-items`, data);
  return response.data;
};

export const updateActionItem = async (id, itemId, data) => {
  const response = await API.put(`/meetings/${id}/action-items/${itemId}`, data);
  return response.data;
};

export const uploadMeetingDocument = async (id, formData) => {
  const response = await API.post(`/meetings/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const fetchMeetingReports = async () => {
  const response = await API.get('/meetings/reports');
  return response.data;
};
