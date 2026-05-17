import { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  SkipForward,
  Star,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { ScoreRing, AIVerdictChip } from "@/components/shared";
import type { Verdict } from "@/components/shared/AIVerdictChip";
import { cn } from "@/lib/utils";

type Action = "unreviewed" | "approved" | "skipped" | "rejected" | "shortlisted";

interface FocusCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  years: number;
  seniority: string;
  score: number;
  verdict: Verdict;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  career: { role: string; company: string; period: string }[];
  facts: { salary: string; notice: string; relocate: string };
  breakdown: {
    skills: number;
    experience: number;
    seniority: number;
    location: number;
    semantic: number;
  };
  strengths: string[];
  gaps: string[];
  concerns: string[];
  recommendation: string;
  dnc?: boolean;
}

export interface FocusModeProps {
  candidates: FocusCandidate[];
  initialActions: Record<string, Action>;
  initialIndex?: number;
  onClose: () => void;
  onCommit: (actions: Record<string, Action>, overrides: Record<string, number>) => void;
}

export function FocusMode({
  candidates,
  initialActions,
  initialIndex = 0,
  onClose,
  onCommit,
}: FocusModeProps) {
  const [index, setIndex] = useState(initialIndex);
  const [actions, setActions] = useState<Record<string, Action>>(initialActions);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [pressed, setPressed] = useState<Action | null>(null);
  const [direction, setDirection] = useState<"in" | "out-left">("in");
  const [done, setDone] = useState(false);

  const total = candidates.length;
  const current = candidates[Math.min(index, total - 1)];

  const counts = useMemo(() => {
    const c = { approved: 0, skipped: 0, rejected: 0, shortlisted: 0, unreviewed: 0 };
    candidates.forEach((m) => {
      c[actions[m.id] ?? "unreviewed"]++;
    });
    return c;
  }, [actions, candidates]);

  const reviewed = total - counts.unreviewed;

  const commitAndClose = () => {
    onCommit(actions, overrides);
    onClose();
  };

  const advance = () => {
    if (index >= total - 1) {
      setDone(true);
      return;
    }
    setDirection("out-left");
    window.setTimeout(() => {
      setIndex((i) => Math.min(total - 1, i + 1));
      setDirection("in");
    }, 200);
  };

  const goPrev = () => {
    if (index <= 0) return;
    setDirection("out-left");
    window.setTimeout(() => {
      setIndex((i) => Math.max(0, i - 1));
      setDirection("in");
    }, 200);
  };

  const goNext = () => {
    if (index >= total - 1) return;
    setDirection("out-left");
    window.setTimeout(() => {
      setIndex((i) => Math.min(total - 1, i + 1));
      setDirection("in");
    }, 200);
  };

  const applyAction = (next: Action) => {
    if (next === "shortlisted" && current.dnc) return;
    setPressed(next);
    setActions((prev) => ({ ...prev, [current.id]: next }));
    window.setTimeout(() => setPressed(null), 150);
    window.setTimeout(advance, 180);
  };

  // Keyboard
  useEffect(() => {
    if (done) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") commitAndClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        commitAndClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "a" || e.key === "A") {
        applyAction("approved");
      } else if (e.key === "s" || e.key === "S") {
        applyAction("skipped");
      } else if (e.key === "r" || e.key === "R") {
        applyAction("rejected");
      } else if (e.key === "l" || e.key === "L") {
        applyAction("shortlisted");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current, done]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const displayScore = overrides[current?.id] ?? current?.score ?? 0;

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-brand-bg">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-lg">
          <CheckCircle className="mx-auto h-12 w-12 text-status-success" strokeWidth={1.5} />
          <h2 className="mt-4 text-[22px] font-semibold text-brand-text">Review complete</h2>
          <p className="mt-2 text-sm text-brand-text-secondary">{total} candidates reviewed</p>
          <ul className="mt-6 space-y-2 text-left text-[15px]">
            <SummaryRow icon={<Star className="h-4 w-4 fill-status-warning text-status-warning" />} label="shortlisted" count={counts.shortlisted} />
            <SummaryRow icon={<Check className="h-4 w-4 text-status-success" />} label="approved" count={counts.approved} />
            <SummaryRow icon={<SkipForward className="h-4 w-4 text-brand-text-secondary" />} label="skipped" count={counts.skipped} />
            <SummaryRow icon={<X className="h-4 w-4 text-status-danger" />} label="rejected" count={counts.rejected} />
          </ul>
          <div className="mt-7 flex flex-col gap-2">
            <button
              onClick={commitAndClose}
              className="w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary/90"
            >
              View shortlist →
            </button>
            <button
              onClick={commitAndClose}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-bg"
            >
              Back to match results
            </button>
            <button
              onClick={commitAndClose}
              className="w-full px-4 py-2 text-sm text-brand-text-secondary hover:underline"
            >
              Exit focus mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-brand-bg">
      {/* Top Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur">
        <button
          onClick={commitAndClose}
          className="inline-flex items-center gap-2 text-[13px] text-brand-text-secondary hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
          Exit focus mode
          <Kbd>Esc</Kbd>
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="text-[15px] font-medium text-brand-text tabular-nums">
            {index + 1} of {total}
          </div>
          <ProgressBar
            total={total}
            index={index}
            actions={actions}
            candidates={candidates}
          />
        </div>

        <div className="hidden items-center gap-3 text-[13px] md:flex">
          <SummaryPill color="text-status-warning" count={counts.shortlisted} label="shortlisted" />
          <SummaryPill color="text-status-success" count={counts.approved} label="approved" />
          <SummaryPill color="text-status-danger" count={counts.rejected} label="rejected" />
          <SummaryPill color="text-brand-text-secondary" count={counts.skipped} label="skipped" />
        </div>
      </div>

      {/* Main two-panel */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-[1400px] px-6 py-6 lg:px-12">
          <div
            key={current.id}
            className={cn(
              "grid h-full grid-cols-1 gap-6 lg:grid-cols-2",
              direction === "in" ? "animate-fade-in" : "opacity-0 -translate-x-8 transition-all duration-200",
            )}
          >
            {/* LEFT — Candidate */}
            <div className="flex flex-col gap-5 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="animate-scale-in shrink-0">
                  <ScoreRing score={displayScore} size="lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[22px] font-semibold leading-tight text-brand-text">
                      {current.name}
                    </h2>
                    <AIVerdictChip verdict={current.verdict} />
                  </div>
                  <p className="mt-1 text-[15px] text-brand-text-secondary">
                    {current.title} at {current.company}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-brand-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {current.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {current.seniority} · {current.years} years experience
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-100" />

              <p className="text-[14px] leading-relaxed text-brand-text line-clamp-4">
                {current.summary}
              </p>

              <div>
                <div className="text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
                  Skills
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {current.matchingSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-status-success/30 bg-status-success/10 px-2.5 py-1 text-xs font-medium text-status-success">
                      <Check className="h-2.5 w-2.5" />
                      {s}
                    </span>
                  ))}
                  {current.missingSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-status-danger/30 bg-status-danger/10 px-2.5 py-1 text-xs font-medium text-status-danger">
                      <X className="h-2.5 w-2.5" />
                      {s}
                    </span>
                  ))}
                  {current.extraSkills.map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-brand-text-secondary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
                  Career snapshot
                </div>
                <ul className="mt-2 space-y-1.5">
                  {current.career.map((c, i) => (
                    <li key={i} className="text-[13px] text-brand-text">
                      <span className="font-medium">{c.role}</span>
                      <span className="text-brand-text-secondary"> — {c.company} </span>
                      <span className="text-brand-text-secondary/80">({c.period})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-4 text-[12px]">
                <Fact label="Salary expectation" value={current.facts.salary} />
                <span className="text-brand-text-secondary/40">·</span>
                <Fact label="Notice period" value={current.facts.notice} />
                <span className="text-brand-text-secondary/40">·</span>
                <Fact label="Relocate" value={current.facts.relocate} />
              </div>
            </div>

            {/* RIGHT — Explanation */}
            <div className="flex flex-col gap-5 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div>
                <div className="text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
                  Score breakdown
                </div>
                <div className="mt-3 space-y-4">
                  <Bar label="Must-have skills" weight="30%" value={current.breakdown.skills} />
                  <Bar label="Experience fit" weight="20%" value={current.breakdown.experience} />
                  <Bar label="Seniority fit" weight="10%" value={current.breakdown.seniority} />
                  <Bar label="Location fit" weight="10%" value={current.breakdown.location} />
                  <Bar label="Semantic similarity" weight="30%" value={current.breakdown.semantic} variant="ai" />
                </div>
              </div>

              <div className="border-b border-gray-100" />

              <ExplanationList
                title="Strengths"
                icon={<CheckCircle2 className="h-4 w-4 text-status-success" />}
                items={current.strengths}
                dotClass="bg-status-success"
              />
              <ExplanationList
                title="Gaps"
                icon={<AlertTriangle className="h-4 w-4 text-status-warning" />}
                items={current.gaps}
                dotClass="bg-status-warning"
              />
              <ExplanationList
                title="Concerns"
                icon={<Info className="h-4 w-4 text-brand-text-secondary" />}
                items={current.concerns}
                dotClass="bg-brand-text-secondary"
              />

              <div className="border-l-[3px] border-brand-mint pl-5">
                <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text-secondary">
                  <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                  AI recommendation
                </div>
                <p className="mt-2 text-[14px] italic leading-relaxed text-brand-text">
                  {current.recommendation}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                <label className="flex items-center gap-2 text-[12px] text-brand-text-secondary">
                  Override score:
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={overrides[current.id] ?? current.score}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!isNaN(n)) {
                        setOverrides((p) => ({
                          ...p,
                          [current.id]: Math.max(0, Math.min(100, n)),
                        }));
                      }
                    }}
                    className="h-8 w-16 rounded-md border border-gray-200 bg-white px-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-1 items-center gap-2 text-[12px] text-brand-text-secondary">
                  Add note:
                  <input
                    type="text"
                    placeholder="Reason for override…"
                    className="h-8 flex-1 rounded-md border border-gray-200 bg-white px-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-8">
          <NavBtn
            label="Previous"
            arrow="left"
            disabled={index === 0}
            onClick={goPrev}
          />

          <div className="flex items-center gap-3">
            <BigAction
              label="Approve"
              shortcut="A"
              icon={<Check className="h-4 w-4" />}
              color="success"
              pressed={pressed === "approved"}
              onClick={() => applyAction("approved")}
            />
            <BigAction
              label="Skip"
              shortcut="S"
              icon={<SkipForward className="h-4 w-4" />}
              color="neutral"
              pressed={pressed === "skipped"}
              onClick={() => applyAction("skipped")}
            />
            <BigAction
              label="Reject"
              shortcut="R"
              icon={<X className="h-4 w-4" />}
              color="danger"
              pressed={pressed === "rejected"}
              onClick={() => applyAction("rejected")}
            />
            <BigAction
              label="Shortlist"
              shortcut="L"
              icon={<Star className={cn("h-4 w-4", actions[current.id] === "shortlisted" && "fill-current")} />}
              color="primary"
              pressed={pressed === "shortlisted"}
              disabled={current.dnc}
              disabledHint="Cannot shortlist — Do Not Contact"
              onClick={() => applyAction("shortlisted")}
            />
          </div>

          <NavBtn
            label="Next"
            arrow="right"
            disabled={index === total - 1}
            onClick={goNext}
          />
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
      {children}
    </kbd>
  );
}

