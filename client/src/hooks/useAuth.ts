/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 * Re-exports the useAuth function from AuthContext for cleaner imports
 */

export { useAuth } from '../context/AuthContext';
export type { AuthContextType, User } from '../context/AuthContext';