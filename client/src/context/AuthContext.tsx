/**
 * Authentication Context
 * Provides authentication state and functions across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * User type representing the authenticated user
 */
export interface User {
  id: number;
  email: string;
  name: string;
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * AuthContext default value
 */
const AuthContextDefault: AuthContextType = {
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

/**
 * AuthContext instance
 */
const AuthContext = createContext<AuthContextType>(AuthContextDefault);

/**
 * Local storage keys
 */
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * API base URL - should be configured via environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * AuthProvider component
 * Manages authentication state and provides auth functions
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if token is expired
   */
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch {
      // If token is invalid, consider it expired
      return true;
    }
  }, []);

  /**
   * Initialize authentication state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            // Clear expired token and user data
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setCurrentUser(null);
          } else {
            // Token is valid, restore user session
            const user = JSON.parse(userStr) as User;
            setCurrentUser(user);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
        // Clear potentially corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isTokenExpired]);

  /**
   * Store token and user data in localStorage
   */
  const storeAuthData = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  /**
   * Clear token and user data from localStorage
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
  }, []);

  /**
   * Login function
   * Authenticates user with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      storeAuthData(data.token, data.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeAuthData]);

  /**
   * Register function
   * Creates a new user account
   */
  const register = useCallback(async (email: string, password: string, name: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful, but user is not logged in yet
      // The user will need to login separately
      // Clear any existing auth data
      clearAuthData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  /**
   * Logout function
   * Logs out the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Get token before clearing
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        // Call logout endpoint for consistency and server-side logging
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear auth data regardless of API call success
      clearAuthData();
    } catch (err) {
      // Even if logout API fails, clear local auth data
      console.error('Logout error:', err);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  /**
   * Periodically check token expiration
   */
  useEffect(() => {
    if (!currentUser) return;

    const checkExpiration = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isTokenExpired(token)) {
        clearAuthData();
      }
    };

    // Check every minute
    const intervalId = setInterval(checkExpiration, 60000);

    return () => clearInterval(intervalId);
  }, [currentUser, isTokenExpired, clearAuthData]);

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the AuthContext
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
