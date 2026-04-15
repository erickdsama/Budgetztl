"use client";

import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";
import type { DashboardCategory } from "@/app/dashboard/actions";

const SEGMENT_COLORS = [
  "#475f8a", // primary blue
  "#7c9fd4", // light blue
  "#675882", // tertiary purple
  "#4caf82", // emerald green
  "#e8a844", // amber
  "#e87044", // orange
  "#e85454", // red
  "#6bbfbf", // teal
];

interface CategoryDonutChartProps {
  categories: DashboardCategory[];
  currency: string;
}

type Segment = {
  path: string;
  labelX: number;
  labelY: number;
};

function buildSegments(
  categories: DashboardCategory[],
  total: number,
  cx: number,
  cy: number,
  r: number,
  innerR: number
): Segment[] {
  let currentAngle = -Math.PI / 2; // start at top
  return categories.map((cat) => {
    const fraction = cat.spent / total;
    const angle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    const midAngle = startAngle + angle / 2;
    const labelR = (r + innerR) / 2;
    const labelX = cx + labelR * Math.cos(midAngle);
    const labelY = cy + labelR * Math.sin(midAngle);

    return { path, labelX, labelY };
  });
}

export function CategoryDonutChart({ categories, currency }: CategoryDonutChartProps) {
  const t = useTranslation();

  const activeCategories = categories.filter((c) => c.spent > 0);
  const totalSpent = activeCategories.reduce((sum, c) => sum + c.spent, 0);

  if (activeCategories.length === 0) return null;

  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 36;

  const segments = buildSegments(activeCategories, totalSpent, cx, cy, r, innerR);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between px-1">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-widest text-secondary opacity-70 uppercase">
            {t.categories.setup}
          </p>
          <h2 className="font-heading text-2xl font-extrabold tracking-tighter text-on-surface">
            {t.dashboard.byCategory}
          </h2>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-6 border border-white/50 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* SVG Donut */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.path}
                  fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              {/* Inner circle mask */}
              <circle cx={cx} cy={cy} r={innerR} fill="white" />
              {/* Center label */}
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="10"
                fontWeight="600"
              >
                {t.transaction.expense}
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fill="#111827"
                fontSize="11"
                fontWeight="800"
              >
                {formatCurrency(totalSpent, currency)}
              </text>
            </svg>

            {/* Percentage labels on segments */}
            {segments.map((seg, i) => {
              const pct = Math.round((activeCategories[i].spent / totalSpent) * 100);
              if (pct < 8) return null;
              return (
                <div
                  key={i}
                  className="absolute text-[9px] font-black text-white pointer-events-none"
                  style={{ left: seg.labelX - 8, top: seg.labelY - 6 }}
                >
                  {pct}%
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-y-2">
            {activeCategories.map((cat, i) => {
              const pct = Math.round((cat.spent / totalSpent) * 100);
              return (
                <div key={cat.id} className="flex items-center gap-2 min-w-[130px]">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  />
                  <span className="text-xs text-on-surface-variant truncate flex-1">
                    {cat.name}
                  </span>
                  <span className="text-xs font-bold text-on-surface">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
