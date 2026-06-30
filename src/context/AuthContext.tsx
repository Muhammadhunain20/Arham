import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'doctor' | 'patient';
  hasClinic?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any, role: string) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });

      if (res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data.user as User;
      }

      setUser(null);
      setIsAuthenticated(false);
      return null;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      await refreshUser();
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });
      
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/auth/register`, {
        ...userData,
        role
      }, {
        withCredentials: true
      });
      
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      refreshUser,
      logout,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
