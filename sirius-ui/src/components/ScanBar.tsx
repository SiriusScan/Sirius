import { useState, useEffect, useRef } from "react";
import { SEVERITY_COLORS } from "~/utils/severityTheme";

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
      return `linear-gradient(90deg, ${SEVERITY_COLORS.critical.hex}, ${SEVERITY_COLORS.critical.hex})`; // Red for cancelled
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

  const isActive = isScanning || isCancelling;

  return (
    <div className="relative w-full min-w-[200px]">
      <div
        className={`mb-1.5 text-center text-sm font-medium tracking-wide ${
          isActive
            ? "text-violet-100"
            : "text-violet-100/60"
        }`}
      >
        {getStatusText()}
      </div>
      <div
        className={`relative h-2.5 w-full overflow-hidden rounded-full ${
          isActive ? "shadow-[0_0_12px_rgba(56,189,248,0.3)]" : ""
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-violet-400/15"></div>
        <div
          style={{
            backgroundImage: gradientColors,
            backgroundSize: "200% 100%",
            width: isActive || hasRun || wasCancelled ? "100%" : "0%",
            transition: "width 0.5s ease",
          }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            isActive ? "scan-animation" : ""
          }`}
        />
      </div>
      <div className="mt-1 flex justify-center">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-400/80">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"></span>
            In Progress
          </span>
        ) : wasCancelled ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400"></span>
            Cancelled
          </span>
        ) : hasRun ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-violet-400/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400/40"></span>
            Idle
          </span>
        )}
      </div>
    </div>
  );
};
