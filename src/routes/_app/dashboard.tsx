import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Users,
  Send,
  MessageSquare,
  Plus,
  FileText,
  Calendar,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { currentUser, projects } from "@/lib/mock-data";
import { CreateProjectWizard } from "@/components/projects/CreateProjectWizard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HireSmart" },
      { name: "description", content: "Recruitment operations command center." },
    ],
  }),
  component: DashboardPage,
});

// === Pipeline funnel ===========================================
const funnelStages = [
  { key: "applied", label: "Applied", count: 8 },
  { key: "screening", label: "Screening", count: 12 },
  { key: "shortlisted", label: "Shortlisted", count: 9 },
  { key: "submitted", label: "Submitted", count: 6 },
  { key: "interview", label: "Interview", count: 4 },
  { key: "offer", label: "Offer", count: 2 },
  { key: "placed", label: "Placed", count: 2 },
] as const;

// Progressively darker shades of brand teal (lightest → darkest)
const funnelShades = [
  "#B6F1EB", // brand-seafoam
  "#9FEBC1", // brand-mint
  "#5BCBB8",
  "#2E9DA6",
  "#1F7A87",
  "#0D5F71",
  "#004C66", // brand-primary
];

// === Upcoming actions ==========================================
type Urgency = "today" | "tomorrow" | "later";

const upcomingActions: {
  id: string;
  urgency: Urgency;
  icon: typeof Send;
  description: string;
  when: string;
  context: string;
  to: string;
}[] = [
  {
    id: "a1",
    urgency: "today",
    icon: Send,
    description: "3 follow-up messages pending approval",
    when: "Today",
    context: "CFO Search — Indorama",
    to: "/projects/p1",
  },
  {
    id: "a2",
    urgency: "today",
    icon: MessageSquare,
    description: "2 replies need classification review",
    when: "Today",
    context: "VP Ops — OYO Hotels",
    to: "/inbox",
  },
  {
    id: "a3",
    urgency: "tomorrow",
    icon: Users,
    description: "Review 5 new AI match results",
    when: "Tomorrow",
    context: "Country Director — KNS Group",
    to: "/projects/p3",
  },
  {
    id: "a4",
    urgency: "tomorrow",
    icon: FileText,
    description: "Send candidate shortlist to client",
    when: "Tomorrow",
    context: "Head of Digital — Stylo",
    to: "/projects/p4",
  },
  {
    id: "a5",
    urgency: "later",
    icon: Calendar,
    description: "Scheduled interview: Rina Wijaya × Indorama",
    when: "Thursday",
    context: "CFO Search — Indorama",
    to: "/projects/p1",
  },
  {
    id: "a6",
    urgency: "later",
    icon: UserPlus,
    description: "4 inbound applications to process",
    when: "This week",
    context: "Multiple roles",
    to: "/candidates",
  },
];

const urgencyDot: Record<Urgency, string> = {
  today: "bg-status-success",
  tomorrow: "bg-status-warning",
  later: "bg-status-neutral/60",
};

// === Activity feed =============================================
const activityItems = [
  { id: "ac1", initials: "PS", text: "Priya shortlisted Rina Wijaya for CFO Search — Indorama", time: "1 hour ago" },
  { id: "ac2", initials: "DW", text: "Dewi sent 4 outreach messages for VP Ops — OYO Hotels", time: "2 hours ago" },
  { id: "ac3", initials: "AI", text: "System parsed 3 uploaded CVs", time: "3 hours ago" },
  { id: "ac4", initials: "PS", text: "Priya moved Budi Santoso to Interview stage", time: "5 hours ago" },
  { id: "ac5", initials: "DW", text: "Dewi created campaign: Country Director Outreach — KNS", time: "Yesterday at 4:12 PM" },
  { id: "ac6", initials: "IV", text: "Client portal: Indorama submitted new role brief", time: "Yesterday at 11:48 AM" },
  { id: "ac7", initials: "AI", text: "AI matching completed: 28 candidates scored for VP Ops", time: "Yesterday at 9:02 AM" },
  { id: "ac8", initials: "PS", text: "Priya added Oasis Water International as a new client", time: "2 days ago" },
];

