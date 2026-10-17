import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAsAdmin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('shaar_auth_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not parse saved session', e);
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('shaar_auth_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('shaar_auth_session');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Authentication failed' };
  };

  const loginAsAdmin = async () => {
    throw new Error('Quick administrator sign-in is disabled. Use deployment-configured credentials.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shaar_auth_session');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'director_admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
