import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the terminal component with SSR disabled
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