function ProgressBar({
  total,
  index,
  actions,
  candidates,
}: {
  total: number;
  index: number;
  actions: Record<string, Action>;
  candidates: FocusCandidate[];
}) {
  return (
    <div className="flex h-1 w-[300px] gap-px overflow-hidden rounded-full bg-gray-200">
      {candidates.map((c, i) => {
        const a = actions[c.id] ?? "unreviewed";
        let color = "bg-transparent";
        if (a === "shortlisted" || a === "approved") color = "bg-status-success";
        else if (a === "rejected") color = "bg-status-danger";
        else if (a === "skipped") color = "bg-gray-400";
        else if (i === index) color = "bg-brand-primary";
        return <div key={c.id} className={cn("h-full flex-1", color)} />;
      })}
    </div>
  );
}

function SummaryPill({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <span className={cn("tabular-nums", color)}>
      {count} <span className="text-brand-text-secondary">{label}</span>
    </span>
  );
}

function SummaryRow({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-brand-bg px-3 py-2">
      <span className="inline-flex items-center gap-2 text-brand-text">{icon}{label}</span>
      <span className="font-semibold tabular-nums text-brand-text">{count}</span>
    </li>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-brand-text-secondary">{label}: </span>
      <span className="text-brand-text">{value}</span>
    </span>
  );
}

