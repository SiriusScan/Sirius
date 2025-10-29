import React, { useCallback } from "react";
import { type ParsedTarget } from "~/utils/targetParser";
import ChipInputPattern from "./ChipInputPattern";
import SplitPanePattern from "./SplitPanePattern";
import AccordionPattern from "./AccordionPattern";
import CardGridPattern from "./CardGridPattern";
import TablePattern from "./TablePattern";

interface TargetInputShowcaseProps {
  onTargetsChange: (targets: ParsedTarget[]) => void;
}

const TargetInputShowcase: React.FC<TargetInputShowcaseProps> = ({
  onTargetsChange,
}) => {
  // Each pattern manages its own targets independently for showcase purposes
  // In production, you'd pick one pattern and use it exclusively

  const handlePatternAChange = useCallback(
    (targets: ParsedTarget[]) => {
      console.log("Pattern A targets:", targets);
      onTargetsChange(targets);
    },
    [onTargetsChange]
  );

  const handlePatternBChange = useCallback(
    (targets: ParsedTarget[]) => {
      console.log("Pattern B targets:", targets);
      onTargetsChange(targets);
    },
    [onTargetsChange]
  );

  const handlePatternCChange = useCallback(
    (targets: ParsedTarget[]) => {
      console.log("Pattern C targets:", targets);
      onTargetsChange(targets);
    },
    [onTargetsChange]
  );

  const handlePatternDChange = useCallback(
    (targets: ParsedTarget[]) => {
      console.log("Pattern D targets:", targets);
      onTargetsChange(targets);
    },
    [onTargetsChange]
  );

  const handlePatternEChange = useCallback(
    (targets: ParsedTarget[]) => {
      console.log("Pattern E targets:", targets);
      onTargetsChange(targets);
    },
    [onTargetsChange]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-purple-600/5 p-6 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Target Input Pattern Showcase
        </h2>
        <p className="text-sm text-violet-200">
          Explore 5 different design patterns for target input. Each pattern is
          fully functional. Test them all to see which one you prefer!
        </p>
        <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-violet-300">
          <strong>Note:</strong> Each pattern maintains its own state
          independently in this showcase. In production, you would choose one
          pattern and it would integrate with the main scan flow.
        </div>
      </div>

      {/* Pattern A */}
      <div className="rounded-xl border-2 border-violet-500/40 bg-gray-900/30 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pattern A: Email-Style Chip Input
            </h3>
            <p className="text-xs text-gray-400">
              Compact, familiar, efficient for small-medium lists
            </p>
          </div>
          <div className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
            Pattern 1 of 5
          </div>
        </div>
        <ChipInputPattern
          onTargetsChange={handlePatternAChange}
          initialTargets={[]}
        />
      </div>

      {/* Pattern B */}
      <div className="rounded-xl border-2 border-blue-500/40 bg-gray-900/30 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pattern B: Split Pane with Action Bar
            </h3>
            <p className="text-xs text-gray-400">
              Input on left, validated list on right with filters
            </p>
          </div>
          <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            Pattern 2 of 5
          </div>
        </div>
        <SplitPanePattern
          onTargetsChange={handlePatternBChange}
          initialTargets={[]}
        />
      </div>

      {/* Pattern C */}
      <div className="rounded-xl border-2 border-purple-500/40 bg-gray-900/30 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pattern C: Accordion Progressive Disclosure
            </h3>
            <p className="text-xs text-gray-400">
              Collapsed by default, three-tier disclosure
            </p>
          </div>
          <div className="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
            Pattern 3 of 5
          </div>
        </div>
        <AccordionPattern
          onTargetsChange={handlePatternCChange}
          initialTargets={[]}
        />
      </div>

      {/* Pattern D */}
      <div className="rounded-xl border-2 border-pink-500/40 bg-gray-900/30 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pattern D: Card Grid with Drag-Drop Zone
            </h3>
            <p className="text-xs text-gray-400">
              Visual upload-first design, cards in grid layout
            </p>
          </div>
          <div className="rounded-full bg-pink-600 px-3 py-1 text-xs font-medium text-white">
            Pattern 4 of 5
          </div>
        </div>
        <CardGridPattern
          onTargetsChange={handlePatternDChange}
          initialTargets={[]}
        />
      </div>

      {/* Pattern E */}
      <div className="rounded-xl border-2 border-indigo-500/40 bg-gray-900/30 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pattern E: Table-Style with Inline Editing
            </h3>
            <p className="text-xs text-gray-400">
              Spreadsheet-like for power users, sortable and editable
            </p>
          </div>
          <div className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
            Pattern 5 of 5
          </div>
        </div>
        <TablePattern
          onTargetsChange={handlePatternEChange}
          initialTargets={[]}
        />
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-purple-600/5 p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-white">
          Which pattern do you prefer?
        </h3>
        <p className="text-sm text-violet-200">
          Try adding, editing, and removing targets in each pattern. Pay
          attention to how each one feels to use. Once you've decided, let me
          know which pattern you'd like to keep, and I'll integrate it into the
          main scanner interface!
        </p>
      </div>
    </div>
  );
};

export default TargetInputShowcase;

