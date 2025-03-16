import React from "react";

export type ScannerType = "general" | "nmap" | "rustscan";

interface ScannerNavigationProps {
  activeScanner: ScannerType;
  setActiveScanner: (scanner: ScannerType) => void;
}

const ScannerNavigation: React.FC<ScannerNavigationProps> = ({
  activeScanner,
  setActiveScanner,
}) => {
  return (
    <div className="w-48 flex-shrink-0">
      <div className="flex flex-col space-y-1">
        <button
          className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
            activeScanner === "general"
              ? "bg-violet-600/20 text-white"
              : "text-gray-400 hover:bg-violet-600/10"
          }`}
          onClick={() => setActiveScanner("general")}
        >
          General
        </button>
        <button
          className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
            activeScanner === "nmap"
              ? "bg-violet-600/20 text-white"
              : "text-gray-400 hover:bg-violet-600/10"
          }`}
          onClick={() => setActiveScanner("nmap")}
        >
          NMAP
        </button>
        <button
          className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
            activeScanner === "rustscan"
              ? "bg-violet-600/20 text-white"
              : "text-gray-400 hover:bg-violet-600/10"
          }`}
          onClick={() => setActiveScanner("rustscan")}
        >
          RustScan
        </button>
      </div>
    </div>
  );
};

export default ScannerNavigation; 