// src/components/scanner/ScanForm.tsx
import React, { useCallback } from "react";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";

interface ScanFormProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  targetList: string[];
  addTarget: (newTarget: string) => void;
  startScan: () => void;
}

const ScanForm: React.FC<ScanFormProps> = ({
  inputValue,
  setInputValue,
  targetList,
  addTarget,
  startScan,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTarget(inputValue);
        setInputValue("");
      }
    },
    [addTarget, inputValue, setInputValue]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="flex">
        <Input
          placeholder="Add Target"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="h-12 w-72 max-w-md rounded-l-md rounded-r-none border-violet-100/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0"
          aria-label="Add target"
        />
        <Button
          variant="outline"
          className="h-12 rounded-none border-r-0 border-violet-100/30 bg-violet-500"
          onClick={() => addTarget(inputValue)}
          aria-label="Add target"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-l-none rounded-r-md border-l-0 border-violet-100/30 bg-violet-500 text-violet-100"
          onClick={startScan}
          aria-label="Start scan"
        >
          Start Scan
        </Button>
      </div>
      <div className="flex w-72 flex-col">
        <span className="border-violet-100/40 text-sm text-violet-100/80">
          Target List
        </span>
        <div>
          {targetList.map((target) => (
            <Badge
              key={target}
              className="mb-1 mr-2 bg-violet-200 font-mono font-light"
            >
              {target}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// Wrap in React.memo to avoid unnecessary re-renders.
export default React.memo(ScanForm);