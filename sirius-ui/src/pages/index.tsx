import React, { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { cn } from "~/components/lib/utils";
import {
  getAuthErrorMessage,
  validateLoginForm,
  setRememberMe,
  getRememberedUsername,
  isRememberMeEnabled,
  redirectToDashboard,
} from "~/utils/auth";

// Types
interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {}

// Login Form Component
const LoginForm: React.FC<{
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error: string;
}> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load remembered username on component mount
  useEffect(() => {
    const rememberedUsername = getRememberedUsername();
    const rememberMeEnabled = isRememberMeEnabled();

    if (rememberedUsername && rememberMeEnabled) {
      setFormData((prev) => ({
        ...prev,
        username: rememberedUsername,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = useCallback(
    (field: keyof LoginFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
          setValidationErrors([]);
        }
      },
    [validationErrors.length]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const validation = validateLoginForm(
        formData.username,
        formData.password
      );
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      setValidationErrors([]);
      await onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const displayError =
    error || (validationErrors.length > 0 ? validationErrors[0] : "");

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-semibold text-[#9a8686]/80"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange("username")}
            className={cn(
              "w-full rounded-lg border-2 bg-transparent px-4 py-3 text-lg text-violet-100",
              "border-[#f7c1ac]/50 placeholder-[#9a8686]/50",
              "transition-all duration-200",
              "hover:border-[#e88d7c]/70 focus:border-violet-500/60 focus:outline-none",
              "focus:ring-2 focus:ring-violet-500/20",
              displayError && "border-red-500/50"
            )}
            placeholder="Enter your username"
            required
            disabled={isLoading}
            autoComplete="username"
            aria-describedby={displayError ? "login-error" : undefined}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#9a8686]/80"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={cn(
              "w-full rounded-lg border-2 bg-transparent px-4 py-3 text-lg text-violet-100",
              "border-[#f7c1ac]/50 placeholder-[#9a8686]/50",
              "transition-all duration-200",
              "hover:border-[#e88d7c]/70 focus:border-violet-500/60 focus:outline-none",
              "focus:ring-2 focus:ring-violet-500/20",
              displayError && "border-red-500/50"
            )}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            autoComplete="current-password"
            aria-describedby={displayError ? "login-error" : undefined}
          />
        </div>

        {displayError && (
          <div
            id="login-error"
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400"
          >
            {displayError}
          </div>
        )}

        <label className="flex cursor-pointer items-center space-x-3 text-[#9a8686]/90">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange("rememberMe")}
            disabled={isLoading}
            className={cn(
              "h-4 w-4 rounded border-2 border-[#f7c1ac]/50",
              "bg-transparent text-violet-500 transition-colors",
              "focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0",
              "cursor-pointer disabled:opacity-50"
            )}
          />
          <span className="select-none text-sm">Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.username || !formData.password}
        className={cn(
          "w-full rounded-lg py-4 text-lg font-bold transition-all duration-200",
          "bg-gradient-to-r from-[#e9809a] via-[#f7ae99] to-[#f7ae99]",
          "text-black shadow-lg",
          "hover:from-[#e9809a] hover:via-[#9e8f9b] hover:to-[#9e8f9b]",
          "hover:scale-[1.02] hover:text-white hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
          "disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Joining the Pack...</span>
          </div>
        ) : (
          "Join the Pack"
        )}
      </button>
    </form>
  );
};

// Main Login Page Component
export const LoginPage: React.FC<LoginPageProps> = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL-based error parameters
  useEffect(() => {
    const errorParam = router.query?.error as string;
    if (errorParam) {
      setLoginError(getAuthErrorMessage(errorParam));
    }
  }, [router.query?.error]);

  // Handle successful authentication redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check for return URL in query params
      const returnUrl = router.query.return as string;
      if (returnUrl && returnUrl !== "/") {
        window.location.href = decodeURIComponent(returnUrl);
      } else {
        redirectToDashboard();
      }
    }
  }, [session, status, router.query.return]);

  // Handle login form submission
  const handleLogin = useCallback(async (formData: LoginFormData) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false, // Handle redirect manually to fix localhost issue
      });

      if (result?.error) {
        setLoginError(getAuthErrorMessage(result.error));
      } else if (result?.ok) {
        // Handle remember me functionality
        setRememberMe(formData.username, formData.rememberMe);

        // Redirect will be handled by useEffect once session updates
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show loading spinner during session check
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, don't show login form
  if (session?.user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sign In - Sirius Scan</title>
        <meta
          name="description"
          content="Sign in to Sirius Vulnerability Scanner"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/sirius-logo-square.png" />
      </Head>

      <div
        className="flex min-h-screen min-w-full items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/loginbg.jpg")',
        }}
      >
        <div className="container mx-auto flex justify-center p-4">
          <div
            className={cn(
              "relative flex h-auto w-full max-w-md flex-col items-center",
              "rounded-xl border-2 border-[#f7c1ac]/40 bg-black/20 backdrop-blur-md",
              "px-8 py-8 text-white shadow-2xl",
              "hover:shadow-3xl transition-all duration-300"
            )}
          >
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/sirius-scan.png"
                alt="Sirius Scan"
                className="h-20 w-auto transition-transform hover:scale-105"
              />
            </div>

            {/* Welcome Text */}
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-[#9a8686]/80">
                Sign in to access your security dashboard
              </p>
            </div>

            {/* Login Form */}
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={loginError}
            />

            {/* Footer Text */}
            <div className="mt-6 text-center text-xs text-[#9a8686]/60">
              <p>Secure your network with Sirius Scan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Export as default for Next.js page routing
export default LoginPage;
