import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; direction: "up" | "down" };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, trend, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          {label}
        </div>
        <div className="mt-1.5 text-2xl font-semibold text-brand-text tabular-nums">
          {value}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" ? "text-status-success" : "text-status-danger",
            )}
          >
            {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-mint/30 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