function Bar({
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
    <div className="flex items-center gap-4">
      <div className="w-[180px] shrink-0">
        <span className="text-[14px] text-brand-text-secondary">{label}</span>
        <span className="ml-1 text-[12px] text-brand-text-secondary/70">({weight})</span>
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            variant === "ai" ? "bg-purple-500" : "bg-brand-primary",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-10 shrink-0 text-right text-[14px] font-medium tabular-nums text-brand-text">
        {value}
      </div>
    </div>
  );
}

function ExplanationList({
  title,
  icon,
  items,
  dotClass,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  dotClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-text">
        {icon}
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[14px] leading-relaxed text-brand-text">
            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavBtn({
  label,
  arrow,
  disabled,
  onClick,
}: {
  label: string;
  arrow: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = arrow === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-text-secondary transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:border-gray-300 hover:bg-brand-bg hover:text-brand-text",
      )}
    >
      {arrow === "left" && <Icon className="h-4 w-4" />}
      {label}
      {arrow === "right" && <Icon className="h-4 w-4" />}
      <Kbd>{arrow === "left" ? "←" : "→"}</Kbd>
    </button>
  );
}

function BigAction({
  label,
  shortcut,
  icon,
  color,
  pressed,
  disabled,
  disabledHint,
  onClick,
}: {
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  color: "success" | "danger" | "neutral" | "primary";
  pressed?: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onClick: () => void;
}) {
  const palette = {
    success: "border-2 border-status-success/50 text-status-success hover:bg-status-success/10",
    danger: "border-2 border-status-danger/50 text-status-danger hover:bg-status-danger/10",
    neutral: "border-2 border-gray-300 text-brand-text-secondary hover:bg-gray-50",
    primary: "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm border-2 border-brand-primary",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium transition-all duration-150",
        palette[color],
        pressed && "scale-95",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      {icon}
      {label}
      <kbd
        className={cn(
          "ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]",
          color === "primary" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
        )}
      >
        {shortcut}
      </kbd>
    </button>
  );
}

