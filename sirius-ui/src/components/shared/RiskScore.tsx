/**
 * RiskScore — shows a 0–10 risk score from the API and its band (ADR-3:
 * 9+ critical, 7+ high, 4+ medium, above 0 low, 0 none). It never computes
 * the score; it only names the band of the number it is given.
 *
 * - "lg" / "md": a ring gauge with the score, plus "Risk score" and the band
 *   ("High") beside it, coloured by band.
 * - "sm": inline "8.1 High" for tables and host cells.
 *
 * A missing score (null, undefined, NaN) shows "—".
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import { riskBand, riskBandLabel, type RiskBand } from "~/utils/riskBand";
import { severityColors } from "./severity";

export type RiskScoreSize = "sm" | "md" | "lg";

export interface RiskScoreProps {
  /** 0–10, from the API. */
  score: number | null | undefined;
  size?: RiskScoreSize;
  /** Hide the "Risk score / High" text beside the ring (md, lg). */
  hideLabel?: boolean;
  /** A line under the band, e.g. "Highest CVSS among 162 open findings". */
  caption?: React.ReactNode;
  className?: string;
}

const NONE_TEXT = "text-gray-400";
const NONE_HEX = "#4b5563"; // gray-600: no band, not a severity colour

function bandText(band: RiskBand): string {
  return band === "none" ? NONE_TEXT : severityColors(band).text;
}

function bandHex(band: RiskBand): string {
  return band === "none" ? NONE_HEX : severityColors(band).hex;
}

const RING = {
  md: { box: 44, stroke: 4, text: "text-sm" },
  lg: { box: 64, stroke: 5, text: "text-lg" },
} as const;

export function RiskScore({ score, size = "md", hideLabel = false, caption, className }: RiskScoreProps) {
  const known = typeof score === "number" && Number.isFinite(score);
  const value = known ? Math.min(Math.max(score, 0), 10) : 0;
  const band = known ? riskBand(value) : "none";
  const label = known ? riskBandLabel(band) : "No score";
  const display = known ? value.toFixed(1) : "—";
  const description = known ? `Risk score ${display}, ${label}` : "No risk score";

  if (size === "sm") {
    return (
      <span
        className={cn("inline-flex items-baseline gap-1 whitespace-nowrap text-xs", className)}
        title={description}
      >
        <span className={cn("font-semibold tabular-nums", bandText(band))}>{display}</span>
        {known && <span className="text-gray-400">{label}</span>}
      </span>
    );
  }

  const ring = RING[size];
  const r = (ring.box - ring.stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (value / 10) * circumference;

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        className="relative shrink-0"
        style={{ width: ring.box, height: ring.box }}
        role="img"
        aria-label={description}
      >
        <svg
          width={ring.box}
          height={ring.box}
          viewBox={`0 0 ${ring.box} ${ring.box}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={ring.box / 2}
            cy={ring.box / 2}
            r={r}
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeOpacity={0.45}
            strokeWidth={ring.stroke}
          />
          {filled > 0 && (
            <circle
              cx={ring.box / 2}
              cy={ring.box / 2}
              r={r}
              fill="none"
              stroke={bandHex(band)}
              strokeWidth={ring.stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              style={{ transition: "stroke-dasharray 0.6s ease-out" }}
            />
          )}
        </svg>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
            ring.text,
            bandText(band),
          )}
        >
          {display}
        </span>
      </div>
      {!hideLabel && (
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Risk score</div>
          <div className={cn("font-semibold leading-tight", size === "lg" ? "text-base" : "text-sm", bandText(band))}>
            {label}
          </div>
          {caption && <div className="mt-0.5 text-xs text-gray-400">{caption}</div>}
        </div>
      )}
    </div>
  );
}

export default RiskScore;
