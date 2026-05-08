import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types for authentication
interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  photo_url?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  clearError: () => void;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  id: number;
  email: string;
  name: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - will be configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and fetch current user
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Check for token expiration on mount and periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Decode JWT to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          // Token has expired
          logout();
        }
      } catch (err) {
        // Invalid token format
        logout();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const intervalId = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get<User>('/users/me');
      setCurrentUser(response.data);
      setError(null);
    } catch (err) {
      // Token is invalid or expired
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call logout endpoint to invalidate token on server
        try {
          await api.post('/auth/logout');
        } catch (err) {
          // Continue with local logout even if server logout fails
          console.error('Server logout failed:', err);
        }
      }

      // Clear local storage
      localStorage.removeItem('token');

      // Clear auth header
      delete api.defaults.headers.common['Authorization'];

      // Update state
      setCurrentUser(null);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Logout failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        email,
        password,
        name,
      });

      // Registration successful, user can now login
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context (exported for use in hooks/useAuth.ts)
export const useAuthInternal = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
