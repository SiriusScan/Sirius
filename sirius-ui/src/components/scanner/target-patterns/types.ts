// Shared types for target input patterns
import { type ParsedTarget } from "~/utils/targetParser";

export interface PatternProps {
  onTargetsChange: (targets: ParsedTarget[]) => void;
  initialTargets?: ParsedTarget[];
}

export interface PatternComponentProps extends PatternProps {
  patternName: string;
  patternDescription: string;
}

