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
} from "~/utils/auth";
import { ActiveConstellationV2Loader } from "~/components/loaders";

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
            className="mb-2 block text-sm font-semibold text-slate-200/90"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange("username")}
            className={cn(
              "w-full rounded-lg border-2 bg-transparent px-4 py-3 text-lg text-slate-50",
              "border-cyan-500/50 placeholder-slate-300/50",
              "transition-all duration-200",
              "hover:border-blue-500/70 focus:border-cyan-500/80 focus:outline-none",
              "focus:ring-2 focus:ring-cyan-400/30",
              "focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
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
            className="mb-2 block text-sm font-semibold text-slate-200/90"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={cn(
              "w-full rounded-lg border-2 bg-transparent px-4 py-3 text-lg text-slate-50",
              "border-cyan-500/50 placeholder-slate-300/50",
              "transition-all duration-200",
              "hover:border-blue-500/70 focus:border-cyan-500/80 focus:outline-none",
              "focus:ring-2 focus:ring-cyan-400/30",
              "focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
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

        <label className="flex cursor-pointer items-center space-x-3 text-slate-200/90">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange("rememberMe")}
            disabled={isLoading}
            className={cn(
              "h-4 w-4 rounded border-2 border-cyan-500/50",
              "bg-transparent text-cyan-500 transition-colors",
              "focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-0",
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
          "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500",
          "text-white shadow-lg shadow-cyan-500/20",
          "hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400",
          "hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/50",
          "disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
      // Set loading state before navigation
      setIsLoading(true);

      // Check for return URL in query params
      const returnUrl = router.query.return as string;
      if (returnUrl && returnUrl !== "/") {
        // Use router.push for smoother client-side navigation
        void router.push(decodeURIComponent(returnUrl));
      } else {
        // Use router.push instead of window.location.href for smoother transition
        void router.push("/dashboard");
      }
    }
  }, [session, status, router.query.return, router]);

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

  // Show loading spinner during session check or while redirecting
  if (status === "loading" || (status === "authenticated" && session?.user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <ActiveConstellationV2Loader size="full" />
      </div>
    );
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
              "rounded-xl border-2 border-cyan-500/50 bg-black/30 backdrop-blur-md",
              "px-8 py-8 text-white shadow-2xl shadow-cyan-900/20",
              "transition-all duration-300"
            )}
          >
            {/* Animated Loader */}
            <div className="mb-6">
              <ActiveConstellationV2Loader size="lg" speed={1} />
            </div>

            {/* Brand Title - Retro console futuristic style, horizontal */}
            <div className="mb-6 text-center">
              <div className="flex items-baseline justify-center gap-3">
                <h1
                  className="text-5xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  SIRIUS
                </h1>
                <h2
                  className="text-3xl font-light tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  SCAN
                </h2>
              </div>
            </div>

            {/* Login Form */}
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={loginError}
            />

            {/* Footer Text */}
            <div className="mt-6 text-center text-xs text-slate-300/60">
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
