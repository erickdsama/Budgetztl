"use client";

import type { MonthData } from "@/app/history/actions";

const MONTH_ABBR = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

interface MonthlyBalanceChartProps {
  months: MonthData[];
  currency: string;
}

function formatCompact(amount: number, currency: string): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}${abs.toFixed(0)}`;
}

export function MonthlyBalanceChart({ months, currency }: MonthlyBalanceChartProps) {
  if (months.length === 0) return null;

  // Sort chronologically (oldest left to newest right)
  const sorted = [...months].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const PADDING_TOP = 24;
  const PADDING_BOTTOM = 32; // space for x-axis labels
  const PADDING_X = 16;
  const MIN_MONTH_WIDTH = 48;
  const HEIGHT = 160;
  const CHART_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const totalWidth = Math.max(sorted.length * MIN_MONTH_WIDTH, 300);
  const stepX = totalWidth / Math.max(sorted.length - 1, 1);

  const closingBalances = sorted.map((m) => m.closing_balance);
  const minVal = Math.min(0, ...closingBalances);
  const maxVal = Math.max(0, ...closingBalances);
  const range = maxVal - minVal || 1;

  function toY(value: number): number {
    return PADDING_TOP + CHART_HEIGHT - ((value - minVal) / range) * CHART_HEIGHT;
  }

  const zeroY = toY(0);

  // Build point coordinates
  const points = sorted.map((m, i) => ({
    x: PADDING_X + i * stepX,
    y: toY(m.closing_balance),
    balance: m.closing_balance,
    month: m.month,
    year: m.year,
    isPositive: m.closing_balance >= 0,
  }));

  // Build polyline path
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Build filled area path (split by positive/negative regions)
  const areaPathPositive = buildAreaPath(points, zeroY, true);
  const areaPathNegative = buildAreaPath(points, zeroY, false);

  const lastPoint = points[points.length - 1];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-outline/50 px-2">
        Balance Over Time
      </p>
      <div className="overflow-x-auto rounded-3xl bg-surface-container-lowest">
        <div style={{ minWidth: totalWidth + PADDING_X * 2 }}>
          <svg
            width={totalWidth + PADDING_X * 2}
            height={HEIGHT}
            viewBox={`0 0 ${totalWidth + PADDING_X * 2} ${HEIGHT}`}
            className="block"
          >
            {/* Zero baseline */}
            <line
              x1={PADDING_X}
              y1={zeroY}
              x2={totalWidth + PADDING_X}
              y2={zeroY}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
              className="text-outline/20"
            />

            {/* Positive area fill */}
            {areaPathPositive && (
              <path
                d={areaPathPositive}
                className="fill-primary/15"
              />
            )}

            {/* Negative area fill */}
            {areaPathNegative && (
              <path
                d={areaPathNegative}
                className="fill-error/15"
              />
            )}

            {/* Line */}
            <polyline
              points={polyline}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === points.length - 1 ? 4 : 3}
                className={p.isPositive ? "fill-primary" : "fill-error"}
              />
            ))}

            {/* Latest point label */}
            {lastPoint && (
              <text
                x={lastPoint.x}
                y={lastPoint.y - 8}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                className={`fill-current ${lastPoint.isPositive ? "text-primary" : "text-error"}`}
              >
                {formatCompact(lastPoint.balance, currency)}
              </text>
            )}

            {/* X-axis labels */}
            {points.map((p, i) => (
              <text
                key={`label-${i}`}
                x={p.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize={9}
                className="fill-current text-outline/50"
              >
                {MONTH_ABBR[p.month]}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function buildAreaPath(
  points: Array<{ x: number; y: number; balance: number }>,
  zeroY: number,
  positive: boolean
): string {
  if (points.length < 2) return "";

  // Clip each point's y to zeroY for positive/negative separation
  const clipped = points.map((p) => {
    if (positive) {
      return { x: p.x, y: p.balance >= 0 ? p.y : zeroY };
    } else {
      return { x: p.x, y: p.balance <= 0 ? p.y : zeroY };
    }
  });

  const top = clipped.map((p) => `${p.x},${p.y}`).join(" ");
  const first = clipped[0];
  const last = clipped[clipped.length - 1];

  return `M ${first.x},${zeroY} L ${top} L ${last.x},${zeroY} Z`;
}
