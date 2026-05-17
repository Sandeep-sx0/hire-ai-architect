import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KanbanColumnProps {
  title: string;
  count: number;
  color?: string;
  children?: ReactNode;
  className?: string;
}

export function KanbanColumn({
  title,
  count,
  color = "var(--brand-primary)",
  children,
  className,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[200px] w-[280px] shrink-0 flex-col rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div
        className="rounded-t-xl border-b border-border px-4 py-3"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-brand-text-secondary">
            {count}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">{children}</div>
    </div>
  );
}
