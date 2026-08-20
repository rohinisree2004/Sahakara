import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ActiveContextContext = createContext();

export const useActiveContext = () => {
  const context = useContext(ActiveContextContext);
  if (!context) {
    throw new Error('useActiveContext must be used within an ActiveContextProvider');
  }
  return context;
};

export const ActiveContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  // Initialize context based on user's role assignments when user logs in
  useEffect(() => {
    if (user && user.roleAssignments && user.roleAssignments.length > 0) {
      // Find default role assignment to start
      const defaultRole = user.roleAssignments.find(r => r.role === user.role) || user.roleAssignments[0];
      
      if (defaultRole.organizationId) setActiveOrganization(defaultRole.organizationId);
      if (defaultRole.branchId) setActiveBranch(defaultRole.branchId);
      if (defaultRole.groupId) setActiveGroup(defaultRole.groupId);
    }
  }, [user]);

  const switchContext = (type, entity) => {
    if (type === 'organization') {
      setActiveOrganization(entity);
      setActiveBranch(null); // Reset lower contexts
      setActiveGroup(null);
    } else if (type === 'branch') {
      setActiveBranch(entity);
      setActiveGroup(null); // Reset lower contexts
    } else if (type === 'group') {
      setActiveGroup(entity);
    }
  };

  return (
    <ActiveContextContext.Provider
      value={{
        activeOrganization,
        activeBranch,
        activeGroup,
        switchContext,
      }}
    >
      {children}
    </ActiveContextContext.Provider>
  );
};
