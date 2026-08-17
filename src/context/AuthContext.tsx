'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'RESTAURANT_STAFF' | 'DELIVERY_PARTNER' | 'ADMIN';
  phone?: string;
  address?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'CUSTOMER' | 'RESTAURANT_STAFF' | 'DELIVERY_PARTNER' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS = {
  CUSTOMER: { email: 'customer@example.com', password: 'password123', label: 'Customer (Alex)' },
  RESTAURANT_STAFF: { email: 'staff@bellaitalia.com', password: 'password123', label: 'Restaurant Staff (Chef Marco)' },
  DELIVERY_PARTNER: { email: 'driver@example.com', password: 'password123', label: 'Delivery Driver (David)' },
  ADMIN: { email: 'admin@fooddelivery.com', password: 'password123', label: 'Administrator (Sarah)' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const quickDemoLogin = async (role: 'CUSTOMER' | 'RESTAURANT_STAFF' | 'DELIVERY_PARTNER' | 'ADMIN') => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return;
    setLoading(true);
    const res = await login(creds.email, creds.password);
    setLoading(false);
    if (res.success) {
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'RESTAURANT_STAFF') router.push('/restaurant/dashboard');
      else if (role === 'DELIVERY_PARTNER') router.push('/delivery/dashboard');
      else router.push('/');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
