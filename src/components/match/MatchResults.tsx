import { useState, useEffect, useMemo, forwardRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  RefreshCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  SkipForward,
  Star,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScoreRing, AIVerdictChip } from "@/components/shared";
import type { Verdict } from "@/components/shared/AIVerdictChip";
import { FocusMode, FOCUS_DEMO_CANDIDATES } from "./FocusMode";
import { cn } from "@/lib/utils";

type Action = "unreviewed" | "approved" | "skipped" | "rejected" | "shortlisted";

interface Breakdown {
  skills: number;
  experience: number;
  seniority: number;
  location: number;
  semantic: number;
}

interface Match {
  id: string;
  rank: number;
  name: string;
  title: string;
  company: string;
  location: string;
  years: number;
  seniority: string;
  score: number;
  verdict: Verdict;
  strengths: string[];
  gaps: string[];
  concerns: string[];
  recommendation: string;
  breakdown: Breakdown;
  dnc?: boolean;
}

const MATCHES: Match[] = [
  {
    id: "c1", rank: 1, name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia",
    location: "Jakarta", years: 18, seniority: "C-Suite", score: 88, verdict: "strong_match",
    strengths: ["IFRS certified", "18 yrs finance", "M&A experience", "Current CFO", "Board reporting"],
    gaps: ["No petrochemical industry exp"],
    concerns: [],
    recommendation: "Strong candidate for the Indorama CFO role. Her 18 years of experience and current CFO position at Telkom demonstrate the required seniority. The IFRS and M&A experience directly match the brief's must-haves. The main gap is the lack of petrochemical/manufacturing industry experience, but her cross-industry financial leadership is transferable. Recommend advancing to shortlist.",
    breakdown: { skills: 82, experience: 90, seniority: 100, location: 70, semantic: 85 },
  },
  {
    id: "c2", rank: 2, name: "Priya Nair", title: "Group CFO", company: "Tata Motors SE Asia",
    location: "Singapore", years: 20, seniority: "C-Suite", score: 85, verdict: "strong_match",
    strengths: ["M&A", "IPO experience", "20 yrs", "Multinational leadership"],
    gaps: ["Based in Singapore (relocation needed)"],
    concerns: ["Notice period 6 months"],
    recommendation: "Excellent track record with multinational exposure and IPO experience. Relocation from Singapore to Jakarta would need to be negotiated. Strongly worth a conversation.",
    breakdown: { skills: 90, experience: 95, seniority: 100, location: 55, semantic: 88 },
  },
  {
    id: "c3", rank: 3, name: "Amara Osei", title: "CFO", company: "Fonterra SEA",
    location: "Jakarta", years: 16, seniority: "C-Suite", score: 82, verdict: "strong_match",
    strengths: ["IFRS", "ESG reporting", "Board reporting", "Based in Jakarta"],
    gaps: ["FMCG, not manufacturing"],
    concerns: [],
    recommendation: "Local CFO with deep IFRS and ESG expertise. Industry adjacency is FMCG rather than petrochemical but financial leadership skills translate well.",
    breakdown: { skills: 85, experience: 80, seniority: 100, location: 100, semantic: 75 },
  },
  {
    id: "c4", rank: 4, name: "Budi Santoso", title: "VP Finance", company: "Astra International",
    location: "Jakarta", years: 14, seniority: "VP", score: 76, verdict: "strong_match",
    strengths: ["Jakarta", "SAP FICO", "Treasury", "Manufacturing exposure"],
    gaps: ["VP not CFO (seniority gap)"],
    concerns: [],
    recommendation: "Strong technical finance background at a local conglomerate. The step up from VP to CFO is meaningful but his Astra experience suggests readiness.",
    breakdown: { skills: 80, experience: 75, seniority: 70, location: 100, semantic: 78 },
  },
  {
    id: "c5", rank: 5, name: "Patrick O'Brien", title: "Group Treasurer", company: "BHP Billiton",
    location: "Sydney", years: 19, seniority: "Director", score: 71, verdict: "possible_match",
    strengths: ["Treasury depth", "19 yrs", "Mining/resources industry"],
    gaps: ["Based in Sydney", "Treasurer not CFO"],
    concerns: ["May not want emerging markets move"],
    recommendation: "Treasury specialist rather than generalist CFO. Strong resources industry alignment but role and location create friction.",
    breakdown: { skills: 70, experience: 85, seniority: 70, location: 40, semantic: 80 },
  },
  {
    id: "c6", rank: 6, name: "Dewi Anggraini", title: "VP Corporate Finance", company: "Indofood CBP",
    location: "Jakarta", years: 13, seniority: "VP", score: 68, verdict: "possible_match",
    strengths: ["Capital markets", "IFRS", "Jakarta-based"],
    gaps: ["VP level", "Food industry"],
    concerns: [],
    recommendation: "Promising local talent with capital markets exposure. Would be a stretch hire into the CFO seat.",
    breakdown: { skills: 75, experience: 65, seniority: 65, location: 100, semantic: 70 },
  },
  {
    id: "c7", rank: 7, name: "Sarah Mitchell", title: "Regional Finance Lead", company: "Unilever Indonesia",
    location: "Jakarta", years: 14, seniority: "Director", score: 64, verdict: "possible_match",
    strengths: ["FP&A", "Jakarta", "FMCG"],
    gaps: ["Director not CFO", "14 yrs (below 15+ target)"],
    concerns: [],
    recommendation: "Solid FP&A leader at a blue-chip multinational. Below the experience and seniority bar for the brief but worth keeping warm.",
    breakdown: { skills: 70, experience: 60, seniority: 60, location: 100, semantic: 65 },
  },
  {
    id: "c8", rank: 8, name: "Tom Nguyen", title: "CFO", company: "Vietnam Dairy Products",
    location: "Ho Chi Minh", years: 17, seniority: "C-Suite", score: 59, verdict: "possible_match",
    strengths: ["CFO title", "Manufacturing", "17 yrs"],
    gaps: ["Vietnam-based"],
    concerns: ["DNC flagged in our database"],
    recommendation: "Profile aligns to the brief technically but candidate is flagged Do Not Contact in the agency database. Excluded from outreach.",
    breakdown: { skills: 75, experience: 80, seniority: 100, location: 30, semantic: 55 },
    dnc: true,
  },
  {
    id: "c9", rank: 9, name: "James Chen", title: "Finance Director", company: "Wilmar International",
    location: "Singapore", years: 12, seniority: "Director", score: 55, verdict: "possible_match",
    strengths: ["Agriculture/commodities", "Singapore hub"],
    gaps: ["Director level", "12 yrs experience"],
    concerns: [],
    recommendation: "Industry adjacency is interesting (agri-commodities) but tenure and seniority are below the brief.",
    breakdown: { skills: 65, experience: 55, seniority: 60, location: 50, semantic: 60 },
  },
  {
    id: "c10", rank: 10, name: "Siti Rahayu", title: "Tax Director", company: "PwC Indonesia",
    location: "Jakarta", years: 15, seniority: "Director", score: 42, verdict: "weak_match",
    strengths: ["Indonesian tax expertise", "Jakarta"],
    gaps: ["Tax specialist not generalist CFO"],
    concerns: ["No P&L ownership"],
    recommendation: "Domain specialist without operational P&L exposure. Not a fit for the generalist CFO seat.",
    breakdown: { skills: 50, experience: 60, seniority: 50, location: 100, semantic: 30 },
  },
];

