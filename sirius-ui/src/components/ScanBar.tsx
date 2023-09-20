import { useState } from "react";

interface ScanBarProps {
  progress: number;
}

export const ScanBar: React.FC<ScanBarProps> = ({ progress }) => {
  const [darkMode, setDarkMode] = useState(false); // Replace with your dark mode logic if needed.

  const gradientColors = darkMode
    ? "linear-gradient(90deg, #2c3e50, #4ca1af)"
    : "linear-gradient(90deg, #38bdf8, #0369a1)";

  let scanningClass = "scan-animation";
  if (progress === 100) {
    scanningClass = "";
  }

  return (
    <div className="relative w-full text-xs text-violet-100/60">
      <div className="mb-2 text-center">Current Scan: {progress}% Complete</div>
      <div className="relative flex h-2 w-full flex-col rounded">
        <div className="absolute inset-0 h-3 rounded bg-violet-400/10"></div>
        <div
          style={{
            background: `${gradientColors}`,
            backgroundSize: "200% 100%",
            width: `${progress}%`,
            transition: "width 0.5s ease .25s",
          }}
          className={`absolute h-3 rounded ${scanningClass}`}
        />
      </div>
      <div className="mt-3 flex flex-col text-center">8/10 Hosts Scanned</div>
    </div>
  );
};
