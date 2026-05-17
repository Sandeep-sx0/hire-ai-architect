import { cn } from "@/lib/utils";

export interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { px: 32, stroke: 3, font: "text-[10px]" },
  md: { px: 48, stroke: 4, font: "text-xs" },
  lg: { px: 64, stroke: 5, font: "text-sm" },
};

export function ScoreRing({ score, size = "md", className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { px, stroke, font } = sizes[size];
  const color =
    clamped < 50 ? "var(--status-danger)" : clamped < 75 ? "var(--status-warning)" : "var(--status-success)";
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn("absolute font-semibold tabular-nums", font)}
        style={{ color }}
      >
        {clamped}
      </span>
    </div>
  );
}