// Demo data co-located so the page can import a ready-to-use queue
export const FOCUS_DEMO_CANDIDATES: FocusCandidate[] = [
  {
    id: "c1",
    name: "Rina Wijaya",
    title: "Chief Financial Officer",
    company: "PT Telkom Indonesia",
    location: "Jakarta, Indonesia",
    years: 18,
    seniority: "C-Suite",
    score: 88,
    verdict: "strong_match",
    summary:
      "Seasoned CFO with 18 years of progressive experience in corporate finance, treasury, and strategic planning across Indonesia's telecommunications and technology sectors. Currently leading a 45-person finance team at PT Telkom Indonesia, managing a $2.1B revenue operation.",
    matchingSkills: [
      "Financial Planning & Analysis",
      "IFRS Compliance",
      "M&A Due Diligence",
      "Board Reporting",
      "Team Leadership",
      "Treasury Management",
      "Budgeting & Forecasting",
    ],
    missingSkills: ["IPO Readiness", "ESG Reporting"],
    extraSkills: ["SAP FICO", "Capital Markets", "Telecommunications"],
    career: [
      { role: "CFO", company: "PT Telkom Indonesia", period: "2020 – Present · 6 yrs" },
      { role: "VP Corporate Finance", company: "Indosat Ooredoo", period: "2016 – 2019 · 4 yrs" },
      { role: "Finance Director SEA", company: "Procter & Gamble", period: "2012 – 2016 · 4 yrs" },
    ],
    facts: { salary: "$200K – $250K USD", notice: "2 months", relocate: "Singapore, Bangkok" },
    breakdown: { skills: 82, experience: 90, seniority: 100, location: 70, semantic: 85 },
    strengths: [
      "18 years of progressive finance experience exceeds the 15-year minimum requirement",
      "Currently serving as CFO — direct seniority match for C-Suite requirement",
      "Strong IFRS compliance expertise aligns with Indorama's multinational reporting needs",
      "M&A due diligence experience directly relevant to Indorama's acquisition strategy",
      "Jakarta-based — no relocation required for the hybrid role",
    ],
    gaps: [
      "No direct experience in petrochemical or heavy manufacturing industry",
      "IPO readiness experience not evident — relevant if Indorama pursues Indonesia listing",
    ],
    concerns: ["2-month notice period at Telkom may delay start date if urgency is high"],
    recommendation:
      "Rina Wijaya is a strong candidate for the Indorama Ventures CFO position. Her current CFO tenure at Telkom demonstrates executive-level financial leadership at comparable scale ($2.1B revenue). While she lacks direct petrochemical industry experience, her background spanning telecom, FMCG (P&G), and consulting (Deloitte) shows adaptability across sectors. Recommend advancing to shortlist for client presentation.",
  },
  {
    id: "c2",
    name: "Priya Nair",
    title: "Group CFO",
    company: "Tata Motors SE Asia",
    location: "Singapore",
    years: 20,
    seniority: "C-Suite",
    score: 85,
    verdict: "strong_match",
    summary:
      "Group CFO with 20 years across automotive, industrial, and consumer sectors. Led a successful $480M IPO in 2022 and integrated three regional acquisitions. Multinational team leadership across India, Singapore, and Indonesia.",
    matchingSkills: ["M&A Due Diligence", "Board Reporting", "Team Leadership", "Treasury Management", "Budgeting & Forecasting"],
    missingSkills: ["Petrochemical experience"],
    extraSkills: ["IPO Execution", "Investor Relations", "Automotive"],
    career: [
      { role: "Group CFO", company: "Tata Motors SE Asia", period: "2019 – Present · 7 yrs" },
      { role: "Regional CFO", company: "Schneider Electric", period: "2014 – 2019 · 5 yrs" },
      { role: "Finance Director", company: "GE Capital", period: "2009 – 2014 · 5 yrs" },
    ],
    facts: { salary: "$240K – $290K USD", notice: "6 months", relocate: "Jakarta (open)" },
    breakdown: { skills: 90, experience: 95, seniority: 100, location: 55, semantic: 88 },
    strengths: [
      "20 years multinational finance leadership",
      "Successful IPO execution at Tata — rare on the local CFO market",
      "Cross-border M&A integration experience",
    ],
    gaps: ["Currently based in Singapore — relocation negotiation required"],
    concerns: ["6-month notice period at Tata is a meaningful timeline risk"],
    recommendation:
      "Exceptional pedigree with IPO and M&A track record. Friction comes from notice period and relocation. Worth a senior partner call before formal outreach.",
  },
  {
    id: "c3",
    name: "Amara Osei",
    title: "CFO",
    company: "Fonterra SEA",
    location: "Jakarta, Indonesia",
    years: 16,
    seniority: "C-Suite",
    score: 82,
    verdict: "strong_match",
    summary:
      "CFO at Fonterra SEA with deep IFRS and ESG reporting experience. Has built finance functions from the ground up in Jakarta and Manila. Strong board-facing presence and comfortable in regulated markets.",
    matchingSkills: ["IFRS Compliance", "Board Reporting", "Team Leadership", "Budgeting & Forecasting"],
    missingSkills: ["Manufacturing P&L scale"],
    extraSkills: ["ESG Reporting", "FMCG", "OJK liaison"],
    career: [
      { role: "CFO", company: "Fonterra SEA", period: "2021 – Present · 5 yrs" },
      { role: "Regional Finance Director", company: "Nestlé Indonesia", period: "2016 – 2021 · 5 yrs" },
      { role: "Senior Finance Manager", company: "Unilever", period: "2012 – 2016 · 4 yrs" },
    ],
    facts: { salary: "$185K – $220K USD", notice: "3 months", relocate: "Not required" },
    breakdown: { skills: 85, experience: 80, seniority: 100, location: 100, semantic: 75 },
    strengths: [
      "Jakarta-based CFO with no relocation friction",
      "ESG reporting depth aligns with Indorama's sustainability mandate",
      "Strong OJK and regulator relationships",
    ],
    gaps: ["FMCG industry adjacency rather than petrochemical"],
    concerns: [],
    recommendation:
      "Local CFO with directly translatable IFRS / ESG / board experience. Industry switch from FMCG to petrochemical is the main consideration. Strong shortlist candidate.",
  },
  {
    id: "c4",
    name: "Budi Santoso",
    title: "VP Finance",
    company: "Astra International",
    location: "Jakarta, Indonesia",
    years: 14,
    seniority: "VP",
    score: 76,
    verdict: "strong_match",
    summary:
      "VP Finance at Astra with strong manufacturing and treasury background. Ready for a CFO step-up. Deep SAP FICO implementation experience and a track record of working capital optimization.",
    matchingSkills: ["Treasury Management", "Budgeting & Forecasting", "Team Leadership"],
    missingSkills: ["CFO title", "Board Reporting at C-level"],
    extraSkills: ["SAP FICO", "Heavy Manufacturing", "Working Capital"],
    career: [
      { role: "VP Finance", company: "Astra International", period: "2019 – Present · 7 yrs" },
      { role: "Senior Finance Manager", company: "Astra International", period: "2015 – 2019 · 4 yrs" },
      { role: "Finance Manager", company: "Toyota Astra Motor", period: "2012 – 2015 · 3 yrs" },
    ],
    facts: { salary: "$160K – $190K USD", notice: "1 month", relocate: "Not required" },
    breakdown: { skills: 80, experience: 75, seniority: 70, location: 100, semantic: 78 },
    strengths: [
      "Direct manufacturing industry experience at Astra conglomerate",
      "Short notice period — fastest start of the shortlist",
      "Local Jakarta hire with cultural fit",
    ],
    gaps: ["Step-up from VP to CFO — not yet operating at C-level"],
    concerns: ["No prior board reporting in a Group CFO seat"],
    recommendation:
      "Strong upside candidate. The seniority step-up is meaningful but Astra's scale and his manufacturing exposure offset the gap. Worth a development-focused conversation.",
  },
  {
    id: "c5",
    name: "Patrick O'Brien",
    title: "Group Treasurer",
    company: "BHP Billiton",
    location: "Sydney, Australia",
    years: 19,
    seniority: "Director",
    score: 71,
    verdict: "possible_match",
    summary:
      "Group Treasurer at BHP with 19 years across mining and resources. Strong technical treasury and capital markets background but operates inside a CFO's office rather than as the CFO.",
    matchingSkills: ["Treasury Management", "Budgeting & Forecasting"],
    missingSkills: ["CFO title", "IFRS Compliance ownership", "Board Reporting"],
    extraSkills: ["Capital Markets", "Mining & Resources", "FX Hedging"],
    career: [
      { role: "Group Treasurer", company: "BHP Billiton", period: "2018 – Present · 8 yrs" },
      { role: "Head of Treasury Asia", company: "Rio Tinto", period: "2013 – 2018 · 5 yrs" },
      { role: "Treasury Manager", company: "Macquarie Bank", period: "2008 – 2013 · 5 yrs" },
    ],
    facts: { salary: "$220K – $260K USD", notice: "3 months", relocate: "Open (family)" },
    breakdown: { skills: 70, experience: 85, seniority: 70, location: 40, semantic: 80 },
    strengths: ["Resources industry alignment", "Deep treasury and capital markets bench"],
    gaps: ["Treasurer not generalist CFO", "Sydney-based"],
    concerns: ["May not want emerging markets move at this career stage"],
    recommendation:
      "Industry alignment is strong but profile is specialist. Best fit for a treasury-heavy CFO mandate — consider for adjacent roles.",
  },
  {
    id: "c6",
    name: "Dewi Anggraini",
    title: "VP Corporate Finance",
    company: "Indofood CBP",
    location: "Jakarta, Indonesia",
    years: 13,
    seniority: "VP",
    score: 68,
    verdict: "possible_match",
    summary:
      "VP Corporate Finance at Indofood CBP. Strong capital markets and investor relations background. Has led two bond issuances and a rights offering.",
    matchingSkills: ["IFRS Compliance", "Board Reporting", "Budgeting & Forecasting"],
    missingSkills: ["CFO title", "Team Leadership at scale", "M&A Due Diligence"],
    extraSkills: ["Capital Markets", "Investor Relations", "Bond Issuance"],
    career: [
      { role: "VP Corporate Finance", company: "Indofood CBP", period: "2020 – Present · 6 yrs" },
      { role: "Director, Corporate Finance", company: "Indofood CBP", period: "2017 – 2020 · 3 yrs" },
      { role: "Senior Analyst", company: "Mandiri Sekuritas", period: "2013 – 2017 · 4 yrs" },
    ],
    facts: { salary: "$140K – $170K USD", notice: "1 month", relocate: "Not required" },
    breakdown: { skills: 75, experience: 65, seniority: 65, location: 100, semantic: 70 },
    strengths: ["Capital markets specialism", "Jakarta-based with no relocation"],
    gaps: ["VP level — would be a stretch hire", "Food industry adjacency"],
    concerns: [],
    recommendation:
      "Promising local talent but a stretch into the CFO seat. Best as a tracked candidate for a future search.",
  },
  {
    id: "c7",
    name: "Sarah Mitchell",
    title: "Regional Finance Lead",
    company: "Unilever Indonesia",
    location: "Jakarta, Indonesia",
    years: 14,
    seniority: "Director",
    score: 64,
    verdict: "possible_match",
    summary:
      "Regional Finance Lead at Unilever Indonesia. FP&A specialist with a track record of driving cost transformation programs across SE Asia clusters.",
    matchingSkills: ["Financial Planning & Analysis", "Budgeting & Forecasting", "Team Leadership"],
    missingSkills: ["CFO title", "Treasury Management", "M&A Due Diligence"],
    extraSkills: ["FP&A", "Cost Transformation", "FMCG"],
    career: [
      { role: "Regional Finance Lead", company: "Unilever Indonesia", period: "2021 – Present · 5 yrs" },
      { role: "Finance Director", company: "Unilever Philippines", period: "2017 – 2021 · 4 yrs" },
      { role: "FP&A Manager", company: "Unilever UK", period: "2012 – 2017 · 5 yrs" },
    ],
    facts: { salary: "$155K – $185K USD", notice: "2 months", relocate: "Not required" },
    breakdown: { skills: 70, experience: 60, seniority: 60, location: 100, semantic: 65 },
    strengths: ["FP&A depth in a blue-chip multinational", "Jakarta-based"],
    gaps: ["Director not CFO", "14 yrs — slightly below 15+ target"],
    concerns: [],
    recommendation:
      "Solid finance leader below the brief's seniority bar. Worth keeping in the broader talent map.",
  },
  {
    id: "c8",
    name: "Tom Nguyen",
    title: "CFO",
    company: "Vietnam Dairy Products",
    location: "Ho Chi Minh, Vietnam",
    years: 17,
    seniority: "C-Suite",
    score: 59,
    verdict: "possible_match",
    summary:
      "CFO of a publicly listed Vietnamese dairy producer. Profile aligns to the brief technically but candidate is flagged Do Not Contact in the agency database.",
    matchingSkills: ["IFRS Compliance", "Board Reporting", "Team Leadership", "Treasury Management"],
    missingSkills: ["Indonesia regulatory experience"],
    extraSkills: ["Manufacturing", "Vietnamese Tax", "Listed Company Reporting"],
    career: [
      { role: "CFO", company: "Vietnam Dairy Products", period: "2018 – Present · 8 yrs" },
      { role: "Deputy CFO", company: "Masan Group", period: "2013 – 2018 · 5 yrs" },
      { role: "Audit Senior Manager", company: "EY Vietnam", period: "2009 – 2013 · 4 yrs" },
    ],
    facts: { salary: "$180K – $210K USD", notice: "—", relocate: "—" },
    breakdown: { skills: 75, experience: 80, seniority: 100, location: 30, semantic: 55 },
    strengths: ["CFO title at a listed manufacturer", "17 years finance experience"],
    gaps: ["Vietnam-based — full relocation required"],
    concerns: ["DNC flagged in agency database — excluded from outreach"],
    recommendation:
      "Profile aligns to the brief but DNC restriction prevents outreach. Cannot be shortlisted.",
    dnc: true,
  },
  {
    id: "c9",
    name: "James Chen",
    title: "Finance Director",
    company: "Wilmar International",
    location: "Singapore",
    years: 12,
    seniority: "Director",
    score: 55,
    verdict: "possible_match",
    summary:
      "Finance Director at Wilmar with exposure to agribusiness and commodities trading. Strong analytical background but earlier in his executive arc than the brief targets.",
    matchingSkills: ["Budgeting & Forecasting", "Team Leadership"],
    missingSkills: ["CFO title", "15+ years experience", "IFRS Compliance ownership"],
    extraSkills: ["Commodities", "Agri-business", "Trade Finance"],
    career: [
      { role: "Finance Director", company: "Wilmar International", period: "2021 – Present · 5 yrs" },
      { role: "Senior Finance Manager", company: "Olam International", period: "2017 – 2021 · 4 yrs" },
      { role: "Finance Manager", company: "Cargill", period: "2014 – 2017 · 3 yrs" },
    ],
    facts: { salary: "$140K – $170K USD", notice: "2 months", relocate: "Open" },
    breakdown: { skills: 65, experience: 55, seniority: 60, location: 50, semantic: 60 },
    strengths: ["Commodities industry adjacency"],
    gaps: ["Director level", "12 years tenure below the bar"],
    concerns: [],
    recommendation:
      "Industry adjacency is interesting but seniority and tenure are below the brief.",
  },
  {
    id: "c10",
    name: "Siti Rahayu",
    title: "Tax Director",
    company: "PwC Indonesia",
    location: "Jakarta, Indonesia",
    years: 15,
    seniority: "Director",
    score: 42,
    verdict: "weak_match",
    summary:
      "Tax Director at PwC Indonesia. Deep technical expert in Indonesian tax law but without operational P&L ownership.",
    matchingSkills: ["IFRS Compliance"],
    missingSkills: ["CFO title", "Treasury Management", "M&A Due Diligence", "Team Leadership at scale"],
    extraSkills: ["Indonesian Tax", "Transfer Pricing", "Big 4"],
    career: [
      { role: "Tax Director", company: "PwC Indonesia", period: "2019 – Present · 7 yrs" },
      { role: "Senior Manager Tax", company: "PwC Indonesia", period: "2014 – 2019 · 5 yrs" },
      { role: "Tax Manager", company: "Deloitte Indonesia", period: "2011 – 2014 · 3 yrs" },
    ],
    facts: { salary: "$130K – $160K USD", notice: "3 months", relocate: "Not required" },
    breakdown: { skills: 50, experience: 60, seniority: 50, location: 100, semantic: 30 },
    strengths: ["Deep Indonesian tax expertise"],
    gaps: ["Tax specialist not generalist CFO"],
    concerns: ["No operational P&L ownership"],
    recommendation:
      "Domain specialist without operational CFO experience. Not a fit for this generalist mandate.",
  },
];
