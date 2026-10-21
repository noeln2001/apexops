import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  full_name?: string | null;
  role: string;
  is_admin: boolean;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  isDemoMode: false,
  setDemoMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Token stored ONLY in memory for maximum security against XSS/token theft
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDemoMode, setDemoMode] = useState<boolean>(false);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isAdmin: !!user?.is_admin || user?.role === 'admin',
        login,
        logout,
        isDemoMode,
        setDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