type FilterValue = "all" | "unreviewed" | "approved" | "shortlisted" | "rejected" | "skipped";

const FILTER_LABELS: Record<FilterValue, string> = {
  all: "All",
  unreviewed: "Unreviewed",
  approved: "Approved",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  skipped: "Skipped",
};

export function MatchResults({ projectId }: { projectId: string }) {
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>("c1");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [focusIdx, setFocusIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  const visible = useMemo(() => {
    return MATCHES.filter((m) => {
      const a = actions[m.id] ?? "unreviewed";
      if (filter === "all") return true;
      return a === filter;
    });
  }, [actions, filter]);

  const counts = useMemo(() => {
    const c = { approved: 0, skipped: 0, rejected: 0, shortlisted: 0, unreviewed: 0 };
    MATCHES.forEach((m) => {
      const a = actions[m.id] ?? "unreviewed";
      c[a]++;
    });
    return c;
  }, [actions]);

  const reviewedCount = MATCHES.length - counts.unreviewed;

  const setAction = (id: string, next: Action) => {
    setActions((prev) => ({
      ...prev,
      [id]: prev[id] === next ? "unreviewed" : next,
    }));
  };

  const toggleExpand = (id: string) => {
    setExpanded((curr) => (curr === id ? null : id));
  };

  useEffect(() => {
    if (focusOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const list = visible;
      if (list.length === 0) return;
      const idx = Math.min(focusIdx, list.length - 1);
      const current = list[idx];
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx(Math.min(list.length - 1, idx + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx(Math.max(0, idx - 1));
      } else if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        e.preventDefault();
        toggleExpand(current.id);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFocusOpen(true);
      } else if (e.key === "a" || e.key === "A") {
        setAction(current.id, "approved");
      } else if (e.key === "s" || e.key === "S") {
        setAction(current.id, "skipped");
      } else if (e.key === "r" || e.key === "R") {
        setAction(current.id, "rejected");
      } else if (e.key === "l" || e.key === "L") {
        if (!current.dnc) setAction(current.id, "shortlisted");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, focusIdx, focusOpen]);

  // Silence unused warning; projectId is for future deep-link wiring.
  void projectId;

  const strong = MATCHES.filter((m) => m.score >= 75).length;
  const possible = MATCHES.filter((m) => m.score >= 50 && m.score < 75).length;
  const weak = MATCHES.filter((m) => m.score < 50).length;
  const total = MATCHES.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Match Run Header */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <span className="text-[16px] font-medium text-brand-text">AI match results</span>
            </div>
            <p className="mt-1 text-[13px] text-brand-text-secondary">
              30 candidates scored against CFO — Indorama Ventures brief
            </p>
            <p className="mt-0.5 text-[12px] text-brand-text-secondary">
              Last run: 2 hours ago · Model: Claude Sonnet 4.6 · Cost: $0.42
            </p>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-brand-primary hover:underline"
            >
              <History className="h-3 w-3" />
              {showHistory ? "Hide history" : "History"}
            </button>
            {showHistory && (
              <ul className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-brand-bg px-3 py-2 text-[12px] text-brand-text-secondary">
                <li>Run 2 — Mar 14, 2:30 PM — 30 results — $0.42</li>
                <li>Run 1 — Mar 12, 11:15 AM — 28 results — $0.39</li>
              </ul>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Show: {FILTER_LABELS[filter]}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter results</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filter}
                  onValueChange={(v) => setFilter(v as FilterValue)}
                >
                  {(Object.keys(FILTER_LABELS) as FilterValue[]).map((f) => (
                    <DropdownMenuRadioItem key={f} value={f}>
                      {FILTER_LABELS[f]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Re-run matching
            </Button>
            <Button
              size="sm"
              onClick={() => setFocusOpen(true)}
              className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Focus mode
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-brand-text-secondary">
            <span>
              {reviewedCount} of {total} reviewed · {counts.shortlisted} shortlisted · {counts.approved} approved · {counts.rejected} rejected · {counts.skipped} skipped
            </span>
            <span>
              Showing {visible.length} of {total}
              {filter !== "all" && ` ${FILTER_LABELS[filter].toLowerCase()}`}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-primary transition-all"
              style={{ width: `${(reviewedCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="text-[13px] font-medium text-brand-text">Score distribution</div>
        <div className="mt-3 flex h-8 w-full overflow-hidden rounded-lg">
          <DistSegment count={strong} total={total} color="bg-status-success" />
          <DistSegment count={possible} total={total} color="bg-status-warning" />
          <DistSegment count={weak} total={total} color="bg-status-danger" />
        </div>
        <p className="mt-2 text-[13px] text-brand-text-secondary">
          {strong} strong matches · {possible} possible · {weak} weak · {reviewedCount} reviewed
        </p>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-3">
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-brand-text-secondary">
            No candidates match this filter.
          </div>
        )}
        {visible.map((m, i) => (
          <MatchCard
            key={m.id}
            match={m}
            action={actions[m.id] ?? "unreviewed"}
            override={overrides[m.id]}
            expanded={expanded === m.id}
            focused={i === focusIdx}
            onToggle={() => toggleExpand(m.id)}
            onAction={(a) => setAction(m.id, a)}
            onOverride={(n) => setOverrides((p) => ({ ...p, [m.id]: n }))}
            onFocus={() => setFocusIdx(i)}
          />
        ))}
      </div>

      {showHint && (
        <div className="fixed bottom-6 right-6 z-30 hidden items-center gap-3 rounded-full bg-brand-text px-4 py-2 text-xs text-white opacity-90 shadow-lg lg:flex">
          <span>
            <Kbd>A</Kbd> Approve · <Kbd>S</Kbd> Skip · <Kbd>R</Kbd> Reject · <Kbd>L</Kbd> Shortlist · <Kbd>↑↓</Kbd> Nav · <Kbd>E</Kbd> Expand
          </span>
          <button
            onClick={() => setShowHint(false)}
            className="rounded-full p-0.5 hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded border border-white/20 bg-white/10 px-1 py-0.5 font-mono text-[10px]">
      {children}
    </kbd>
  );
}

function DistSegment({ count, total, color }: { count: number; total: number; color: string }) {
  if (count === 0) return null;
  return (
    <div
      className={cn("flex items-center justify-center text-[11px] font-semibold text-white", color)}
      style={{ width: `${(count / total) * 100}%` }}
    >
      {count}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  action: Action;
  override?: number;
  expanded: boolean;
  focused: boolean;
  onToggle: () => void;
  onAction: (a: Action) => void;
  onOverride: (n: number) => void;
  onFocus: () => void;
}

const MatchCard = forwardRef<HTMLDivElement, MatchCardProps>(function MatchCardImpl(
  { match, action, override, expanded, focused, onToggle, onAction, onOverride, onFocus },
  ref,
) {
  const displayScore = override ?? match.score;
  const isOverridden = override !== undefined && override !== match.score;

  const borderState =
    action === "approved"
      ? "border-l-4 border-l-status-success"
      : action === "rejected"
      ? "border-l-4 border-l-status-danger"
      : action === "shortlisted"
      ? "border-l-4 border-l-status-warning"
      : "";

  const cardOpacity =
    action === "skipped" ? "opacity-50" : action === "rejected" ? "opacity-70" : "";

  return (
    <div
      ref={ref}
      onClick={onFocus}
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300",
        "hover:border-gray-200",
        focused && "ring-2 ring-brand-mint",
        borderState,
        cardOpacity,
      )}
    >
      <div className="flex cursor-pointer items-start gap-4" onClick={onToggle}>
        <div className="shrink-0">
          <ScoreRing score={displayScore} size="md" />
          {isOverridden && (
            <div className="mt-1 rounded-full bg-brand-mint/30 px-1.5 py-0.5 text-center text-[9px] font-medium text-brand-primary">
              Overridden
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {action === "shortlisted" && (
              <Star className="h-4 w-4 fill-status-warning text-status-warning" />
            )}
            <Link
              to="/candidates/$id"
              params={{ id: match.id }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "text-[15px] font-medium text-brand-text hover:text-brand-primary hover:underline",
                action === "rejected" && "line-through",
              )}
            >
              {match.name}
            </Link>
            {match.dnc && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-status-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-status-danger"
                title="Do Not Contact — excluded from outreach"
              >
                <ShieldAlert className="h-3 w-3" />
                DNC
              </span>
            )}
            <span className="text-[12px] text-brand-text-secondary">#{match.rank}</span>
          </div>
          <div className="text-[13px] text-brand-text-secondary">
            {match.title} at {match.company}
          </div>
          <div className="text-[12px] text-brand-text-secondary">
            {match.location} · {match.years} yrs · {match.seniority}
          </div>

          <div className="mt-2 flex flex-col gap-1 text-[12px]">
            <div>
              <span className="font-medium text-brand-text-secondary">Strengths: </span>
              <span className="text-status-success">
                {match.strengths.slice(0, 4).join(" · ")}
                {match.strengths.length > 4 && "…"}
              </span>
            </div>
            <div>
              <span className="font-medium text-brand-text-secondary">Gaps: </span>
              <span className="text-status-warning">
                {match.gaps.slice(0, 2).join(" · ") || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <AIVerdictChip verdict={match.verdict} />
          <button
            className="rounded-md p-1 text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 rounded-lg border-t border-gray-100 bg-brand-bg p-5">
          <div>
            <div className="text-[13px] font-medium text-brand-text">Score breakdown</div>
            <div className="mt-3 space-y-2">
              <BreakdownBar label="Must-have skills" weight="30%" value={match.breakdown.skills} />
              <BreakdownBar label="Experience fit" weight="20%" value={match.breakdown.experience} />
              <BreakdownBar label="Seniority fit" weight="10%" value={match.breakdown.seniority} />
              <BreakdownBar label="Location fit" weight="10%" value={match.breakdown.location} />
              <BreakdownBar
                label="Semantic similarity"
                weight="30%"
                value={match.breakdown.semantic}
                variant="ai"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ExplanationGroup
              title="Strengths"
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-status-success" />}
              items={match.strengths}
              pillClass="bg-status-success/10 text-status-success border-status-success/20"
            />
            <ExplanationGroup
              title="Gaps"
              icon={<AlertTriangle className="h-3.5 w-3.5 text-status-warning" />}
              items={match.gaps}
              pillClass="bg-status-warning/10 text-status-warning border-status-warning/20"
            />
            <ExplanationGroup
              title="Concerns"
              icon={<Info className="h-3.5 w-3.5 text-brand-text-secondary" />}
              items={match.concerns}
              pillClass="bg-gray-100 text-brand-text-secondary border-gray-200"
            />
          </div>

          <blockquote className="mt-5 border-l-2 border-brand-mint pl-4 text-[13px] italic leading-relaxed text-brand-text-secondary">
            {match.recommendation}
          </blockquote>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 text-[12px] text-brand-text-secondary">
              Override score:
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={match.score}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!isNaN(n)) onOverride(Math.max(0, Math.min(100, n)));
                }}
                className="w-16 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-1 items-center gap-2 text-[12px] text-brand-text-secondary">
              Note:
              <input
                type="text"
                placeholder="Add justification…"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
              />
            </label>
          </div>
        </div>
      )}

      <div
        className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionBtn
          active={action === "approved"}
          onClick={() => onAction("approved")}
          icon={<Check className="h-3.5 w-3.5" />}
          label="Approve"
          color="success"
        />
        <ActionBtn
          active={action === "skipped"}
          onClick={() => onAction("skipped")}
          icon={<SkipForward className="h-3.5 w-3.5" />}
          label="Skip"
          color="neutral"
        />
        <ActionBtn
          active={action === "rejected"}
          onClick={() => onAction("rejected")}
          icon={<X className="h-3.5 w-3.5" />}
          label="Reject"
          color="danger"
        />
        {match.dnc ? (
          <button
            disabled
            title="Cannot shortlist — Do Not Contact"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-brand-text-secondary opacity-60"
          >
            <Star className="h-3.5 w-3.5" />
            Shortlist
          </button>
        ) : (
          <button
            onClick={() => onAction("shortlisted")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              action === "shortlisted"
                ? "bg-status-warning text-white hover:bg-status-warning/90"
                : "bg-brand-primary text-white hover:bg-brand-primary/90",
            )}
          >
            <Star className={cn("h-3.5 w-3.5", action === "shortlisted" && "fill-current")} />
            Shortlist
          </button>
        )}
      </div>
    </div>
  );
});

function BreakdownBar({
  label,
  weight,
  value,
  variant,
}: {
  label: string;
  weight: string;
  value: number;
  variant?: "ai";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[160px] shrink-0 items-baseline justify-between">
        <span className="text-[12px] text-brand-text-secondary">{label}</span>
        <span className="text-[10px] text-brand-text-secondary/70">{weight}</span>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            variant === "ai" ? "bg-purple-500" : "bg-brand-primary",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-10 shrink-0 text-right text-[13px] tabular-nums text-brand-text">{value}</div>
    </div>
  );
}

function ExplanationGroup({
  title,
  icon,
  items,
  pillClass,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  pillClass: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-brand-text">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-[12px] italic text-brand-text-secondary">None noted</span>
        ) : (
          items.map((it) => (
            <span
              key={it}
              className={cn("rounded-md border px-2.5 py-1 text-[11px] font-medium", pillClass)}
            >
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "success" | "danger" | "neutral";
}) {
  const palette = {
    success: active
      ? "bg-status-success/15 border-status-success text-status-success"
      : "border-status-success/40 text-status-success hover:bg-status-success/10",
    danger: active
      ? "bg-status-danger/15 border-status-danger text-status-danger"
      : "border-status-danger/40 text-status-danger hover:bg-status-danger/10",
    neutral: active
      ? "bg-gray-100 border-gray-300 text-brand-text"
      : "border-gray-300 text-brand-text-secondary hover:bg-gray-50",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        palette[color],
      )}
    >
      {icon}
      {label}
    </button>
  );
}
