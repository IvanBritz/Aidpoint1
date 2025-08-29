'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: 'project_director' | 'employee' | 'beneficiary';
  phone?: string;
  address?: string;
  status: string;
  must_change_password?: boolean;
  position?: {
    id: number;
    name: string;
    description?: string;
  };
  activeSubscription?: {
    id: number;
    plan: {
      id: number;
      name: string;
      price: number;
      features: string[];
    };
    is_trial: boolean;
    trial_ends_at?: string;
    end_date: string;
  };
  beneficiaryProfile?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isProjectDirector: boolean;
  isEmployee: boolean;
  isBeneficiary: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'project_director' | 'beneficiary';
  phone?: string;
  address?: string;
  beneficiary_profile_id?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      console.log('AuthContext: Initializing authentication...');
      
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('AuthContext: Token present:', !!token);
      console.log('AuthContext: User data present:', !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('AuthContext: Parsed user:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('AuthContext: Failed to parse user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } else {
        console.log('AuthContext: No valid token or user data found');
      }
      
      console.log('AuthContext: Initialization complete, setting loading to false');
      setLoading(false);
    };

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    api.post('/auth/logout').finally(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      window.location.href = '/auth/login';
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isProjectDirector: user?.role === 'project_director',
    isEmployee: user?.role === 'employee',
    isBeneficiary: user?.role === 'beneficiary',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
