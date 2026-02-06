import { useState, useEffect, useRef } from "react";

interface ScanBarProps {
  isScanning: boolean;
  hasRun?: boolean; // Optional prop to indicate if a scan has completed
  isCancelling?: boolean; // Optional prop to indicate scan is being cancelled
  wasCancelled?: boolean; // Optional prop to indicate scan was cancelled
}

export const ScanBar: React.FC<ScanBarProps> = ({
  isScanning,
  hasRun = false,
  isCancelling = false,
  wasCancelled = false,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const finalTimeRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning || isCancelling) {
      // Start/continue timer when scanning or cancelling
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      // Store final time when scan completes or is cancelled
      if (elapsedTime > 0) {
        finalTimeRef.current = elapsedTime;
      }
      // Only reset elapsed time if we're not preserving the final time
      if (!hasRun && !wasCancelled) {
        setElapsedTime(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, isCancelling, hasRun, wasCancelled]);

  // Format elapsed time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Define gradient colors based on state
  const getGradientColors = () => {
    if (isCancelling) {
      return "linear-gradient(90deg, #f59e0b, #d97706)"; // Orange/amber for cancelling
    }
    if (wasCancelled) {
      return "linear-gradient(90deg, #ef4444, #dc2626)"; // Red for cancelled
    }
    return darkMode
      ? "linear-gradient(90deg, #2c3e50, #4ca1af)"
      : "linear-gradient(90deg, #38bdf8, #0369a1)";
  };

  const gradientColors = getGradientColors();

  const getStatusText = () => {
    if (isCancelling) {
      return `Stopping Scan... (${formatTime(elapsedTime)})`;
    }
    if (wasCancelled) {
      return `Scan Cancelled - Time: ${formatTime(finalTimeRef.current)}`;
    }
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
            width: isScanning || isCancelling || hasRun || wasCancelled ? "100%" : "0%",
            transition: "width 0.5s ease",
          }}
          className={`absolute h-3 rounded ${
            isScanning || isCancelling ? "scan-animation" : ""
          }`}
        />
      </div>
    </div>
  );
};
