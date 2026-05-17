import { cn } from "@/lib/utils";

type StatusKind =
  | "active"
  | "placed"
  | "interested"
  | "open"
  | "sourcing"
  | "warmup"
  | "in_progress"
  | "rejected"
  | "do_not_contact"
  | "not_interested"
  | "closed"
  | "on_hold"
  | "archived"
  | "submitted"
  | "submitted_to_client"
  | "info"
  | "needs_review"
  | "shortlisted"
  | "ai_generated"
  | "draft"
  | "interviewing"
  | "offer"
  | "applied"
  | "screening"
  | "completed"
  | "paused"
  | "out_of_office"
  | "referral"
  | "other";

const map: Record<StatusKind, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-status-success/15", text: "text-status-success", label: "Active" },
  placed: { bg: "bg-status-success/15", text: "text-status-success", label: "Placed" },
  interested: { bg: "bg-status-success/15", text: "text-status-success", label: "Interested" },
  completed: { bg: "bg-status-success/15", text: "text-status-success", label: "Completed" },
  open: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Open" },
  sourcing: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Sourcing" },
  warmup: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Warmup" },
  in_progress: { bg: "bg-status-warning/15", text: "text-status-warning", label: "In progress" },
  interviewing: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Interviewing" },
  offer: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Offer" },
  paused: { bg: "bg-status-warning/15", text: "text-status-warning", label: "Paused" },
  rejected: { bg: "bg-status-danger/15", text: "text-status-danger", label: "Rejected" },
  do_not_contact: { bg: "bg-status-danger/15", text: "text-status-danger", label: "Do not contact" },
  not_interested: { bg: "bg-status-danger/15", text: "text-status-danger", label: "Not interested" },
  closed: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "Closed" },
  on_hold: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "On hold" },
  archived: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "Archived" },
  draft: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "Draft" },
  out_of_office: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "Out of office" },
  other: { bg: "bg-status-neutral/15", text: "text-status-neutral", label: "Other" },
  submitted: { bg: "bg-status-info/15", text: "text-status-info", label: "Submitted" },
  submitted_to_client: { bg: "bg-status-info/15", text: "text-status-info", label: "Submitted" },
  info: { bg: "bg-status-info/15", text: "text-status-info", label: "Info" },
  needs_review: { bg: "bg-status-info/15", text: "text-status-info", label: "Needs review" },
  applied: { bg: "bg-status-info/15", text: "text-status-info", label: "Applied" },
  screening: { bg: "bg-status-info/15", text: "text-status-info", label: "Screening" },
  referral: { bg: "bg-status-info/15", text: "text-status-info", label: "Referral" },
  shortlisted: { bg: "bg-status-ai/15", text: "text-status-ai", label: "Shortlisted" },
  ai_generated: { bg: "bg-status-ai/15", text: "text-status-ai", label: "AI generated" },
};

export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function StatusBadge({ status, size = "md", label, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/[\s-]/g, "_") as StatusKind;
  const entry = map[key] ?? map.other;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        entry.bg,
        entry.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        className,
      )}
    >
      {label ?? entry.label}
    </span>
  );
}
