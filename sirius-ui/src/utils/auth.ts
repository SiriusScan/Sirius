import { type Session } from "next-auth";
import { signOut as nextAuthSignOut } from "next-auth/react";

// Types
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface AuthSession extends Session {
  user: AuthUser;
}

/**
 * Get the base URL for the current environment
 * This helps prevent localhost redirect issues
 */
export const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Browser should use relative url
    return window.location.origin;
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Assume localhost for development
  return "http://localhost:3000";
};

/**
 * Create a redirect URL that preserves the current domain
 */
export const createRedirectUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Redirect to dashboard with proper URL handling
 */
export const redirectToDashboard = (): void => {
  if (typeof window !== "undefined") {
    const dashboardUrl = createRedirectUrl("/dashboard");
    window.location.href = dashboardUrl;
  }
};

/**
 * Redirect to login page with proper URL handling
 */
export const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    const loginUrl = createRedirectUrl("/");
    window.location.href = loginUrl;
  }
};

/**
 * Handle user sign out with proper redirect handling
 * This prevents the localhost redirect issue by using manual redirect
 */
export const handleSignOut = async (): Promise<void> => {
  try {
    // Clear any remember me data
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEYS.REMEMBER_ME);
      localStorage.removeItem(SESSION_STORAGE_KEYS.LAST_USERNAME);
    }

    // Sign out without NextAuth's automatic redirect
    await nextAuthSignOut({ redirect: false });

    // Manually redirect to login page with proper URL handling
    redirectToLogin();
  } catch (error) {
    console.error("Sign out error:", error);
    // Fallback: still redirect to login even if sign out fails
    redirectToLogin();
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (
  session: Session | null
): session is AuthSession => {
  return !!session?.user?.id;
};

/**
 * Utility to get user display name
 */
export const getUserDisplayName = (user: AuthUser): string => {
  return user.name || user.email || user.id || "User";
};

/**
 * Authentication error messages
 */
export const AUTH_ERRORS = {
  CREDENTIALS_SIGNIN: "Invalid username or password. Please try again.",
  SIGNIN_ERROR: "An error occurred during sign in. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  UNAUTHORIZED: "You are not authorized to access this page.",
  UNKNOWN: "An unexpected authentication error occurred.",
} as const;

/**
 * Get user-friendly error message from NextAuth error
 */
export const getAuthErrorMessage = (error: string | null): string => {
  if (!error) return "";

  switch (error) {
    case "CredentialsSignin":
      return AUTH_ERRORS.CREDENTIALS_SIGNIN;
    case "SessionRequired":
      return AUTH_ERRORS.SESSION_EXPIRED;
    case "AccessDenied":
      return AUTH_ERRORS.UNAUTHORIZED;
    default:
      return AUTH_ERRORS.SIGNIN_ERROR;
  }
};

/**
 * Validation utilities
 */
export const validateLoginForm = (username: string, password: string) => {
  const errors: string[] = [];

  if (!username?.trim()) {
    errors.push("Username is required");
  }

  if (!password?.trim()) {
    errors.push("Password is required");
  }

  if (username?.length < 2) {
    errors.push("Username must be at least 2 characters");
  }

  if (password?.length < 4) {
    errors.push("Password must be at least 4 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Session storage utilities for remember me functionality
 */
export const SESSION_STORAGE_KEYS = {
  REMEMBER_ME: "sirius_remember_me",
  LAST_USERNAME: "sirius_last_username",
} as const;

export const setRememberMe = (username: string, remember: boolean): void => {
  if (typeof window === "undefined") return;

  if (remember) {
    localStorage.setItem(SESSION_STORAGE_KEYS.REMEMBER_ME, "true");
    localStorage.setItem(SESSION_STORAGE_KEYS.LAST_USERNAME, username);
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(SESSION_STORAGE_KEYS.LAST_USERNAME);
  }
};

export const getRememberedUsername = (): string => {
  if (typeof window === "undefined") return "";

  const rememberMe = localStorage.getItem(SESSION_STORAGE_KEYS.REMEMBER_ME);
  if (rememberMe === "true") {
    return localStorage.getItem(SESSION_STORAGE_KEYS.LAST_USERNAME) || "";
  }

  return "";
};

export const isRememberMeEnabled = (): boolean => {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(SESSION_STORAGE_KEYS.REMEMBER_ME) === "true";
};
