import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization and active context headers if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahakara_token') || sessionStorage.getItem('sahakara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeRole = localStorage.getItem('sahakara_active_role') || sessionStorage.getItem('sahakara_active_role');
    if (activeRole) {
      config.headers['x-active-role'] = activeRole;
    }

    const activeGroupStr = localStorage.getItem('sahakara_active_group') || sessionStorage.getItem('sahakara_active_group');
    if (activeGroupStr) {
      try {
        const grp = JSON.parse(activeGroupStr);
        if (grp?._id) {
          config.headers['x-active-group'] = grp._id;
        }
      } catch (e) {}
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
export const fetchPublicSettings = () => API.get('/auth/public-settings');
export const registerPublicUser = (data) => API.post('/auth/register-public', data);
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
export const fetchBranches = fetchBranchesList;
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
export const fetchMembers = fetchMembersList;
export const fetchMyMemberProfileApi = () => API.get('/members/me');
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
export const fetchGroups = fetchGroupsList;
export const fetchMyGroupsApi = () => API.get('/groups/my-groups');
export const createGroupApi = (data) => API.post('/groups', data);
export const fetchGroupProfile = (id) => API.get(`/groups/${id}`);
export const updateGroupApi = (id, data) => API.put(`/groups/${id}`, data);
export const assignGroupLeaderApi = (id, data) => API.put(`/groups/${id}/leader`, data);
export const addGroupMembersApi = (id, data) => API.post(`/groups/${id}/members`, data);
export const removeGroupMemberApi = (id, memberId) => API.delete(`/groups/${id}/members/${memberId}`);
export const transferGroupMemberApi = (data) => API.post('/groups/transfer-member', data);
export const toggleGroupStatusApi = (id) => API.put(`/groups/${id}/status`);
export const updateGroupStatus = (id, status) => API.put(`/groups/${id}/status`, { status });
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
export const submitDepositRequestApi = (data) => API.post('/savings/deposit-request', data);
export const submitWithdrawalRequestApi = (data) => API.post('/savings/withdrawal-request', data);
export const fetchPendingSavingsRequestsApi = (params) => API.get('/savings/pending-requests', { params });
export const approveSavingsRequestApi = (id, data) => API.put(`/savings/requests/${id}/approve`, data);
export const rejectSavingsRequestApi = (id, data) => API.put(`/savings/requests/${id}/reject`, data);
export const rollbackSavingsTransactionApi = (id, data) => API.post(`/savings/transactions/${id}/rollback`, data);
export const fetchSavingsTransactions = (params) => API.get('/savings/transactions', { params });
export const fetchMemberPassbook = (accountId, params) => API.get(`/savings/passbook/${accountId}`, { params });

// ==============================
// MODULE 11: LOAN MANAGEMENT
// ==============================
export const fetchLoanDashboardStats = (params) => API.get('/loans/dashboard', { params });
export const getLoanDashboard = fetchLoanDashboardStats;

export const fetchLoanTypes = (params) => API.get('/loans/types', { params });
export const getLoanTypes = fetchLoanTypes;

export const createLoanTypeApi = (data) => API.post('/loans/types', data);
export const createLoanType = createLoanTypeApi;

export const applyForLoanApi = (data) => API.post('/loans/apply', data);
export const applyForLoan = applyForLoanApi;

export const checkLoanEligibilityApi = (data) => API.post('/loans/eligibility', data);

export const fetchLoans = (params) => API.get('/loans', { params });
export const getLoans = fetchLoans;

export const fetchLoanById = (id) => API.get(`/loans/${id}`);
export const getLoanById = fetchLoanById;

export const reviewLoanApi = (id, data) => API.post(`/loans/${id}/review`, data);
export const reviewLoan = reviewLoanApi;

export const approveLoanApi = (id, data) => API.post(`/loans/${id}/approve`, data);
export const approveLoan = approveLoanApi;

export const rejectLoanApi = (id, data) => API.post(`/loans/${id}/reject`, data);
export const rejectLoan = rejectLoanApi;

export const resubmitLoanApi = (id, data) => API.put(`/loans/${id}/resubmit`, data);
export const resubmitLoan = resubmitLoanApi;

export const fetchLoanCibilScoreApi = (id) => API.get(`/loans/${id}/cibil`);
export const fetchLoanCibilScore = fetchLoanCibilScoreApi;

export const disburseLoanApi = (id, data) => API.post(`/loans/${id}/disburse`, data);
export const disburseLoan = disburseLoanApi;

// ==========================================
// MODULE 12: EMI & REPAYMENTS
// ==========================================
// MODULE 12: EMI & REPAYMENTS
// ==========================================
export const fetchRepaymentDashboard = (params) => API.get('/repayments/dashboard', { params });
export const fetchRepaymentsDashboardStats = fetchRepaymentDashboard;
export const getRepaymentDashboard = fetchRepaymentDashboard;

export const fetchEmiSchedule = (loanId) => API.get(`/repayments/loan/${loanId}`);
export const getEmiSchedule = fetchEmiSchedule;
export const getLoanAmortizationSchedule = fetchEmiSchedule;

export const recordRepaymentApi = (data) => API.post('/repayments', data);
export const recordRepayment = recordRepaymentApi;

export const deductEmiFromSavingsApi = (data) => API.post('/repayments/deduct-from-savings', data);
export const deductEmiFromSavings = deductEmiFromSavingsApi;

export const fetchUpcomingEMIs = (params) => API.get('/repayments/upcoming', { params });
export const getUpcomingEMIs = fetchUpcomingEMIs;

export const fetchOverdueEMIs = (params) => API.get('/repayments/overdue', { params });
export const getOverdueEMIs = fetchOverdueEMIs;

export const fetchRepaymentTransactions = (params) => API.get('/repayments/transactions', { params });
export const getRepaymentTransactions = fetchRepaymentTransactions;

export const generateLoanSchedule = (loanId, data) => API.post(`/repayments/${loanId}/generate-schedule`, data);
export const generateLoanScheduleApi = generateLoanSchedule;

export const closeLoanAccount = (loanId, data) => API.post(`/repayments/${loanId}/close`, data);
export const closeLoanAccountApi = closeLoanAccount;

// ==========================================
// MODULE 13: ACCOUNTING
// ==========================================
export const fetchAccountingDashboard = (params) => API.get('/accounting/dashboard', { params });
export const getAccountingDashboard = fetchAccountingDashboard;

export const fetchChartOfAccounts = (params) => API.get('/accounting/accounts', { params });
export const getChartOfAccounts = fetchChartOfAccounts;

export const createAccountApi = (data) => API.post('/accounting/accounts', data);

export const fetchJournalEntries = (params) => API.get('/accounting/journals', { params });
export const getJournalEntries = fetchJournalEntries;

export const createJournalEntryApi = (data) => API.post('/accounting/journals', data);

export const fetchTrialBalance = (params) => API.get('/accounting/trial-balance', { params });
export const getTrialBalance = fetchTrialBalance;

export const fetchGeneralLedger = (params) => API.get('/accounting/general-ledger', { params });
export const getGeneralLedger = fetchGeneralLedger;

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
export const fetchMeetingDashboard = (params) => API.get('/meetings/dashboard', { params });
export const fetchCalendarMeetings = (params) => API.get('/meetings/calendar', { params });
export const fetchMeetingsList = (params) => API.get('/meetings', { params });
export const fetchMeetingDetails = (id) => API.get(`/meetings/${id}`);
export const createMeeting = (data) => API.post('/meetings', data);
export const createMeetingApi = createMeeting;
export const updateMeeting = (id, data) => API.put(`/meetings/${id}`, data);
export const updateMeetingApi = updateMeeting;
export const cancelMeeting = (id) => API.post(`/meetings/${id}/cancel`);
export const endMeeting = (id) => API.post(`/meetings/${id}/end`);
export const endMeetingApi = endMeeting;
export const addAgendaItem = (id, data) => API.post(`/meetings/${id}/agenda`, data);
export const updateAgendaItem = (id, agendaId, data) => API.put(`/meetings/${id}/agenda/${agendaId}`, data);
export const deleteAgendaItem = (id, agendaId) => API.delete(`/meetings/${id}/agenda/${agendaId}`);
export const searchParticipants = (params) => API.get('/meetings/participants/search', { params: typeof params === 'string' ? { query: params } : params });
export const addParticipants = (id, participants) => API.post(`/meetings/${id}/participants`, { participants });
export const removeParticipant = (id, participantId) => API.delete(`/meetings/${id}/participants/${participantId}`);
export const fetchMeetingAttendance = (id) => API.get(`/meetings/${id}/attendance`);
export const markAttendance = (id, attendanceRecords) => API.post(`/meetings/${id}/attendance`, { attendanceRecords });
export const saveMinutes = (id, data) => API.post(`/meetings/${id}/minutes`, data);
export const finalizeMinutes = (id) => API.post(`/meetings/${id}/minutes/finalize`);
export const addActionItem = (id, data) => API.post(`/meetings/${id}/action-items`, data);
export const updateActionItem = (id, itemId, data) => API.put(`/meetings/${id}/action-items/${itemId}`, data);
export const uploadMeetingDocument = (id, formData) =>
  API.post(`/meetings/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const fetchMeetingReports = (params) => API.get('/meetings/reports', { params });

// ============================================================================
// CHAT & COMMUNICATION API
// ============================================================================
export const fetchChatContacts = async () => {
  return await API.get('/chat/contacts');
};

export const fetchChatMessages = async (params) => {
  return await API.get('/chat/messages', { params });
};

export const sendChatMessageApi = async (data) => {
  return await API.post('/chat/messages', data);
};

// ============================================================================
// COMPLAINTS & SUPPORT TICKETS API
// ============================================================================
export const fetchComplaintStats = (params) => API.get('/complaints/stats', { params });
export const fetchComplaints = (params) => API.get('/complaints', { params });
export const createComplaintApi = (data) => API.post('/complaints', data);
export const fetchComplaintById = (id) => API.get(`/complaints/${id}`);
export const transferComplaintApi = (id, data) => API.put(`/complaints/${id}/transfer`, data);
export const escalateComplaintApi = (id, data) => API.put(`/complaints/${id}/escalate`, data);
export const addComplaintNoteApi = (id, data) => API.post(`/complaints/${id}/notes`, data);
export const resolveComplaintApi = (id, data) => API.put(`/complaints/${id}/resolve`, data);

// ============================================================================
// ACCOUNT CLOSURE & SETTLEMENT API
// ============================================================================
export const fetchAccountClosureStats = (params) => API.get('/account-closures/stats', { params });
export const fetchAccountClosures = (params) => API.get('/account-closures', { params });
export const fetchAccountClosureById = (id) => API.get(`/account-closures/${id}`);
export const fetchMemberClosureFinancials = (memberId) => API.get(`/account-closures/member-financials/${memberId}`);
export const submitAccountClosureApi = (data) => API.post('/account-closures', data);
export const processAccountClosureApi = (id, data) => API.put(`/account-closures/${id}/process`, data);

// ============================================================================
// GROUP EXECUTIVES ASSIGNMENT API
// ============================================================================
export const assignGroupExecutivesApi = async (id, data) => {
  return await API.put(`/groups/${id}/executives`, data);
};

