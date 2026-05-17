import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreRing, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Verdict = "strong_yes" | "yes" | "no" | "strong_no";

export interface SubmittedScorecard {
  id: string;
  evaluator: string;
  initials: string;
  date: string;
  ratings: Record<string, number>;
  overall: number;
  verdict: Verdict;
  strengths: string;
  concerns: string;
  recommendation: string;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: "Core" | "Secondary";
}

const CRITERIA: Criterion[] = [
  {
    id: "technical",
    name: "Technical skills",
    description: "Does the candidate have the required hard skills for this role?",
    weight: "Core",
  },
  {
    id: "experience",
    name: "Experience relevance",
    description: "Is their career history directly relevant to this mandate?",
    weight: "Core",
  },
  {
    id: "leadership",
    name: "Leadership capability",
    description:
      "Do they demonstrate the leadership qualities needed at this seniority?",
    weight: "Core",
  },
  {
    id: "cultural",
    name: "Cultural alignment",
    description: "Would they fit the client's organizational culture and values?",
    weight: "Secondary",
  },
  {
    id: "communication",
    name: "Communication",
    description:
      "How effectively did they communicate during the screening interaction?",
    weight: "Secondary",
  },
];

const RATING_LABELS = ["Poor", "Below avg", "Average", "Good", "Excellent"];
const TOOLTIP_LABELS = [
  "1 — Poor",
  "2 — Below average",
  "3 — Average",
  "4 — Good",
  "5 — Excellent",
];

const VERDICTS: {
  id: Verdict;
  label: string;
  icon: typeof ThumbsUp;
  filled: boolean;
  selectedClass: string;
}[] = [
  {
    id: "strong_yes",
    label: "Strong yes",
    icon: ThumbsUp,
    filled: true,
    selectedClass: "bg-green-50 border-2 border-green-400 text-green-700",
  },
  {
    id: "yes",
    label: "Yes",
    icon: ThumbsUp,
    filled: false,
    selectedClass: "bg-green-50/50 border border-green-300 text-green-600",
  },
  {
    id: "no",
    label: "No",
    icon: ThumbsDown,
    filled: false,
    selectedClass: "bg-red-50/50 border border-red-300 text-red-600",
  },
  {
    id: "strong_no",
    label: "Strong no",
    icon: ThumbsDown,
    filled: true,
    selectedClass: "bg-red-50 border-2 border-red-400 text-red-700",
  },
];

export const VERDICT_LABELS: Record<Verdict, string> = {
  strong_yes: "Strong Yes",
  yes: "Yes",
  no: "No",
  strong_no: "Strong No",
};

interface ScorecardFormProps {
  open: boolean;
  onClose: () => void;
  candidate: { name: string; title: string; company: string; score: number; initials: string };
  stageLabel: string;
  projectLabel: string;
  evaluatorName: string;
  evaluatorInitials: string;
  onSubmit: (card: SubmittedScorecard) => void;
}

