'use client';  // Add this line at the top of the file

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type UserContextType = {
  user: any;
  updateUser: (data: any) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(session?.user);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  const updateUser = (data: any) => {
    setUser((prevUser: any) => ({ ...prevUser, ...data }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
