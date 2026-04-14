"use client";

interface RingChartProps {
  percentage: number;
  status: "under_budget" | "over_budget" | "on_track";
  size?: "sm" | "lg";
}

export function RingChart({ percentage, status, size = "sm" }: RingChartProps) {
  const capped = Math.min(percentage, 100);
  const isOver = status === "over_budget";

  // Track and fill colors by status
  const trackColor = isOver ? "text-error/15" : "text-primary/15";
  const fillColor = isOver ? "text-error" : "text-primary";
  const textColor = isOver ? "text-error" : "text-primary";

  // Over-budget: full ring (100), normal: actual percentage
  const dashArray = isOver ? "100, 100" : `${capped}, 100`;
  // Over-budget ring is slightly thicker to match reference
  const strokeWidth = isOver ? "2" : "1.5";

  if (size === "lg") {
    return (
      <div className="relative h-20 w-20 shrink-0">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 36 36"
        >
          {/* Track */}
          <path
            className={`stroke-current ${trackColor}`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="1.5"
          />
          {/* Fill */}
          <path
            className={`stroke-current ${fillColor}`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeDasharray={dashArray}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isOver ? (
            <span className={`material-symbols-outlined text-sm font-bold ${textColor}`}>
              priority_high
            </span>
          ) : (
            <span className={`text-[10px] font-bold ${textColor}`}>
              {capped}%
            </span>
          )}
        </div>
      </div>
    );
  }

  // Small size (collapsed cards)
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 36 36"
      >
        {/* Track */}
        <path
          className={`stroke-current ${trackColor}`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="1.5"
        />
        {/* Fill */}
        <path
          className={`stroke-current ${fillColor}`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isOver ? (
          <span className={`material-symbols-outlined text-xs font-bold ${textColor}`}>
            priority_high
          </span>
        ) : (
          <span className={`text-[9px] font-bold ${textColor}`}>
            {capped}%
          </span>
        )}
      </div>
    </div>
  );
}
