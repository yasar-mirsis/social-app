/**
 * AuthContext and useAuth Hook Tests
 * Tests for authentication state management and API interactions
 */

import React, { ReactNode } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth, AuthContextType, User } from '../../src/context/AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock axios
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper components
const TestComponent = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthProvider', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('1. AuthProvider initialization with no token', () => {
    it('should initialize with loading state true when no token exists', () => {
      render(<TestComponent />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should set loading to false after initialization completes', async () => {
      render(<TestComponent />);
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should set currentUser to null when no token exists', async () => {
      render(<TestComponent />);
      await waitFor(() => {
        const context = useAuth();
        expect(context.currentUser).toBeNull();
      });
    });

    it('should not call fetchCurrentUser when no token exists', async () => {
      render(<TestComponent />);
      await waitFor(() => {
        expect(mockedAxios.get).not.toHaveBeenCalled();
      });
    });
  });

  describe('2. AuthProvider initialization with valid token', () => {
    it('should fetch current user with valid token', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/users/me'),
          expect.objectContaining({
            headers: { Authorization: `Bearer ${mockToken}` },
          })
        );
      });
    });

    it('should set currentUser to the fetched user', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      render(<TestComponent />);

      await waitFor(() => {
        const context = useAuth();
        expect(context.currentUser).toEqual(mockUser);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      render(<TestComponent />);

      await waitFor(() => {
        const context = useAuth();
        expect(context.loading).toBe(false);
      });
    });
  });

  describe('3. AuthProvider initialization with expired token', () => {
    it('should remove expired token and set currentUser to null', async () => {
      // Create an expired token (exp is in the past)
      const expiredToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      })).toString('base64');

      localStorage.setItem('auth_token', expiredToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });

    it('should not fetch current user with expired token', async () => {
      const expiredToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600,
      })).toString('base64');

      localStorage.setItem('auth_token', expiredToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockedAxios.get).not.toHaveBeenCalled();
      });
    });

    it('should set currentUser to null when token is expired', async () => {
      const expiredToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600,
      })).toString('base64');

      localStorage.setItem('auth_token', expiredToken);

      render(<TestComponent />);

      await waitFor(() => {
        const context = useAuth();
        expect(context.currentUser).toBeNull();
      });
    });
  });

  describe('4. register function - successful registration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should call register API with correct data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ status: 201 });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/auth/register',
        {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }
      );
    });

    it('should set loading to true during registration', async () => {
      mockedAxios.post.mockResolvedValueOnce({ status: 201 });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      // Loading should be set back to false after completion
      expect(result.current.loading).toBe(false);
    });

    it('should clear error before successful registration', async () => {
      mockedAxios.post.mockResolvedValueOnce({ status: 201 });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Set an initial error
      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should not set currentUser after successful registration', async () => {
      mockedAxios.post.mockResolvedValueOnce({ status: 201 });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.currentUser).toBeNull();
    });
  });

  describe('5. register function - API error handling', () => {
    it('should handle API error with response data', async () => {
      const errorMessage = 'Email already in use';
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: errorMessage },
          status: 409,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await expect(
        result.current.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle API error without response data', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {},
          status: 500,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await expect(
        result.current.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Registration failed');

      expect(result.current.error).toBe('Registration failed');
    });

    it('should handle network error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await expect(
        result.current.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Registration failed');

      expect(result.current.error).toBe('Registration failed');
    });

    it('should set loading to false after registration error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Email already in use' },
          status: 409,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.register('test@example.com', 'password123', 'Test User');
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('6. login function - successful login', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should call login API with correct data', async () => {
      const { token, user } = {
        token: 'new.token.here',
        user: {
          id: '2',
          email: 'user@example.com',
          name: 'John Doe',
        },
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        {
          email: 'user@example.com',
          password: 'password123',
        }
      );
    });

    it('should store token in localStorage', async () => {
      const { token } = {
        token: 'new.token.here',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should set currentUser to the logged-in user', async () => {
      const { token, user } = {
        token: 'new.token.here',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(result.current.currentUser).toEqual(user);
    });

    it('should set loading to false after successful login', async () => {
      const { token, user } = {
        token: 'new.token.here',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear error before login', async () => {
      const { token, user } = {
        token: 'new.token.here',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Set an initial error
      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('7. login function - invalid credentials', () => {
    it('should handle invalid credentials error', async () => {
      const errorMessage = 'Invalid credentials';
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: errorMessage },
          status: 401,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await expect(
        result.current.login('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should not store token on login failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Invalid credentials' },
          status: 401,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (e) {
          // Expected error
        }
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should not set currentUser on login failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Invalid credentials' },
          status: 401,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.currentUser).toBeNull();
    });

    it('should set loading to false after login error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Invalid credentials' },
          status: 401,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('8. logout function - successful logout', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
    });

    it('should call logout API', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/auth/logout',
        {},
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
    });

    it('should remove token from localStorage', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should set currentUser to null', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.currentUser).toBeNull();
    });

    it('should set loading to false after logout', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear error before logout', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Set an initial error
      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('9. logout function - API error handling', () => {
    it('should still clear local state even when logout API fails', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
      mockedAxios.post.mockRejectedValueOnce(new Error('Logout API failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (e) {
          // Expected error
        }
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(result.current.currentUser).toBeNull();
    });

    it('should set error message when logout API fails', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Server error during logout' },
          status: 500,
        },
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Logout failed');
    });

    it('should handle network error during logout', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (e) {
          // Expected error
        }
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(result.current.currentUser).toBeNull();
      expect(result.current.error).toBe('Logout failed');
    });

    it('should still clear local state when no token exists', async () => {
      localStorage.removeItem('auth_token');
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (e) {
          // Expected error
        }
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(result.current.currentUser).toBeNull();
    });
  });

  describe('10. clearError function', () => {
    it('should clear the error state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Set an initial error
      act(() => {
        result.current.clearError();
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });

    it('should not throw error when called with no error', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      expect(() => {
        act(() => {
          result.current.clearError();
        });
      }).not.toThrow();
    });

    it('should allow multiple clearError calls', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Set an initial error
      act(() => {
        result.current.clearError();
      });

      // Clear again
      act(() => {
        result.current.clearError();
      });

      // Error should still be cleared
      expect(result.current.error).toBeNull();
    });
  });

  describe('11. useAuth hook throws error when used outside AuthProvider', () => {
    it('should throw error when useAuth is called outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should throw specific error message', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow(/must be used within/);
    });
  });

  describe('12. Token persistence in localStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store token in localStorage after successful login', async () => {
      const { token, user } = {
        token: 'stored.token.123',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(localStorage.getItem('auth_token')).toBe('stored.token.123');
    });

    it('should retrieve token from localStorage on page reload', async () => {
      const { token, user } = {
        token: 'reload.token.456',
        user: mockUser,
      };

      localStorage.setItem('auth_token', token);
      mockedAxios.get.mockResolvedValueOnce({
        data: user,
      });

      render(<TestComponent />);

      await waitFor(() => {
        const context = useAuth();
        expect(context.currentUser).toEqual(user);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    });

    it('should remove token from localStorage after logout', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should clear token on expired token', async () => {
      const expiredToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600,
      })).toString('base64');

      localStorage.setItem('auth_token', expiredToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('13. Token expiration validation', () => {
    it('should correctly identify expired token', async () => {
      const expiredToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      })).toString('base64');

      localStorage.setItem('auth_token', expiredToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });

    it('should correctly identify future token', async () => {
      const futureToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
      })).toString('base64');

      localStorage.setItem('auth_token', futureToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('should handle token without expiration property', async () => {
      const tokenWithoutExp = Buffer.from(JSON.stringify({
        iat: Math.floor(Date.now() / 1000),
      })).toString('base64');

      localStorage.setItem('auth_token', tokenWithoutExp);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('should handle invalid token format', async () => {
      const invalidToken = 'invalid.token.format';

      localStorage.setItem('auth_token', invalidToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });

    it('should handle malformed base64 token', async () => {
      const malformedToken = Buffer.from('not:valid:base64').toString('base64');

      localStorage.setItem('auth_token', malformedToken);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });

    it('should handle token with exp as string', async () => {
      const tokenWithStrExp = Buffer.from(JSON.stringify({
        exp: '1234567890', // exp as string
      })).toString('base64');

      localStorage.setItem('auth_token', tokenWithStrExp);

      render(<TestComponent />);

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('Edge Cases and Additional Scenarios', () => {
    it('should handle concurrent API calls correctly', async () => {
      localStorage.setItem('auth_token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });
      mockedAxios.post.mockResolvedValueOnce({ status: 201 });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Start a login while initialization is happening
      const loginPromise = result.current.login('user@example.com', 'password123');

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Complete initialization
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Complete login
      await loginPromise;

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle rapid successive register calls', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({ status: 201 })
        .mockRejectedValueOnce({
          response: {
            data: { error: 'Email already in use' },
            status: 409,
          },
        } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // First call succeeds
      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      // Second call fails
      await expect(
        result.current.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Email already in use');

      expect(result.current.error).toBe('Email already in use');
    });

    it('should handle token update on login', async () => {
      localStorage.setItem('auth_token', 'old.token');
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUser,
      });

      const { token, user } = {
        token: 'new.token.789',
        user: mockUser,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token, user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestComponent,
      });

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      // Perform login to update token
      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      // Token should be updated
      expect(localStorage.getItem('auth_token')).toBe('new.token.789');
    });

    it('should handle API errors with different status codes', async () => {
      const errorCases = [
        { status: 400, message: 'Bad request' },
        { status: 403, message: 'Forbidden' },
        { status: 404, message: 'Not found' },
        { status: 500, message: 'Internal server error' },
      ];

      for (const { status, message } of errorCases) {
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: message },
            status,
          },
        } as any);

        const { result } = renderHook(() => useAuth(), {
          wrapper: TestComponent,
        });

        await expect(
          result.current.register('test@example.com', 'password123', 'Test User')
        ).rejects.toThrow(message);

        expect(result.current.error).toBe(message);
      }
    });
  });
});
