import { useAuthInternal } from '../context/AuthContext';
import type { AuthContextType } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and methods.
 * Must be used within an AuthProvider component.
 *
 * @returns {AuthContextType} Authentication context containing:
 *   - currentUser: The currently authenticated user or null
 *   - loading: Boolean indicating if auth operation is in progress
 *   - error: Error message string or null
 *   - login: Function to authenticate user with email and password
 *   - logout: Function to log out the current user
 *   - register: Function to register a new user
 *   - clearError: Function to clear the current error state
 *
 * @throws {Error} If used outside of an AuthProvider
 *
 * @example
 * ```tsx
 * const { currentUser, loading, login, logout } = useAuth();
 *
 * if (loading) return <div>Loading...</div>;
 *
 * return (
 *   <div>
 *     {currentUser ? (
 *       <button onClick={logout}>Logout</button>
 *     ) : (
 *       <button onClick={() => login('user@example.com', 'password')}>Login</button>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useAuth = (): AuthContextType => {
  return useAuthInternal();
};
