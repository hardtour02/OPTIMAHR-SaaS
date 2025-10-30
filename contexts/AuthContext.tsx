import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthenticatedUser, Permission } from '../types';
import type { AuthError, Session, SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { useCustomize } from './CustomizeContext';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { refetchSettings } = useCustomize();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        if (session) {
          // User is signed in, let's get their profile, role and permissions
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id,
              is_active,
              roles (
                name,
                permissions
              )
            `)
            .eq('id', session.user.id)
            .single();

          if (error || !data) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          } else if (!data.is_active) {
            console.warn('User is inactive, logging out.');
            setUser(null);
            await supabase.auth.signOut();
          } else {
            const roleData = Array.isArray(data.roles) ? data.roles[0] : data.roles;
            const role = roleData as { name: string; permissions: Permission[] } | null;
            const authenticatedUser: AuthenticatedUser = {
              id: session.user.id,
              email: session.user.email || '',
              roleId: 'role_from_db',
              isActive: data.is_active,
              roleName: role?.name || 'Usuario',
              permissions: role?.permissions || [],
            };
            setUser(authenticatedUser);
            refetchSettings();
          }
        } else {
          // User is signed out
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [refetchSettings]);


  const login = async (credentials: SignInWithPasswordCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = useCallback((permission: Permission): boolean => {
      if (user) {
        // Authenticated user logic
        if (user.roleName === 'Admin') return true;
        return user.permissions.includes(permission);
      } else {
        // Public (unauthenticated) user logic: Allow read-only access
        if (permission.includes(':read')) {
          // Explicitly deny sensitive read permissions for public users
          if (permission === 'employees:read:salary') {
            return false;
          }
          return true;
        }
        // Deny all non-read permissions for public users
        return false;
      }
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, hasPermission, loading }}>
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