import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the terminal component with SSR disabled and optimized loading
const DynamicTerminal = dynamic(() => import("./DynamicTerminal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#1e1e2e]">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-[#cdd6f4]">Loading Terminal...</p>
      </div>
    </div>
  ),
});

// Preload the component to improve perceived performance
if (typeof window !== "undefined") {
  const preloadTerminal = () => import("./DynamicTerminal");
  // Preload after a short delay to not block initial page load
  setTimeout(preloadTerminal, 100);
}

export default function TerminalWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-[#1e1e2e]">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-[#cdd6f4]">Loading Terminal...</p>
          </div>
        </div>
      }
    >
      <DynamicTerminal />
    </Suspense>
  );
}
