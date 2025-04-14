import React, { createContext, useContext, useState } from 'react';

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
