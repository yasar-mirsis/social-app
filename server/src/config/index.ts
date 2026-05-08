/**
 * Configuration constants and validation helpers
 * Centralized location for environment variable validation and app constants
 */

/**
 * Validation regex for email format
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Special characters allowed in passwords
 * Includes common special characters for password complexity requirements
 */
export const SPECIAL_CHARACTERS_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

/**
 * Default JWT token expiration time
 * Can be overridden by JWT_EXPIRES_IN environment variable
 */
export const DEFAULT_JWT_EXPIRES_IN = '7d';

/**
 * Get JWT secret from environment with validation
 * This function should only be called after server startup validation has confirmed JWT_SECRET is set
 * @throws {Error} If JWT_SECRET is not set (should never happen if startup validation is correct)
 */
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // This should never happen if startup validation is correct
    // But we include this check for type safety and defense in depth
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

/**
 * Get JWT expiration time from environment or use default
 */
export const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
};
