import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession } from './auth';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    setIsLoading(true);
    const session = await getSession();
    setProfile(session);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ profile, isLoading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
