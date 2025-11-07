import React from "react";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface LoaderWrapperProps {
  size?: LoaderSize;
  speed?: number;
  className?: string;
  label?: string;
  children: React.ReactNode;
}

const sizeMap: Record<LoaderSize, string> = {
  xs: "w-4 h-4", // 16px - inline/button
  sm: "w-6 h-6", // 24px - inline
  md: "w-12 h-12", // 48px - component
  lg: "w-24 h-24", // 96px - modal/card
  xl: "w-40 h-40", // 160px - full-page
  full: "w-60 h-60", // 240px - splash screen
};

/**
 * LoaderWrapper - Base component for all Sirius loaders
 * Provides consistent sizing, accessibility, and reduced motion support
 */
export const LoaderWrapper: React.FC<LoaderWrapperProps> = ({
  size = "md",
  speed = 1,
  className = "",
  label = "Loading",
  children,
}) => {
  const sizeClass = sizeMap[size];

  // Apply animation speed via CSS custom property
  const style = {
    "--loader-speed": `${speed}`,
  } as React.CSSProperties;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
      aria-live="polite"
      style={style}
    >
      <div className={`${sizeClass} relative flex items-center justify-center`}>
        {children}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoaderWrapper;




