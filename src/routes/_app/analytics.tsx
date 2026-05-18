import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Briefcase,
  Users,
  Target,
  Clock,
  Send,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Lightbulb,
  Star,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — HireSmart" }] }),
  component: AnalyticsPage,
});

// ---------- Date range ----------
const PRESETS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This quarter",
  "This year",
  "All time",
] as const;
type Preset = (typeof PRESETS)[number];

const RANGE_LABEL: Record<Preset, string> = {
  "Last 7 days": "Mar 25 – Mar 31, 2026",
  "Last 30 days": "Mar 1 – Mar 31, 2026",
  "Last 90 days": "Jan 1 – Mar 31, 2026",
  "This quarter": "Jan 1 – Mar 31, 2026",
  "This year": "Jan 1 – Mar 31, 2026",
  "All time": "All time",
};

const FACTORS: Record<Preset, number> = {
  "Last 7 days": 0.3,
  "Last 30 days": 1,
  "Last 90 days": 2.5,
  "This quarter": 2.5,
  "This year": 6,
  "All time": 12,
};

function AnalyticsPage() {
  const [preset, setPreset] = useState<Preset>("Last 30 days");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const factor = FACTORS[preset];

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
    setOpen(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        title="Analytics"
        subtitle={`Workspace performance · ${preset} · ${RANGE_LABEL[preset]}`}
        actions={
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-brand-text hover:border-brand-primary">
                  {preset} · {RANGE_LABEL[preset]}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-1">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePresetChange(p)}
                    className={cn(
                      "block w-full rounded-md px-3 py-2 text-left text-sm",
                      p === preset
                        ? "bg-brand-primary text-white"
                        : "text-brand-text hover:bg-brand-bg",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => toast.success("CSV exported")}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      <div className={cn("transition-opacity", loading && "animate-pulse opacity-50")}>
        <KPIRow factor={factor} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FunnelCard />
          <SourceCard />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RecruiterCard />
          <OutreachCard />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RejectionCard />
          <TimeCard />
        </div>

        <PlacementsCard />
      </div>
    </div>
  );
}

// ---------- Card wrapper ----------
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-brand-text">{title}</h2>
        {subtitle && <span className="text-xs text-brand-text-secondary">{subtitle}</span>}
      </header>
      {children}
    </section>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-brand-bg p-3">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
      <p className="text-[13px] italic text-brand-text-secondary">{children}</p>
    </div>
  );
}

// ---------- KPI row ----------
interface KPI {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  direction: "up" | "down" | "flat";
  improvement: "good" | "bad" | "neutral";
  accent?: "green" | "purple";
}

const KPIS: KPI[] = [
  { icon: Briefcase, label: "Active projects", value: "7", trend: "+2 vs last period", direction: "up", improvement: "neutral" },
  { icon: Users, label: "Total candidates", value: "142", trend: "+34 this period", direction: "up", improvement: "neutral" },
  { icon: Target, label: "Placements (period)", value: "2", trend: "Same as last period", direction: "flat", improvement: "neutral", accent: "green" },
  { icon: Clock, label: "Avg time-to-fill", value: "6.2 wks", trend: "-0.8 wks improvement", direction: "down", improvement: "good" },
  { icon: Send, label: "Outreach response rate", value: "17.3%", trend: "+2.1% vs last period", direction: "up", improvement: "good" },
  { icon: ThumbsUp, label: "AI match accuracy", value: "78%", trend: "+5% vs last period", direction: "up", improvement: "good", accent: "purple" },
];