function StarRow({
  value,
  onChange,
  size = 24,
  gap = 4,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
  gap?: number;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="flex items-center"
        style={{ gap }}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= display;
          return (
            <Tooltip key={n}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onClick={() => onChange(value === n ? 0 : n)}
                  className="flex items-center justify-center transition-colors duration-100"
                  style={{ width: Math.max(size, 36), height: Math.max(size, 36) }}
                  aria-label={TOOLTIP_LABELS[n - 1]}
                >
                  <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={filled ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      "transition-colors duration-100",
                      filled ? "text-amber-400" : "text-gray-300",
                    )}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>{TOOLTIP_LABELS[n - 1]}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function CriterionRow({
  criterion,
  value,
  note,
  onChange,
  onNote,
}: {
  criterion: Criterion;
  value: number;
  note: string;
  onChange: (n: number) => void;
  onNote: (s: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasNote = note.length > 0;
  const showNote = expanded || hasNote;

  return (
    <div className="border-b border-gray-50 pb-6">
      <div className="text-[14px] font-medium text-brand-text">{criterion.name}</div>
      <p className="mt-0.5 text-[13px] text-brand-text-secondary line-clamp-2">
        {criterion.description}
      </p>
      <div className="mt-3">
        <StarRow value={value} onChange={onChange} size={24} gap={4} />
        <div className="mt-1 flex w-[200px] items-center justify-between text-[11px] text-brand-text-secondary">
          {RATING_LABELS.map((l) => (
            <span key={l} className="w-10 text-center first:text-left last:text-right">
              {l}
            </span>
          ))}
        </div>
      </div>
      {!showNote ? (
        <button
          type="button"
          className="mt-2 text-xs text-brand-primary hover:underline"
          onClick={() => setExpanded(true)}
        >
          + Add note
        </button>
      ) : (
        <div className="ml-2 mt-2 border-l-2 border-gray-200 pl-3">
          <Textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            onBlur={() => {
              if (!note) setExpanded(false);
            }}
            placeholder="Evidence or comments for this rating..."
            className="min-h-[56px] text-[13px]"
            rows={2}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export function ScorecardForm({
  open,
  onClose,
  candidate,
  stageLabel,
  projectLabel,
  evaluatorName,
  evaluatorInitials,
  onSubmit,
}: ScorecardFormProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [overall, setOverall] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const canSubmit = overall > 0 && verdict !== null;
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const reset = () => {
    setRatings({});
    setNotes({});
    setOverall(0);
    setVerdict(null);
    setStrengths("");
    setConcerns("");
    setRecommendation("");
  };

  const handleSubmit = () => {
    if (!canSubmit || !verdict) return;
    onSubmit({
      id: `sc-${Date.now()}`,
      evaluator: evaluatorName,
      initials: evaluatorInitials,
      date: today,
      ratings,
      overall,
      verdict,
      strengths,
      concerns,
      recommendation,
    });
    toast.success(`Scorecard submitted for ${candidate.name}`);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[600px]"
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 pr-12">
          <div className="text-[18px] font-semibold text-brand-text">Scorecard</div>
          <div className="text-[13px] text-brand-text-secondary">
            {candidate.name} · {projectLabel} · {stageLabel} stage
          </div>
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Candidate context bar */}
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-seafoam text-sm font-medium text-brand-primary">
              {candidate.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium text-brand-text">{candidate.name}</div>
              <div className="text-[13px] text-brand-text-secondary">
                {candidate.title} at {candidate.company}
              </div>
            </div>
            <ScoreRing score={candidate.score} size="sm" />
            <StatusBadge status={stageLabel.toLowerCase()} label={stageLabel} />
          </div>

          {/* Criteria */}
          <div className="space-y-6">
            {CRITERIA.map((c) => (
              <CriterionRow
                key={c.id}
                criterion={c}
                value={ratings[c.id] ?? 0}
                note={notes[c.id] ?? ""}
                onChange={(n) => setRatings({ ...ratings, [c.id]: n })}
                onNote={(s) => setNotes({ ...notes, [c.id]: s })}
              />
            ))}
          </div>

          {/* Overall */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="text-center text-[16px] font-medium text-brand-text">
              Overall assessment
            </div>
            <div className="text-center text-[13px] text-brand-text-secondary">
              Your holistic evaluation of this candidate for this role
            </div>
            <div className="mt-4 flex flex-col items-center">
              <StarRow value={overall} onChange={setOverall} size={32} gap={6} />
              <div className="mt-1 flex w-[260px] items-center justify-between text-[12px] text-brand-text-secondary">
                {RATING_LABELS.map((l) => (
                  <span key={l} className="w-12 text-center first:text-left last:text-right">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Verdict buttons */}
            <div className="mt-5 grid grid-cols-2 justify-center gap-2 sm:flex sm:flex-row">
              {VERDICTS.map((v) => {
                const Icon = v.icon;
                const selected = verdict === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVerdict(v.id)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-150",
                      selected
                        ? v.selectedClass
                        : "border border-gray-200 bg-white text-gray-400 hover:border-gray-300",
                    )}
                  >
                    <Icon className="h-4 w-4" fill={v.filled && selected ? "currentColor" : "none"} />
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 space-y-4">
            <div className="border-l-2 border-green-400 pl-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-brand-text">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                Key strengths observed
              </div>
              <Textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What stood out positively? Specific examples are most useful..."
                rows={3}
                className="text-[14px]"
              />
            </div>
            <div className="border-l-2 border-amber-400 pl-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-brand-text">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Concerns or risks
              </div>
              <Textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Any red flags, skill gaps, or areas of concern?"
                rows={3}
                className="text-[14px]"
              />
            </div>
            <div className="border-l-2 border-gray-300 pl-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-brand-text">
                <MessageSquare className="h-3.5 w-3.5 text-brand-text-secondary" />
                Recommendation
              </div>
              <Textarea
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                placeholder="What do you recommend as the next step for this candidate?"
                rows={2}
                className="text-[14px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-medium text-brand-primary">
              {evaluatorInitials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] text-brand-text">
                Evaluator: <span className="font-medium">{evaluatorName}</span> · {today}
              </div>
              <div className="text-[11px] text-brand-text-secondary">
                This scorecard will be visible to your team
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Submit scorecard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------- Read-only summary card ----------------- */

function MiniStars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <svg
            key={n}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={filled ? "text-amber-400" : "text-gray-300"}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

function VerdictPill({ verdict }: { verdict: Verdict }) {
  const v = VERDICTS.find((x) => x.id === verdict)!;
  const Icon = v.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        v.selectedClass,
      )}
    >
      <Icon className="h-3 w-3" fill={v.filled ? "currentColor" : "none"} />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

export function ScorecardSummaryCard({ card }: { card: SubmittedScorecard }) {
  const [expanded, setExpanded] = useState(false);
  const recoTruncated = card.recommendation.length > 180;

  return (
    <div className="rounded-lg border border-gray-100 bg-brand-bg p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-medium text-brand-primary">
          {card.initials}
        </div>
        <div className="text-[13px] font-medium text-brand-text">{card.evaluator}</div>
        <div className="text-[12px] text-brand-text-secondary">· {card.date}</div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-brand-text-secondary">Overall:</span>
        <MiniStars value={card.overall} size={18} />
        <span className="text-[12px] text-brand-text-secondary">({card.overall}/5)</span>
        <span className="text-[12px] text-brand-text-secondary">·</span>
        <VerdictPill verdict={card.verdict} />
      </div>

      <div className="mt-3 space-y-1">
        {CRITERIA.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <div className="w-[160px] text-[12px] text-brand-text-secondary">{c.name}</div>
            <MiniStars value={card.ratings[c.id] ?? 0} size={14} />
          </div>
        ))}
      </div>

      {card.recommendation && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p
            className={cn(
              "text-[13px] italic text-brand-text-secondary",
              !expanded && "line-clamp-3",
            )}
          >
            "{card.recommendation}"
          </p>
        </div>
      )}

      {expanded && (card.strengths || card.concerns) && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {card.strengths && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-brand-text">
                <CheckCircle className="h-3 w-3 text-green-600" /> Strengths
              </div>
              <p className="text-[13px] text-brand-text-secondary">{card.strengths}</p>
            </div>
          )}
          {card.concerns && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-brand-text">
                <AlertTriangle className="h-3 w-3 text-amber-500" /> Concerns
              </div>
              <p className="text-[13px] text-brand-text-secondary">{card.concerns}</p>
            </div>
          )}
        </div>
      )}

      {(recoTruncated || card.strengths || card.concerns) && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-brand-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Expand full scorecard
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function ScorecardsStack({ cards }: { cards: SubmittedScorecard[] }) {
  if (cards.length === 0) {
    return (
      <p className="text-[13px] text-brand-text-secondary">
        No scorecards submitted yet. Add one to evaluate this candidate.
      </p>
    );
  }
  const avg =
    cards.reduce((sum, c) => sum + c.overall, 0) / cards.length;

  return (
    <div className="space-y-2">
      {cards.length >= 2 && (
        <div className="flex items-center gap-2 rounded-md bg-brand-bg px-3 py-2">
          <div className="flex -space-x-1.5">
            {cards.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-seafoam text-[10px] font-medium text-brand-primary"
              >
                {c.initials}
              </div>
            ))}
          </div>
          <div className="text-[13px] font-medium text-brand-text">
            {cards.length} evaluations submitted · Average: {avg.toFixed(1)} / 5
          </div>
        </div>
      )}
      {cards.map((c) => (
        <ScorecardSummaryCard key={c.id} card={c} />
      ))}
    </div>
  );
}

export const MOCK_RINA_SCORECARD: SubmittedScorecard = {
  id: "sc-rina-amarsh",
  evaluator: "Amarsh Jain",
  initials: "AJ",
  date: "Mar 16, 2026",
  ratings: {
    technical: 4,
    experience: 5,
    leadership: 4,
    cultural: 3,
    communication: 5,
  },
  overall: 4,
  verdict: "strong_yes",
  strengths:
    "IFRS and M&A experience thoroughly confirmed in 45-minute phone screen. Clear articulation of how she led the $340M bond issuance at Telkom. Team management of 45 people is directly relevant to Indorama's 50-person finance team.",
  concerns:
    "No direct petrochemical/manufacturing sector experience. Cultural alignment rated lower because Telkom's corporate culture may differ significantly from Indorama's operational environment. Worth probing in client interview.",
  recommendation:
    "Advance to client submission. Prepare a candidate brief highlighting her cross-sector adaptability and the Telkom scale as analogous to Indorama. Flag the industry gap proactively to the client.",
};
