import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { User, Permission } from '@/types';

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const u = await api.get<User>('/auth/me');
      setUser(u);
      const res = await api.get<{role: string, permissions: Permission[]}>('/auth/permissions');
      setPermissions(res.permissions || []);
    } catch (e) {
      api.clearToken();
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setPermissions([]);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    if (api.getToken()) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (token: string, userData: User) => {
    api.setToken(token);
    setUser(userData);
    const res = await api.get<{role: string, permissions: Permission[]}>('/auth/permissions');
    setPermissions(res.permissions || []);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    api.clearToken();
    setUser(null);
    setPermissions([]);
  };

  const can = (perm: Permission) => permissions.includes(perm);

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated: !!user, isLoading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function Can({ I, children, fallback = null }: { I: Permission; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { can } = useAuth();
  return can(I) ? <>{children}</> : <>{fallback}</>;
}