function KPIRow() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {KPIS.map((k) => {
        const Icon = k.icon;
        const TrendIcon =
          k.direction === "flat" ? Minus : k.direction === "up" ? TrendingUp : TrendingDown;
        const trendColor =
          k.improvement === "good"
            ? "text-status-success"
            : k.improvement === "bad"
              ? "text-status-danger"
              : "text-brand-text-secondary";
        const iconBg =
          k.accent === "green"
            ? "bg-status-success/15 text-status-success"
            : k.accent === "purple"
              ? "bg-brand-magenta/15 text-brand-magenta"
              : "bg-brand-mint/30 text-brand-primary";
        return (
          <div
            key={k.label}
            className="rounded-xl border border-gray-100 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
                {k.label}
              </span>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", iconBg)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-brand-text">{k.value}</div>
            <div className={cn("mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {k.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Funnel ----------
const FUNNEL = [
  { stage: "Applied", count: 43 },
  { stage: "Screening", count: 31 },
  { stage: "Shortlisted", count: 18 },
  { stage: "Submitted to client", count: 12 },
  { stage: "Interview", count: 7 },
  { stage: "Offer", count: 3 },
  { stage: "Placed", count: 2 },
];

function FunnelCard() {
  const top = FUNNEL[0].count;
  // compute drop-offs
  const drops = FUNNEL.slice(1).map((s, i) => ({
    from: FUNNEL[i].stage,
    to: s.stage,
    survived: Math.round((s.count / FUNNEL[i].count) * 100),
    dropped: 100 - Math.round((s.count / FUNNEL[i].count) * 100),
  }));
  const biggest = [...drops].sort((a, b) => b.dropped - a.dropped)[0];

  return (
    <Card title="Pipeline funnel" subtitle="All active projects">
      <div className="flex flex-col gap-1.5">
        {FUNNEL.map((s, i) => {
          const widthPct = Math.max((s.count / top) * 100, 14); // min visible width
          const conv = Math.round((s.count / top) * 100);
          const opacity = 0.3 + (i / (FUNNEL.length - 1)) * 0.7;
          return (
            <div key={s.stage}>
              <div className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-[13px] text-brand-text">{s.stage}</div>
                <div className="flex-1">
                  <div className="mx-auto flex h-9 items-center justify-end rounded-lg px-3 text-sm font-medium text-white"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: `rgba(0, 76, 102, ${opacity})`,
                    }}
                  >
                    {s.count}
                  </div>
                </div>
                <div className="w-12 shrink-0 text-right text-xs text-brand-text-secondary tabular-nums">
                  {conv}%
                </div>
              </div>
              {i < FUNNEL.length - 1 && (
                <div className="my-0.5 flex items-center justify-center text-[11px] text-brand-text-secondary">
                  ↓ {drops[i].survived}% survived
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-status-warning/10 px-3 py-2 text-[12px] text-status-warning">
        <AlertTriangle className="h-3.5 w-3.5" />
        Biggest drop: {biggest.from} → {biggest.to} ({biggest.dropped}% drop-off)
      </div>
    </Card>
  );
}

// ---------- Sources ----------
const SOURCES = [
  { source: "LinkedIn", candidates: 48, placed: 4, conv: 8.3 },
  { source: "CV Upload", candidates: 35, placed: 2, conv: 5.7 },
  { source: "Chrome Extension", candidates: 22, placed: 1, conv: 4.5 },
  { source: "Inbound (portal)", candidates: 18, placed: 0, conv: 0 },
  { source: "Referral", candidates: 8, placed: 1, conv: 12.5 },
  { source: "CSV Import", candidates: 7, placed: 0, conv: 0 },
  { source: "Manual", candidates: 4, placed: 0, conv: 0 },
];

function SourceCard() {
  const max = Math.max(...SOURCES.map((s) => s.candidates));
  const best = [...SOURCES].sort((a, b) => b.conv - a.conv)[0];
  return (
    <Card title="Source effectiveness" subtitle="Sourced vs placed">
      <div className="flex flex-col gap-3">
        {SOURCES.map((s) => {
          const w = (s.candidates / max) * 100;
          const placedW = s.candidates > 0 ? (s.placed / s.candidates) * w : 0;
          const isBest = s.source === best.source;
          return (
            <div key={s.source} className="grid grid-cols-[140px_1fr_60px] items-center gap-3">
              <div className="flex items-center gap-1.5 text-[13px] text-brand-text">
                {s.source}
                {isBest && (
                  <Star className="h-3 w-3 fill-status-success text-status-success" />
                )}
              </div>
              <div className="relative h-6">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-brand-seafoam"
                  style={{ width: `${w}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-brand-primary"
                  style={{ width: `${placedW}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-brand-text">
                  {s.candidates} · {s.placed} placed
                </div>
              </div>
              <div className="text-right text-xs tabular-nums text-brand-text-secondary">
                {s.conv}%
              </div>
            </div>
          );
        })}
      </div>
      <Insight>
        Referrals have the highest conversion rate at 12.5% — consider incentivizing referral programs.
      </Insight>
    </Card>
  );
}

// ---------- Recruiter ----------
interface Recruiter {
  name: string;
  projects: number;
  sourced: number;
  shortlisted: number;
  placed: number;
  ttf: string;
  response: number;
}

const RECRUITERS: Recruiter[] = [
  { name: "Amarsh Jain", projects: 4, sourced: 62, shortlisted: 14, placed: 5, ttf: "5.8 wks", response: 19.2 },
  { name: "Dewi Putri", projects: 3, sourced: 51, shortlisted: 11, placed: 3, ttf: "6.4 wks", response: 16.1 },
  { name: "Rahul Mehta", projects: 2, sourced: 29, shortlisted: 5, placed: 0, ttf: "—", response: 12.8 },
];

function initials(n: string) {
  return n.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function RecruiterCard() {
  const max = {
    projects: Math.max(...RECRUITERS.map((r) => r.projects)),
    sourced: Math.max(...RECRUITERS.map((r) => r.sourced)),
    shortlisted: Math.max(...RECRUITERS.map((r) => r.shortlisted)),
    placed: Math.max(...RECRUITERS.map((r) => r.placed)),
    response: Math.max(...RECRUITERS.map((r) => r.response)),
  };
  const hl = "bg-status-success/10";
  return (
    <Card title="Recruiter performance">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 text-left font-medium">Recruiter</th>
              <th className="py-2 text-right font-medium">Projects</th>
              <th className="py-2 text-right font-medium">Sourced</th>
              <th className="py-2 text-right font-medium">Shortlist</th>
              <th className="py-2 text-right font-medium">Placed</th>
              <th className="py-2 text-right font-medium">TTF</th>
              <th className="py-2 text-right font-medium">Resp.</th>
            </tr>
          </thead>
          <tbody>
            {RECRUITERS.map((r) => (
              <tr key={r.name} className="border-b border-gray-50 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam/40 text-[11px] font-semibold text-brand-primary">
                      {initials(r.name)}
                    </div>
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                </td>
                <td className={cn("py-3 text-right tabular-nums", r.projects === max.projects && hl)}>{r.projects}</td>
                <td className={cn("py-3 text-right tabular-nums", r.sourced === max.sourced && hl)}>{r.sourced}</td>
                <td className={cn("py-3 text-right tabular-nums", r.shortlisted === max.shortlisted && hl)}>{r.shortlisted}</td>
                <td className={cn("py-3 text-right tabular-nums font-medium", r.placed > 0 ? "text-status-success" : "text-brand-text-secondary", r.placed === max.placed && r.placed > 0 && hl)}>
                  {r.placed}
                </td>
                <td className="py-3 text-right tabular-nums text-brand-text-secondary">{r.ttf}</td>
                <td className={cn("py-3 text-right tabular-nums", r.response === max.response && hl)}>
                  <div className="inline-flex flex-col items-end">
                    <span>{r.response}%</span>
                    <div className="mt-1 h-1 w-[60px] overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-brand-primary" style={{ width: `${(r.response / 25) * 100}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------- Outreach ----------
const RESPONSE_TREND = [12, 14, 13, 15, 16, 14, 17, 17.3];
const REPLIES = [
  { label: "Interested", value: 35, color: "#16A34A" },
  { label: "Not interested", value: 30, color: "#9CA3AF" },
  { label: "Needs review", value: 15, color: "#D97706" },
  { label: "Out of office", value: 12, color: "#3B82F6" },
  { label: "Referral", value: 5, color: "#6C0042" },
  { label: "Other", value: 3, color: "#E5E7EB" },
];

function OutreachCard() {
  return (
    <Card title="Outreach analytics">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Response rate (last 8 weeks)
        </p>
        <LineChart data={RESPONSE_TREND} />
      </div>
      <div className="mt-6 border-t border-gray-100 pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Reply classification (34 replies)
        </p>
        <div className="flex items-center gap-6">
          <DonutChart data={REPLIES} total={34} />
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {REPLIES.map((r) => (
              <li key={r.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-brand-text">{r.label}</span>
                <span className="text-brand-text-secondary">{r.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function LineChart({ data }: { data: number[] }) {
  const W = 400;
  const H = 160;
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const yMin = 5;
  const yMax = 20;
  const xStep = (W - padL - padR) / (data.length - 1);
  const yScale = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB);
  const points = data.map((v, i) => [padL + i * xStep, yScale(v)] as const);
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const benchmarkY = yScale(12);
  const grid = [10, 15, 20];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label="Response rate over time">
      {grid.map((g) => (
        <g key={g}>
          <line x1={padL} y1={yScale(g)} x2={W - padR} y2={yScale(g)} stroke="#E5E7EB" strokeDasharray="4 4" />
          <text x={4} y={yScale(g) + 3} fontSize="9" fill="#9CA3AF">{g}%</text>
        </g>
      ))}
      <line x1={padL} y1={benchmarkY} x2={W - padR} y2={benchmarkY} stroke="#9CA3AF" strokeDasharray="3 3" />
      <text x={W - padR - 60} y={benchmarkY - 4} fontSize="9" fill="#9CA3AF">Industry avg 12%</text>
      <path d={path} fill="none" stroke="#004C66" strokeWidth="2" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#004C66" stroke="white" strokeWidth="2" />
          <text x={x} y={H - 8} fontSize="9" fill="#9CA3AF" textAnchor="middle">W{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) {
  const C = 80;
  const R = 60;
  const SW = 20;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="relative h-[160px] w-[160px] shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx={C} cy={C} r={R} fill="none" stroke="#F3F4F6" strokeWidth={SW} />
        {data.map((d) => {
          const len = (d.value / 100) * circumference;
          const seg = (
            <circle
              key={d.label}
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth={SW}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-semibold text-brand-text">{total}</span>
        <span className="text-[11px] text-brand-text-secondary">replies</span>
      </div>
    </div>
  );
}

// ---------- Rejection ----------
const REJECTIONS = [
  { reason: "Skills mismatch", count: 12, pct: 32 },
  { reason: "Experience gap", count: 8, pct: 21 },
  { reason: "Salary expectations", count: 6, pct: 16 },
  { reason: "Client rejected", count: 5, pct: 13 },
  { reason: "Candidate withdrew", count: 4, pct: 11 },
  { reason: "Cultural fit", count: 2, pct: 5 },
  { reason: "Position filled", count: 1, pct: 3 },
];

function RejectionCard() {
  const max = Math.max(...REJECTIONS.map((r) => r.count));
  return (
    <Card title="Rejection reasons">
      <div className="flex flex-col gap-2">
        {REJECTIONS.map((r, i) => {
          const w = (r.count / max) * 100;
          const opacity = 1 - i * 0.1;
          return (
            <div key={r.reason} className="grid grid-cols-[160px_1fr_70px] items-center gap-3">
              <div className="text-[13px] text-brand-text">{r.reason}</div>
              <div className="h-7 w-full overflow-hidden rounded-md bg-gray-50">
                <div
                  className="h-full rounded-md"
                  style={{ width: `${w}%`, backgroundColor: `rgba(0, 76, 102, ${opacity})` }}
                />
              </div>
              <div className="text-right text-xs tabular-nums text-brand-text-secondary">
                {r.count} · {r.pct}%
              </div>
            </div>
          );
        })}
      </div>
      <Insight>
        Skills mismatch is the #1 rejection reason — consider adjusting JD requirements or expanding search criteria.
      </Insight>
    </Card>
  );
}

// ---------- Time analytics ----------
const STAGE_TIME = [
  { stage: "Applied", days: 1.2, color: "#9FEBC1" },
  { stage: "Screening", days: 3.8, color: "#B6F1EB" },
  { stage: "Shortlisted", days: 2.5, color: "#FFCEE7" },
  { stage: "Submitted to client", days: 5.1, color: "#D97706" },
  { stage: "Interview", days: 4.3, color: "#004C66" },
  { stage: "Offer", days: 3.2, color: "#6C0042" },
];

const TTF_TREND = [
  { date: "Aug", weeks: 8.2 },
  { date: "Sep", weeks: 7.5 },
  { date: "Oct", weeks: 6.8 },
  { date: "Nov", weeks: 7.1 },
  { date: "Dec", weeks: 6.2 },
  { date: "Mar", weeks: 6.0 },
];

function TimeCard() {
  const max = Math.max(...STAGE_TIME.map((s) => s.days));
  const longest = [...STAGE_TIME].sort((a, b) => b.days - a.days)[0];
  return (
    <Card title="Time analytics">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
        Average time-in-stage (days)
      </p>
      <div className="flex flex-col gap-1.5">
        {STAGE_TIME.map((s) => (
          <div key={s.stage} className="grid grid-cols-[140px_1fr_40px] items-center gap-3">
            <div className="text-[13px] text-brand-text">{s.stage}</div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-gray-50">
              <div
                className="h-full rounded-md"
                style={{ width: `${(s.days / max) * 100}%`, backgroundColor: s.color }}
              />
            </div>
            <div className="text-right text-xs tabular-nums text-brand-text-secondary">
              {s.days}d
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] italic text-brand-text-secondary">
        {longest.stage} averages {longest.days} days — consider following up with clients on shortlist reviews.
      </p>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Time-to-fill trend (last 6 placements)
        </p>
        <TTFChart />
      </div>
    </Card>
  );
}

function TTFChart() {
  const W = 400;
  const H = 160;
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const yMin = 5;
  const yMax = 9;
  const target = 6;
  const xStep = (W - padL - padR) / (TTF_TREND.length - 1);
  const yScale = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB);
  const points = TTF_TREND.map((d, i) => [padL + i * xStep, yScale(d.weeks)] as const);
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const targetY = yScale(target);
  const grid = [6, 7, 8];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label="Time to fill trend">
      {grid.map((g) => (
        <g key={g}>
          <line x1={padL} y1={yScale(g)} x2={W - padR} y2={yScale(g)} stroke="#E5E7EB" strokeDasharray="4 4" />
          <text x={4} y={yScale(g) + 3} fontSize="9" fill="#9CA3AF">{g}w</text>
        </g>
      ))}
      <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke="#16A34A" strokeDasharray="4 4" />
      <text x={W - padR - 76} y={targetY - 4} fontSize="9" fill="#16A34A">Target: 6 weeks</text>
      <path d={path} fill="none" stroke="#004C66" strokeWidth="2" strokeLinecap="round" />
      {TTF_TREND.map((d, i) => {
        const [x, y] = points[i];
        const color = d.weeks <= target ? "#16A34A" : "#D97706";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill={color} stroke="white" strokeWidth="2" />
            <text x={x} y={H - 8} fontSize="9" fill="#9CA3AF" textAnchor="middle">{d.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Placements ----------
interface Placement {
  candidateId: string;
  candidate: string;
  role: string;
  projectId: string;
  client: string;
  date: string;
  ttf: string;
  recruiter: string;
}

const PLACEMENTS: Placement[] = [
  {
    candidateId: "diana-lim",
    candidate: "Diana Lim",
    role: "Head of Digital Transformation",
    projectId: "indorama-cfo",
    client: "Indorama Ventures",
    date: "Nov 2025",
    ttf: "7.1 wks",
    recruiter: "Amarsh",
  },
  {
    candidateId: "ravi-patel",
    candidate: "Ravi Patel",
    role: "Regional Sales Director",
    projectId: "oasis-sales",
    client: "Oasis Water",
    date: "Sep 2025",
    ttf: "6.2 wks",
    recruiter: "Dewi",
  },
];

function PlacementsCard() {
  return (
    <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-brand-text">Recent placements</h2>
        <span className="text-[13px] text-brand-text-secondary">All time: 8 placements</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 font-medium">Candidate</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Client</th>
              <th className="py-2 font-medium">Placed</th>
              <th className="py-2 text-right font-medium">Time-to-fill</th>
              <th className="py-2 font-medium">Recruiter</th>
            </tr>
          </thead>
          <tbody>
            {PLACEMENTS.map((p) => (
              <tr
                key={p.candidateId}
                className="border-l-4 border-status-success/70 border-b border-gray-50 last:border-b-0"
              >
                <td className="py-3 pl-3">
                  <Link
                    to="/candidates/$id"
                    params={{ id: p.candidateId }}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {p.candidate}
                  </Link>
                </td>
                <td className="py-3 text-brand-text">{p.role}</td>
                <td className="py-3">
                  <Link
                    to="/projects/$id"
                    params={{ id: p.projectId }}
                    className="text-brand-primary hover:underline"
                  >
                    {p.client}
                  </Link>
                </td>
                <td className="py-3 text-brand-text-secondary">{p.date}</td>
                <td className="py-3 text-right tabular-nums">{p.ttf}</td>
                <td className="py-3 text-brand-text-secondary">{p.recruiter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
