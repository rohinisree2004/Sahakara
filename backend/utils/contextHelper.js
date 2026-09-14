const sanitizeId = (id) => {
  if (!id || id === 'All' || id === 'undefined' || id === 'null' || id === '') return null;
  return id.toString();
};

// Extracts active context from request (headers/query/body) and strictly enforces tenant & branch boundary
exports.getActiveContext = (req) => {
  const queryOrgId = sanitizeId(req.headers?.['x-active-organization'] || req.query?.organizationId || req.body?.organizationId);
  const queryBranchId = sanitizeId(req.headers?.['x-active-branch'] || req.query?.branchId || req.body?.branchId);
  const queryGroupId = sanitizeId(req.headers?.['x-active-group'] || req.query?.groupId || req.body?.groupId);
  const user = req.user;

  // 1. Super Admin: full unrestricted access across societies & branches
  if (user && user.role === 'Super Admin') {
    return {
      organizationId: queryOrgId || null,
      branchId: queryBranchId || null,
      groupId: queryGroupId || null,
    };
  }

  const assignments = user?.roleAssignments || [];

  // 2. Resolve User's Native Organization ID
  let userOrgId = (user?.organizationId?._id || user?.organizationId)?.toString() || null;
  if (!userOrgId) {
    const orgAssign = assignments.find(a => a.organizationId);
    if (orgAssign) {
      userOrgId = (orgAssign.organizationId?._id || orgAssign.organizationId)?.toString();
    }
  }

  let finalOrgId = userOrgId;
  // If Organization Admin has multiple org assignments, allow switching only among authorized orgs
  if (queryOrgId && assignments.length > 0) {
    const hasOrgAccess = assignments.some(a => (a.organizationId?._id || a.organizationId)?.toString() === queryOrgId);
    if (hasOrgAccess) finalOrgId = queryOrgId;
  }

  // 3. Resolve User's Native Branch ID
  let userBranchId = (user?.branchId?._id || user?.branchId)?.toString() || null;
  if (!userBranchId) {
    const branchAssign = assignments.find(a => a.branchId);
    if (branchAssign) {
      userBranchId = (branchAssign.branchId?._id || branchAssign.branchId)?.toString();
    }
  }

  // 4. Role-based Branch Scoping Enforcement
  const isBranchScopedRole = ['Branch Manager', 'Employee'].includes(user?.role);
  // Group-scoped: Members and group positions (President, Secretary, Treasurer)
  // NOTE: President/Secretary/Treasurer are group POSITIONS set via x-active-role header,
  // not RoleAssignment roles. Members elected to these positions are still 'Member' in RoleAssignment.
  const isGroupScopedRole = ['President', 'Secretary', 'Treasurer', 'Member'].includes(user?.role);

  let finalBranchId = null;

  if (isBranchScopedRole) {
    // CRITICAL: Branch Managers and Employees MUST ALWAYS be strictly locked to their assigned branch.
    // They are NEVER permitted to query all branches (null) or view another branch's data.
    finalBranchId = userBranchId;
  } else if (isGroupScopedRole) {
    // Group executives and members are also locked to their branch
    finalBranchId = userBranchId || (queryBranchId && assignments.some(a => (a.branchId?._id || a.branchId)?.toString() === queryBranchId) ? queryBranchId : null);
  } else {
    // Organization Admin: can filter by a specific branch within their org, or pass null for all branches in their org
    if (queryBranchId) {
      finalBranchId = queryBranchId;
    }
  }

  // 5. Resolve Group ID
  let userGroupId = (user?.groupId?._id || user?.groupId)?.toString() || null;
  if (!userGroupId) {
    const groupAssign = assignments.find(a => a.groupId);
    if (groupAssign) {
      userGroupId = (groupAssign.groupId?._id || groupAssign.groupId)?.toString();
    }
  }

  let finalGroupId = null;
  if (isGroupScopedRole) {
    finalGroupId = userGroupId || queryGroupId;
  } else if (queryGroupId) {
    finalGroupId = queryGroupId;
  }

  return {
    organizationId: finalOrgId,
    branchId: finalBranchId,
    groupId: finalGroupId,
  };
};
