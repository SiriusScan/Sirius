import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the new OperatorConsole with SSR disabled
const OperatorConsole = dynamic(
  () => import("./console/OperatorConsole"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Loading Console...</p>
        </div>
      </div>
    ),
  }
);

// Preload the component to improve perceived performance
if (typeof window !== "undefined") {
  const preloadConsole = () => import("./console/OperatorConsole");
  setTimeout(preloadConsole, 100);
}

export default function TerminalWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="text-sm text-gray-400">Loading Console...</p>
          </div>
        </div>
      }
    >
      <OperatorConsole />
    </Suspense>
  );
}
