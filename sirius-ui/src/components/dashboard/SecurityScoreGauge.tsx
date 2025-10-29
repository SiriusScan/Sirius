import React, { useMemo, useState } from "react";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { Shield, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";

interface SecurityScoreGaugeProps {
  vulnerabilityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    total: number;
  };
  totalHosts: number;
  vulnerableHosts: number;
  totalAgents: number;
  onlineAgents: number;
  className?: string;
}

interface ScoreBreakdown {
  score: number;
  vulnerabilityScore: number;
  hostScore: number;
  agentScore: number;
  details: {
    category: string;
    weight: number;
    value: number;
    score: number;
    description: string;
  }[];
}

const calculateSecurityScore = (
  props: SecurityScoreGaugeProps
): ScoreBreakdown => {
  const {
    vulnerabilityCounts,
    totalHosts,
    vulnerableHosts,
    totalAgents,
    onlineAgents,
  } = props;

  // Weight distribution: Vulnerabilities (60%), Hosts (25%), Agents (15%)
  const weights = {
    vulnerabilities: 0.6,
    hosts: 0.25,
    agents: 0.15,
  };

  // Calculate vulnerability score (0-100, inverse of severity-weighted vulns)
  let vulnScore = 100;
  if (vulnerabilityCounts.total > 0) {
    const weightedVulns =
      vulnerabilityCounts.critical * 10 +
      vulnerabilityCounts.high * 5 +
      vulnerabilityCounts.medium * 2 +
      vulnerabilityCounts.low * 0.5;

    // Normalize to 0-100 (assume 100 weighted vulns = 0 score)
    vulnScore = Math.max(0, 100 - weightedVulns);
  }

  // Calculate host score (percentage of clean hosts)
  const hostScore =
    totalHosts > 0 ? ((totalHosts - vulnerableHosts) / totalHosts) * 100 : 100;

  // Calculate agent score (percentage of online agents)
  const agentScore = totalAgents > 0 ? (onlineAgents / totalAgents) * 100 : 100;

  // Weighted final score
  const finalScore = Math.round(
    vulnScore * weights.vulnerabilities +
      hostScore * weights.hosts +
      agentScore * weights.agents
  );

  return {
    score: finalScore,
    vulnerabilityScore: Math.round(vulnScore),
    hostScore: Math.round(hostScore),
    agentScore: Math.round(agentScore),
    details: [
      {
        category: "Vulnerability Analysis",
        weight: weights.vulnerabilities,
        value: vulnerabilityCounts.total,
        score: Math.round(vulnScore),
        description: `${vulnerabilityCounts.critical} critical, ${vulnerabilityCounts.high} high severity issues`,
      },
      {
        category: "Host Security",
        weight: weights.hosts,
        value: vulnerableHosts,
        score: Math.round(hostScore),
        description: `${vulnerableHosts} of ${totalHosts} hosts have vulnerabilities`,
      },
      {
        category: "Agent Connectivity",
        weight: weights.agents,
        value: onlineAgents,
        score: Math.round(agentScore),
        description: `${onlineAgents} of ${totalAgents} agents are online`,
      },
    ],
  };
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

const getScoreGradient = (score: number): string => {
  if (score >= 85) return "from-green-500 to-emerald-600";
  if (score >= 70) return "from-yellow-500 to-amber-600";
  if (score >= 40) return "from-orange-500 to-red-500";
  return "from-red-600 to-rose-700";
};

const getScoreLabel = (score: number): string => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
};

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = (
  props
) => {
  const { className = "" } = props;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const breakdown = useMemo(() => calculateSecurityScore(props), [props]);
  const { score } = breakdown;

  // Calculate arc parameters for gauge
  const radius = 80;
  const strokeWidth = 12;
  const circumference = radius * Math.PI; // Half circle
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {/* Gauge Visualization */}
        <div className="relative mx-auto">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted opacity-20"
            />

            {/* Score arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                {score >= 85 ? (
                  <>
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </>
                ) : score >= 70 ? (
                  <>
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </>
                ) : score >= 40 ? (
                  <>
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#be123c" />
                  </>
                )}
              </linearGradient>
            </defs>

            {/* Center score */}
            <text
              x="100"
              y="75"
              textAnchor="middle"
              className={`text-4xl font-bold ${getScoreColor(score)}`}
              fill="currentColor"
            >
              {score}
            </text>
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-xs"
              fill="currentColor"
              opacity="0.7"
            >
              {getScoreLabel(score)}
            </text>
          </svg>

          {/* Shield icon */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2">
            <Shield className={`h-5 w-5 ${getScoreColor(score)}`} />
          </div>
        </div>

        {/* Score breakdown button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowBreakdown(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Info className="h-3 w-3" />
            View Score Breakdown
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div
              className={`text-lg font-bold ${getScoreColor(
                breakdown.vulnerabilityScore
              )}`}
            >
              {breakdown.vulnerabilityScore}
            </div>
            <div className="text-xs text-muted-foreground">Vuln</div>
          </div>
          <div>
            <div
              className={`text-lg font-bold ${getScoreColor(
                breakdown.hostScore
              )}`}
            >
              {breakdown.hostScore}
            </div>
            <div className="text-xs text-muted-foreground">Hosts</div>
          </div>
          <div>
            <div
              className={`text-lg font-bold ${getScoreColor(
                breakdown.agentScore
              )}`}
            >
              {breakdown.agentScore}
            </div>
            <div className="text-xs text-muted-foreground">Agents</div>
          </div>
        </div>
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Security Score Breakdown</DialogTitle>
            <DialogDescription>
              Detailed analysis of your security posture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Overall Score */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Overall Security Score
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}/100
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {getScoreLabel(score)} security posture
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="space-y-3">
              {breakdown.details.map((detail, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {detail.category}
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        detail.score
                      )}`}
                    >
                      {detail.score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full bg-gradient-to-r ${getScoreGradient(
                        detail.score
                      )} transition-all duration-500`}
                      style={{ width: `${detail.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{detail.description}</span>
                    <span>Weight: {(detail.weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology */}
            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="font-medium">Scoring Methodology:</div>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Vulnerabilities weighted by severity (60%)</li>
                <li>Percentage of secure hosts (25%)</li>
                <li>Agent connectivity status (15%)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Loading skeleton
export const SecurityScoreGaugeSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-[120px] w-[200px] rounded-full" />
      <Skeleton className="h-4 w-32" />
      <div className="grid w-full grid-cols-3 gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
};
