/**
 * AuthContext - React Context for managing authentication state
 * Provides currentUser, loading, error states and auth functions (login, logout, register)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * User type representing the current authenticated user
 */
export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  photo_url?: string;
}

/**
 * Login request payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * API response for login endpoint
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * API response for registration endpoint
 */
export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
}

/**
 * Auth context value interface
 */
export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  clearError: () => void;
}

/**
 * AuthContext default value
 */
const defaultAuthContextValue: AuthContextValue = {
  currentUser: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  clearError: () => {},
};

/**
 * AuthContext instance
 */
const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);

/**
 * Local storage key for JWT token
 */
const TOKEN_KEY = 'auth_token';

/**
 * Local storage key for user data
 */
const USER_KEY = 'auth_user';

/**
 * Base API URL - should be configured via environment variable
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Custom hook to access AuthContext
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * AuthProvider component props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component - wraps the application to provide auth state
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Decode JWT token to check expiration
   * Returns null if token is invalid or expired
   */
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }, []);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userJson = localStorage.getItem(USER_KEY);

        if (token && userJson) {
          // Check if token is still valid
          if (isTokenValid(token)) {
            const user = JSON.parse(userJson) as User;
            setCurrentUser(user);
            // Set default authorization header for axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Token expired, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isTokenValid]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Login function - authenticates user and stores token
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );

      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setCurrentUser(user);
    } catch (err) {
      const axiosError = err as { response?: { data: ApiError } };
      const errorMessage = axiosError.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function - clears token and user state
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Call logout endpoint for consistency and logging
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Clear authorization header
      delete axios.defaults.headers.common['Authorization'];

      // Clear user state
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  /**
   * Register function - creates new user account
   */
  const register = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await axios.post<RegisterResponse>(
        `${API_BASE_URL}/auth/register`,
        credentials
      );

      // Registration successful - user is now logged in
      // Note: The register endpoint returns user data but not a token
      // We'll need to login after registration or the API should return a token
      // For now, we'll auto-login after registration
      await login({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (err) {
      const axiosError = err as { response?: { data: ApiError } };
      const errorMessage = axiosError.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [login]);

  /**
   * Context value object
   */
  const value: AuthContextValue = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
