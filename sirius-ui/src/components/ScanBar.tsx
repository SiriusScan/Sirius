import { useState, useEffect, useRef } from "react";

interface ScanBarProps {
  isScanning: boolean;
  hasRun?: boolean; // Optional prop to indicate if a scan has completed
}

export const ScanBar: React.FC<ScanBarProps> = ({
  isScanning,
  hasRun = false,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const finalTimeRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning) {
      // Start timer when scanning begins
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      // Store final time when scan completes
      if (elapsedTime > 0) {
        finalTimeRef.current = elapsedTime;
      }
      // Only reset elapsed time if we're not preserving the final time
      if (!hasRun) {
        setElapsedTime(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, hasRun]);

  // Format elapsed time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const gradientColors = darkMode
    ? "linear-gradient(90deg, #2c3e50, #4ca1af)"
    : "linear-gradient(90deg, #38bdf8, #0369a1)";

  const getStatusText = () => {
    if (isScanning) {
      return `Scan Time: ${formatTime(elapsedTime)}`;
    }
    if (hasRun) {
      return `Scan Complete - Total Time: ${formatTime(finalTimeRef.current)}`;
    }
    return "Ready to Scan";
  };

  return (
    <div className="relative w-full text-xs text-violet-100/60">
      <div className="mb-2 text-center">{getStatusText()}</div>
      <div className="relative flex h-2 w-full flex-col rounded">
        <div className="absolute inset-0 h-3 rounded bg-violet-400/10"></div>
        <div
          style={{
            background: gradientColors,
            backgroundSize: "200% 100%",
            width: isScanning || hasRun ? "100%" : "0%",
            transition: "width 0.5s ease",
          }}
          className={`absolute h-3 rounded ${
            isScanning ? "scan-animation" : ""
          }`}
        />
      </div>
    </div>
  );
};
