import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { isAuthenticated } from "~/utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard component to protect authenticated routes
 * Automatically redirects unauthenticated users to login page
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  redirectTo = "/",
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!isAuthenticated(session)) {
      void router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  // Show loading state
  if (status === "loading") {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated(session)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Hook to check authentication status
 */
export const useAuthGuard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const redirectToLogin = (returnUrl?: string) => {
    const loginUrl = returnUrl
      ? `/?return=${encodeURIComponent(returnUrl)}`
      : "/";
    void router.push(loginUrl);
  };

  const requireAuth = (redirectUrl?: string) => {
    if (status === "loading") return false;

    if (!isAuthenticated(session)) {
      redirectToLogin(redirectUrl || router.asPath);
      return false;
    }

    return true;
  };

  return {
    isAuthenticated: isAuthenticated(session),
    isLoading: status === "loading",
    session,
    redirectToLogin,
    requireAuth,
  };
};
