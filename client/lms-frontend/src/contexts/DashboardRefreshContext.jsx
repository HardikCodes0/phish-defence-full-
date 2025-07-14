import React, { createContext, useState, useCallback } from 'react';

export const DashboardRefreshContext = createContext();

export const DashboardRefreshProvider = ({ children }) => {
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Call this function to trigger a refresh
  const triggerRefresh = useCallback(() => {
    setRefreshFlag(flag => !flag);
  }, []);

  return (
    <DashboardRefreshContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}; 