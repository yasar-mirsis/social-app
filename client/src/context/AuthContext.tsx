/**
 * Authentication Context
 * Manages authentication state across the application
 * Provides currentUser, loading, error states and auth functions
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

/**
 * User interface representing the authenticated user
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  /** Current authenticated user, or null if not authenticated */
  currentUser: User | null;
  /** Loading state for authentication operations */
  loading: boolean;
  /** Error message from the last authentication operation */
  error: string | null;
  /** Register a new user */
  register: (email: string, password: string, name: string) => Promise<void>;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Logout the current user */
  logout: () => Promise<void>;
  /** Clear any error message */
  clearError: () => void;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Local storage key for JWT token
 */
const TOKEN_KEY = 'auth_token';

/**
 * API base URL - should be configured via environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state and functions
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear any error message
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Store JWT token in localStorage
   */
  const storeToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  /**
   * Remove JWT token from localStorage
   */
  const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
  };

  /**
   * Get JWT token from localStorage
   */
  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  /**
   * Check if token is expired (JWT expiration check)
   */
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  /**
   * Fetch current user data using stored token
   */
  const fetchCurrentUser = useCallback(async (token: string): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentUser(response.data);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // If token is invalid, remove it
      removeToken();
      setCurrentUser(null);
    }
  }, []);

  /**
   * Initialize authentication state on mount
   * Check for existing token and validate it
   */
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = getToken();

      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          removeToken();
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Fetch current user with valid token
        await fetchCurrentUser(token);
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  /**
   * Register a new user
   * @param email - User's email address
   * @param password - User's password
   * @param name - User's display name
   */
  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        name,
      });

      // Registration successful - user is created but not logged in
      // Optionally auto-login after registration
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Registration failed'
        : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Login with email and password
   * @param email - User's email address
   * @param password - User's password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token and set current user
      storeToken(token);
      setCurrentUser(user);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Login failed'
        : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout the current user
   * Clears token and user state
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (token) {
        // Call logout endpoint for logging/analytics
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Clear local state
      removeToken();
      setCurrentUser(null);

      setLoading(false);
    } catch (err) {
      // Even if logout API fails, clear local state
      removeToken();
      setCurrentUser(null);
      setLoading(false);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Logout failed'
        : 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Context value to be provided
   */
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}