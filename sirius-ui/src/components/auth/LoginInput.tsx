import React from "react";
import { cn } from "~/components/lib/utils";

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isLoading?: boolean;
}

/**
 * Reusable input component for authentication forms
 * Follows the established design patterns of the Sirius UI
 */
export const LoginInput: React.FC<LoginInputProps> = ({
  label,
  error,
  isLoading = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-[#9a8686]/80"
      >
        {label}
      </label>
      <input
        id={inputId}
        disabled={isLoading}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={error ? "true" : "false"}
        className={cn(
          "w-full rounded-lg border-2 bg-transparent px-4 py-3 text-lg text-violet-100",
          "border-[#f7c1ac]/50 placeholder-[#9a8686]/50",
          "transition-all duration-200",
          "hover:border-[#e88d7c]/70 focus:border-violet-500/60 focus:outline-none",
          "focus:ring-2 focus:ring-violet-500/20",
          error && "border-red-500/50 focus:border-red-500/70",
          isLoading && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      />
      {error && (
        <div
          id={`${inputId}-error`}
          role="alert"
          className="text-sm text-red-400"
        >
          {error}
        </div>
      )}
    </div>
  );
};

interface LoginCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isLoading?: boolean;
}

/**
 * Reusable checkbox component for authentication forms
 */
export const LoginCheckbox: React.FC<LoginCheckboxProps> = ({
  label,
  isLoading = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="flex cursor-pointer items-center space-x-3 text-[#9a8686]/90">
      <input
        id={inputId}
        type="checkbox"
        disabled={isLoading}
        className={cn(
          "h-4 w-4 rounded border-2 border-[#f7c1ac]/50",
          "bg-transparent text-violet-500 transition-colors",
          "focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0",
          "cursor-pointer disabled:opacity-50",
          className
        )}
        {...props}
      />
      <span className="select-none text-sm">{label}</span>
    </label>
  );
};