// === Spark line (4-week candidate additions) ==================
const sparkPoints = [4, 7, 6, 9, 11, 8, 12];
function SparkLine() {
  const w = 120;
  const h = 28;
  const max = Math.max(...sparkPoints);
  const min = Math.min(...sparkPoints);
  const range = max - min || 1;
  const step = w / (sparkPoints.length - 1);
  const path = sparkPoints
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={path} fill="none" stroke="var(--brand-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Greeting ==================================================
function greetingPrefix() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];
  const [greeting, setGreeting] = useState<string>("Hello");
  useEffect(() => setGreeting(greetingPrefix()), []);
  const [funnelFilter, setFunnelFilter] = useState<string>("all");
  const [wizardOpen, setWizardOpen] = useState(false);

  const totalCandidates = funnelStages.reduce((s, x) => s + x.count, 0);
  const activeProjectCount = projects.filter(
    (p) => !["closed", "placed", "on_hold", "draft"].includes(p.status),
  ).length;

  const segments = useMemo(
    () =>
      funnelStages.map((s, i) => ({
        ...s,
        pct: (s.count / totalCandidates) * 100,
        color: funnelShades[i],
      })),
    [totalCandidates],
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${greeting}, ${firstName}`}
        actions={
          <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary/90">
            <Link to="/projects">
              <Plus className="mr-1.5 h-4 w-4" />
              Create project
            </Link>
          </Button>
        }
      />

      {/* === Stats row =========================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={7} icon={Briefcase} trend={{ value: 2, direction: "up" }} />
        <StatCard label="Candidates in pipeline" value={43} icon={Users} trend={{ value: 12, direction: "up" }} />
        <StatCard label="Messages sent (this week)" value={28} icon={Send} />
        <RepliesAttentionCard />
      </div>

      {/* === Two-column layout ================================== */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT — Pipeline + Upcoming */}
        <div className="space-y-6 xl:col-span-2">
          {/* Pipeline overview */}
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6 pb-4">
              <h2 className="text-[18px] font-semibold text-brand-text">Pipeline overview</h2>
              <Select value={funnelFilter} onValueChange={setFunnelFilter}>
                <SelectTrigger className="h-8 w-[220px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {p.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-6 pt-5">
              <TooltipProvider delayDuration={100}>
                <div className="flex h-10 w-full overflow-hidden rounded-full">
                  {segments.map((seg, i) => (
                    <Tooltip key={seg.key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "group relative h-full transition-opacity hover:opacity-90",
                            i === 0 && "rounded-l-full",
                            i === segments.length - 1 && "rounded-r-full",
                          )}
                          style={{
                            width: `${seg.pct}%`,
                            backgroundColor: seg.color,
                          }}
                          aria-label={`${seg.label}: ${seg.count}`}
                        >
                          <span
                            className={cn(
                              "absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums",
                              i >= 4 ? "text-white" : "text-brand-primary",
                            )}
                          >
                            {seg.count}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-medium">{seg.label}</div>
                          <div className="text-brand-text-secondary">
                            {seg.count} · {seg.pct.toFixed(0)}% of pipeline
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {/* Stage labels */}
              <div className="mt-3 flex w-full text-[11px] font-medium text-brand-text-secondary">
                {segments.map((seg) => (
                  <div key={seg.key} className="text-center" style={{ width: `${seg.pct}%` }}>
                    <span className="truncate px-1">{seg.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-brand-text-secondary">
                {totalCandidates} total candidates across {activeProjectCount} active projects
              </p>
            </div>
          </section>

          {/* Upcoming actions */}
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6 pb-4">
              <h2 className="text-[18px] font-semibold text-brand-text">Upcoming actions</h2>
              <Link to="/inbox" className="text-xs font-medium text-brand-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {upcomingActions.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <Link
                      to={a.to}
                      className="flex cursor-pointer items-center gap-3 px-6 py-3.5 transition-colors hover:bg-brand-bg"
                    >
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", urgencyDot[a.urgency])} />
                      <Icon className="h-4 w-4 shrink-0 text-brand-text-secondary" />
                      <span className="flex-1 truncate text-sm text-brand-text">{a.description}</span>
                      <span className="shrink-0 text-xs text-brand-text-secondary">
                        {a.when} · <span className="text-brand-primary">{a.context}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* RIGHT — Activity + mini stats */}
        <div className="space-y-6">
          {/* Recent activity */}
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-6 pb-4">
              <h2 className="text-[18px] font-semibold text-brand-text">Recent activity</h2>
            </div>
            <div className="p-6 pt-5">
              <ol className="relative space-y-4 border-l border-border pl-5">
                {activityItems.map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[30px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary ring-4 ring-card">
                      {item.initials}
                    </span>
                    <p className="text-[13px] leading-snug text-brand-text">{item.text}</p>
                    <p className="mt-0.5 text-xs text-brand-text-secondary">{item.time}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Database growth */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
                  Database growth
                </div>
                <div className="mt-1 text-2xl font-semibold text-brand-text tabular-nums">34</div>
                <div className="mt-0.5 text-xs text-brand-text-secondary">
                  Candidates added this month
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-status-success">
                  <TrendingUp className="h-3 w-3" /> 18% vs last month
                </div>
              </div>
              <SparkLine />
            </div>
          </section>

          {/* Outreach health */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
              Outreach health
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-brand-text tabular-nums">17.3%</span>
              <span className="text-xs text-brand-text-secondary">response rate · 30 days</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-primary"
                style={{ width: "17.3%" }}
              />
            </div>
            <div className="mt-2 text-xs font-medium text-status-success">
              Industry avg: 12% · above average
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Replies attention card — same shape as StatCard, amber-tinted icon + left border
function RepliesAttentionCard() {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border border-l-4 border-l-status-warning bg-card p-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Replies awaiting action
        </div>
        <div className="mt-1.5 text-2xl font-semibold text-brand-text tabular-nums">5</div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-status-warning">
          Needs attention
        </div>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-warning/15 text-status-warning">
        <MessageSquare className="h-5 w-5" />
      </div>
    </div>
  );
}
