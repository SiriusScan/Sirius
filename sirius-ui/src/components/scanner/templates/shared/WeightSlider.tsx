import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Slider } from "~/components/lib/ui/slider";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/lib/ui/popover";

interface WeightSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  helperText?: string;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({
  value,
  onChange,
  label = "Confidence Weight",
  helperText,
}) => {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-200">{label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-300"
              >
                <Info className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-gray-700 bg-gray-800 text-sm text-gray-300">
              <p className="font-semibold">Confidence Weight</p>
              <p className="mt-1">
                {helperText ||
                  "Higher weights indicate more confidence in this detection step. Affects the overall confidence score of the template."}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                <p>• 1.0 = Highly confident (definitive indicator)</p>
                <p>• 0.5-0.9 = Moderately confident</p>
                <p>• 0.1-0.4 = Low confidence (supportive evidence)</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-violet-400">
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">({percentage}%)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue ?? 0.5)}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.0</span>
          <span>0.5</span>
          <span>1.0</span>
        </div>
      </div>

      {/* Visual confidence indicator */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

