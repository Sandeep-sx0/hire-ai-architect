import { AlertTriangle, Linkedin, Mail, User2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ParsedCandidate } from "./CandidateReviewForm";

export type DedupRule = "linkedin" | "email" | "fuzzy_name_company";
export type DedupAction = "keep_existing" | "keep_new" | "keep_both" | "skip";

export interface DuplicateMatch {
  rule: DedupRule;
  confidence: number; // 0–1
  existing: ParsedCandidate & { id: string; added: string };
  incoming: ParsedCandidate;
}

const ruleCopy: Record<DedupRule, { icon: typeof Linkedin; label: string; tone: string }> = {
  linkedin: { icon: Linkedin, label: "Exact LinkedIn URL match", tone: "text-status-info" },
  email: { icon: Mail, label: "Exact email address match", tone: "text-status-info" },
  fuzzy_name_company: {
    icon: User2,
    label: "Fuzzy match on name + current company",
    tone: "text-status-warning",
  },
};

const FIELDS: { key: keyof ParsedCandidate; label: string }[] = [
  { key: "full_name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "current_title", label: "Current title" },
  { key: "current_company", label: "Current company" },
  { key: "location", label: "Location" },
  { key: "total_experience_years", label: "Years experience" },
  { key: "seniority_level", label: "Seniority" },
  { key: "source", label: "Source" },
];

function fmt(v: unknown) {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  return String(v);
}

export interface DuplicateDetectionDialogProps {
  open: boolean;
  match: DuplicateMatch | null;
  onResolve: (action: DedupAction) => void;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateDetectionDialog({
  open,
  match,
  onResolve,
  onOpenChange,
}: DuplicateDetectionDialogProps) {
  if (!match) return null;
  const rule = ruleCopy[match.rule];
  const RuleIcon = rule.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] w-[860px] p-0 gap-0 rounded-2xl overflow-hidden max-h-[88vh] flex flex-col">
        <DialogHeader className="border-b border-gray-100 px-6 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
            </div>
            <DialogTitle className="text-[17px] font-semibold text-brand-text">
              Possible duplicate candidate
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px] text-brand-text-secondary flex items-center gap-2">
            <RuleIcon className={cn("h-3.5 w-3.5", rule.tone)} />
            <span>
              Matched rule: <span className="font-medium text-brand-text">{rule.label}</span>
            </span>
            <Badge variant="outline" className="text-[11px]">
              {Math.round(match.confidence * 100)}% confidence
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-0 overflow-y-auto">
          <ColumnHeader label="Existing record" sub={`Added ${match.existing.added}`} tone="existing" />
          <ColumnHeader label="Incoming record" sub={match.incoming.source ?? "New import"} tone="incoming" />

          {FIELDS.map((f) => {
            const ev = fmt(match.existing[f.key]);
            const iv = fmt(match.incoming[f.key]);
            const diff = ev !== iv;
            return (
              <div key={f.key} className="contents">
                <CellSide value={ev} label={f.label} diff={diff} side="existing" />
                <CellSide value={iv} label={f.label} diff={diff} side="incoming" />
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-brand-bg/40">
          <p className="text-[12px] text-brand-text-secondary mb-3">
            Recruiter always confirms — no automatic merge. Pick how to resolve this match.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolve("keep_existing")}
            >
              Keep existing, discard new
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolve("keep_new")}
            >
              Replace with new
            </Button>
            <Button
              size="sm"
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => onResolve("keep_both")}
            >
              Keep both as separate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => onResolve("skip")}
            >
              Decide later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColumnHeader({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "existing" | "incoming";
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 px-5 py-3 border-b border-gray-100 backdrop-blur bg-card/95",
        tone === "incoming" && "border-l border-l-gray-100",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            tone === "existing" ? "bg-brand-text-secondary" : "bg-brand-primary",
          )}
        />
        <p className="text-[13px] font-semibold text-brand-text">{label}</p>
      </div>
      <p className="text-[11px] text-brand-text-secondary mt-0.5">{sub}</p>
    </div>
  );
}

function CellSide({
  value,
  label,
  diff,
  side,
}: {
  value: string;
  label: string;
  diff: boolean;
  side: "existing" | "incoming";
}) {
  return (
    <div
      className={cn(
        "px-5 py-2.5 border-b border-gray-50 text-[13px]",
        side === "incoming" && "border-l border-l-gray-100",
        diff && (side === "incoming" ? "bg-brand-mint/15" : "bg-amber-50/40"),
      )}
    >
      <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "text-brand-text font-medium truncate",
          value === "—" && "text-brand-text-secondary font-normal",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
