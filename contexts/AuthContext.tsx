
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { AuthenticatedUser, Permission } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (userData: AuthenticatedUser) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  const login = (userData: AuthenticatedUser) => {
    const userToStore = { ...userData };
    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = useCallback((permission: Permission): boolean => {
      if (!user) return false;
      // Admin role bypasses all permission checks
      if (user.roleName === 'Admin') return true;
      return user.permissions.includes(permission);
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
