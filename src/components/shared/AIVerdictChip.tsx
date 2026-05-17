import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type Verdict = "strong_match" | "possible_match" | "weak_match" | "no_match";

export interface AIVerdictChipProps {
  verdict: Verdict;
  expandable?: boolean;
  strengths?: string[];
  gaps?: string[];
  concerns?: string[];
  className?: string;
}

const verdictMap: Record<Verdict, { label: string; bg: string; text: string }> = {
  strong_match: { label: "Strong match", bg: "bg-status-success/15", text: "text-status-success" },
  possible_match: { label: "Possible match", bg: "bg-status-warning/15", text: "text-status-warning" },
  weak_match: { label: "Weak match", bg: "bg-status-neutral/15", text: "text-status-neutral" },
  no_match: { label: "No match", bg: "bg-status-danger/15", text: "text-status-danger" },
};

export function AIVerdictChip({
  verdict,
  expandable,
  strengths = [],
  gaps = [],
  concerns = [],
  className,
}: AIVerdictChipProps) {
  const [open, setOpen] = useState(false);
  const entry = verdictMap[verdict];

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          entry.bg,
          entry.text,
          expandable && "cursor-pointer hover:opacity-90",
        )}
      >
        <Sparkles className="h-3 w-3" />
        {entry.label}
        {expandable && (
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {expandable && open && (
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {strengths.map((s) => (
            <span key={s} className="rounded-md bg-status-success/10 px-2 py-0.5 text-[11px] text-status-success">
              + {s}
            </span>
          ))}
          {gaps.map((g) => (
            <span key={g} className="rounded-md bg-status-warning/10 px-2 py-0.5 text-[11px] text-status-warning">
              ~ {g}
            </span>
          ))}
          {concerns.map((c) => (
            <span key={c} className="rounded-md bg-status-danger/10 px-2 py-0.5 text-[11px] text-status-danger">
              ! {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
