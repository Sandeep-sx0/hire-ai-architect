import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { toast } from "sonner";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Archive,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Flag,
  GitBranch,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, EmptyState } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  projects,
  clients,
  getJobsByProject,
  type Job,
  type JobStatus,
  type ProjectStatus,
} from "@/lib/mock-data";
import { MatchResults } from "@/components/match/MatchResults";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";

const tabSchema = z.object({
  tab: fallback(
    z.enum(["overview", "jobs", "candidates", "pipeline", "activity"]),
    "overview",
  ).default("overview"),
});

export const Route = createFileRoute("/_app/projects/$id")({
  validateSearch: zodValidator(tabSchema),
  head: () => ({ meta: [{ title: "Project — Norvex" }] }),
  component: ProjectDetail,
});

const SENIORITY_LABEL: Record<string, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  senior_manager: "Sr. Manager",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid",
  junior: "Junior",
};

const PROJECT_STATUSES: ProjectStatus[] = [
  "draft",
  "open",
  "sourcing",
  "shortlisted",
  "interviewing",
  "offer",
  "placed",
  "closed",
  "on_hold",
];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Derive target close window per seniority (in days from creation)
function targetWindowDays(seniority: string): number {
  switch (seniority) {
    case "c_suite":
      return 75;
    case "vp":
    case "director":
      return 60;
    case "senior_manager":
    case "manager":
      return 45;
    default:
      return 35;
  }
}

// Stable hash for synthesized fields
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Priority = "low" | "medium" | "high" | "urgent";
function priorityOf(job: Job): Priority {
  const order: Priority[] = ["medium", "high", "low", "urgent", "high", "medium"];
  return order[hash(job.id) % order.length];
}

const PRIORITY_STYLE: Record<Priority, string> = {
  urgent: "bg-status-danger/15 text-status-danger",
  high: "bg-status-warning/15 text-status-warning",
  medium: "bg-brand-seafoam text-brand-primary",
  low: "bg-status-neutral/15 text-status-neutral",
};

interface JobDerived extends Job {
  daysToClose: number; // negative = overdue
  isOverdue: boolean;
  bucket: "active" | "on_hold" | "filled" | "closed_unfilled" | "overdue";
  priority: Priority;
  targetCloseLabel: string;
}

function deriveJob(job: Job): JobDerived {
  const window = targetWindowDays(job.seniorityLevel);
  const daysToClose = window - job.daysOpen;
  const priority = priorityOf(job);
  const filledStatuses: JobStatus[] = ["placed"];
  const closedStatuses: JobStatus[] = ["closed"];
  const onHoldStatuses: JobStatus[] = ["on_hold"];

  let bucket: JobDerived["bucket"] = "active";
  if (filledStatuses.includes(job.status) || job.positionsFilled >= job.headcount) {
    bucket = "filled";
  } else if (closedStatuses.includes(job.status)) {
    bucket = "closed_unfilled";
  } else if (onHoldStatuses.includes(job.status)) {
    bucket = "on_hold";
  }

  const isOverdue =
    daysToClose < 0 && bucket !== "filled" && bucket !== "closed_unfilled";
  if (isOverdue) bucket = "overdue";

  const targetCloseLabel =
    daysToClose >= 0
      ? `in ${daysToClose}d`
      : `${Math.abs(daysToClose)}d overdue`;

  return { ...job, daysToClose, isOverdue, bucket, priority, targetCloseLabel };
}

function ProjectNotFound({ id }: { id?: string }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl py-16">
      <EmptyState
        icon={Briefcase}
        title="Project not found"
        description={`No project with ID "${id ?? "unknown"}" exists. It may have been archived or the link may be stale.`}
        actionLabel="Back to projects"
        onAction={() => navigate({ to: "/projects" })}
      />
    </div>
  );
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [matching, setMatching] = useState(false);
  const project = projects.find((p) => p.id === id);
  if (!project) return <ProjectNotFound id={id} />;
  const client = clients.find((c) => c.id === project.clientId);
  const isFreshProject = ["draft", "open"].includes(project.status);
  const [hasMatched, setHasMatched] = useState(() => !isFreshProject);
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(project.status);

  const rawJobs = getJobsByProject(project.id);
  const jobs = useMemo(() => rawJobs.map(deriveJob), [rawJobs]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => !["placed", "closed", "on_hold"].includes(j.status)).length;
    const closedJobs = totalJobs - activeJobs;
    const overdueJobs = jobs.filter((j) => j.isOverdue).length;
    const totalHeadcount = jobs.reduce((s, j) => s + j.headcount, 0);
    const filledHeadcount = jobs.reduce((s, j) => s + j.positionsFilled, 0);
    const openHeadcount = Math.max(0, totalHeadcount - filledHeadcount);
    return {
      totalJobs,
      activeJobs,
      closedJobs,
      overdueJobs,
      totalHeadcount,
      filledHeadcount,
      openHeadcount,
    };
  }, [jobs]);

  const runMatching = async () => {
    setMatching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMatching(false);
    setHasMatched(true);
    navigate({ search: { tab: "candidates" } });
    toast.success("Matching complete — candidates scored");
  };

  const setTab = (next: typeof tab) => navigate({ search: { tab: next } });

  const TABS = [
    { id: "overview" as const, label: "Overview", icon: FileText, badge: null as string | null },
    {
      id: "jobs" as const,
      label: "Jobs",
      icon: Briefcase,
      badge: jobs.length > 0 ? String(jobs.length) : null,
    },
    {
      id: "candidates" as const,
      label: "Candidates",
      icon: Users,
      badge: project.candidates > 0 ? String(project.candidates) : null,
    },
    {
      id: "pipeline" as const,
      label: "Pipeline",
      icon: GitBranch,
      badge: project.shortlisted > 0 ? `${project.shortlisted} shortlisted` : null,
    },
    { id: "activity" as const, label: "Activity", icon: ActivityIcon, badge: null },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-text-secondary">
        <Link to="/projects" className="hover:text-brand-text hover:underline">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-brand-text">{project.title}</span>
      </nav>

      {/* Header */}
      <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-semibold leading-tight text-brand-text">
              {project.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Link
                to="/clients/$id"
                params={{ id: project.clientId }}
                className="inline-flex items-center gap-1.5 font-medium text-brand-primary hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" />
                {project.clientName}
              </Link>
              {client && (
                <>
                  <span className="text-brand-text-secondary">·</span>
                  <span className="rounded-full bg-brand-seafoam px-2.5 py-0.5 text-[11px] font-medium text-brand-primary">
                    {client.industry}
                  </span>
                </>
              )}
              <span className="text-brand-text-secondary">·</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1">
                    <StatusBadge status={currentStatus} />
                    <ChevronRight className="h-3 w-3 rotate-90 text-brand-text-secondary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Change status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PROJECT_STATUSES.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => {
                        setCurrentStatus(s);
                        toast.success(`Status changed to ${s.replace("_", " ")}`);
                      }}
                    >
                      <StatusBadge status={s} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-brand-text-secondary">·</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 hover:bg-brand-bg">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                      {initialsOf(project.owner)}
                    </span>
                    <span className="text-[12px] text-brand-text">{project.owner}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Reassign recruiter</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["Priya Sharma", "Amarsh Kumar", "Dewi Sartika", "Mei Lin Tan"].map((n) => (
                    <DropdownMenuItem key={n} onClick={() => toast.success(`Reassigned to ${n}`)}>
                      {n}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate({ to: "/jobs/new", search: { projectId: id } })}
            >
              <Plus className="h-4 w-4" />
              Add job
            </Button>
            <Button
              onClick={runMatching}
              disabled={matching}
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {matching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run matching
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" aria-label="Edit project">
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-status-danger">
                  <XCircle className="mr-2 h-4 w-4" /> Close project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Briefcase}
          label="Total jobs"
          value={stats.totalJobs}
          subtext={`${stats.activeJobs} active · ${stats.closedJobs} closed`}
        />
        <StatCard
          icon={Users}
          label="Candidates"
          value={project.candidates}
          subtext="in pipeline"
        />
        <StatCard
          icon={Target}
          label="Open positions"
          value={stats.openHeadcount}
          subtext={`of ${stats.totalHeadcount} headcount`}
        />
        <StatCard
          icon={Clock}
          label="Days open"
          value={project.daysOpen}
          subtext="since kickoff"
        />
        <StatCard
          icon={Sparkles}
          label="Shortlisted"
          value={project.shortlisted}
          subtext="ready for review"
          tone="primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue jobs"
          value={stats.overdueJobs}
          subtext={stats.overdueJobs > 0 ? "needs attention" : "all on track"}
          tone={stats.overdueJobs > 0 ? "danger" : "neutral"}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-b-2 border-brand-primary text-brand-primary"
                    : "border-b-2 border-transparent text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      active
                        ? "bg-brand-seafoam text-brand-primary"
                        : "bg-gray-100 text-brand-text-secondary",
                    )}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {tab === "overview" && (
          <OverviewTab
            project={project}
            client={client}
            jobs={jobs}
            stats={stats}
            onOpenTab={setTab}
          />
        )}
        {tab === "jobs" && <JobsTab projectId={id} jobs={jobs} />}
        {tab === "candidates" &&
          (hasMatched ? (
            <MatchResults projectId={id} />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No match results yet"
              description="Run AI matching to score candidates against this mandate."
              actionLabel={matching ? "Running…" : "Run matching"}
              onAction={matching ? undefined : runMatching}
            />
          ))}
        {tab === "pipeline" && <PipelineKanban />}
        {tab === "activity" && <ActivityTab project={project} />}
      </div>
    </div>
  );
}

/* ---------- Stat card ---------- */

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  tone = "default",
}: {
  icon: typeof Briefcase;
  label: string;
  value: number | string;
  subtext?: string;
  tone?: "default" | "primary" | "danger" | "neutral";
}) {
  const toneCls =
    tone === "primary"
      ? "text-brand-primary"
      : tone === "danger"
        ? "text-status-danger"
        : tone === "neutral"
          ? "text-brand-text"
          : "text-brand-text";
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={cn("mt-2 text-[24px] font-semibold leading-none tabular-nums", toneCls)}>
        {value}
      </div>
      {subtext && <div className="mt-1.5 text-[12px] text-brand-text-secondary">{subtext}</div>}
    </div>
  );
}

/* ---------- Overview tab ---------- */

function OverviewTab({
  project,
  client,
  jobs,
  stats,
  onOpenTab,
}: {
  project: (typeof projects)[number];
  client: (typeof clients)[number] | undefined;
  jobs: JobDerived[];
  stats: { overdueJobs: number; activeJobs: number; openHeadcount: number; totalHeadcount: number };
  onOpenTab: (t: "overview" | "jobs" | "candidates" | "pipeline" | "activity") => void;
}) {
  const recent = buildActivity(project).slice(0, 5);
  const overdueJobs = jobs.filter((j) => j.isOverdue);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {overdueJobs.length > 0 && (
          <div className="rounded-xl border border-status-danger/30 bg-status-danger/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-danger" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-status-danger">
                  {overdueJobs.length} {overdueJobs.length === 1 ? "job is" : "jobs are"} past target close
                </div>
                <p className="mt-1 text-[13px] text-brand-text-secondary">
                  These roles are still open beyond their planned close date. Review urgency and update timelines.
                </p>
                <button
                  onClick={() => onOpenTab("jobs")}
                  className="mt-2 text-[13px] font-medium text-status-danger hover:underline"
                >
                  Review overdue jobs →
                </button>
              </div>
            </div>
          </div>
        )}

        <Card title="Mandate summary">
          <DescGrid>
            <DescItem label="Client">
              <Link
                to="/clients/$id"
                params={{ id: project.clientId }}
                className="text-brand-primary hover:underline"
              >
                {project.clientName}
              </Link>
            </DescItem>
            <DescItem label="Industry">{client?.industry ?? "—"}</DescItem>
            <DescItem label="Primary contact">{client?.primaryContact ?? "—"}</DescItem>
            <DescItem label="Location">{project.location}</DescItem>
            <DescItem label="Assigned recruiter">{project.owner}</DescItem>
            <DescItem label="Seniority">
              {SENIORITY_LABEL[project.seniority] ?? project.seniority}
            </DescItem>
            <DescItem label="Days open">{project.daysOpen}</DescItem>
            <DescItem label="Target close">
              ~{Math.max(0, 75 - project.daysOpen)} days
            </DescItem>
          </DescGrid>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
              Mandate notes
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-brand-text">
              Executive search engagement to fill {jobs.length || "the"} key{" "}
              {jobs.length === 1 ? "role" : "roles"} under the {project.title} mandate
              for {project.clientName}. Client expects shortlist within{" "}
              {targetWindowDays(project.seniority)} days of brief approval.
            </p>
          </div>
        </Card>

        <Card title="Engagement details">
          <DescGrid>
            <DescItem label="Engagement type">Retained</DescItem>
            <DescItem label="Fee structure">33% of first-year cash comp</DescItem>
            <DescItem label="Retainer schedule">3 milestones (1/3, 1/3, 1/3)</DescItem>
            <DescItem label="Exclusivity">Exclusive — 90 days</DescItem>
            <DescItem label="Off-limits">2 portfolio companies</DescItem>
            <DescItem label="Guarantee">90-day replacement guarantee</DescItem>
          </DescGrid>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
              Key client contacts
            </div>
            <ul className="mt-2 space-y-2">
              {[
                { name: client?.primaryContact ?? "Anand Krishnan", role: "Group CEO", primary: true },
                { name: "Sarah Tan", role: "Head of People", primary: false },
                { name: "Michael Wong", role: "Board Member, Nom. Comm.", primary: false },
              ].map((c) => (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
                    {initialsOf(c.name)}
                  </span>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-brand-text">{c.name}</div>
                    <div className="text-[12px] text-brand-text-secondary">{c.role}</div>
                  </div>
                  {c.primary && (
                    <span className="rounded-full bg-brand-seafoam px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                      Primary
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card
          title="Recent activity"
          action={
            <button
              onClick={() => onOpenTab("activity")}
              className="text-[12px] font-medium text-brand-primary hover:underline"
            >
              View all
            </button>
          }
        >
          <ul className="space-y-3">
            {recent.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                  {a.who === "AI" ? <Sparkles className="h-3 w-3" /> : a.who.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-brand-text">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-brand-text-secondary">{a.text}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-brand-text-secondary">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="At a glance">
          <ul className="space-y-2.5 text-[13px]">
            <Glance label="Active jobs" value={`${stats.activeJobs}`} />
            <Glance label="Headcount remaining" value={`${stats.openHeadcount} of ${stats.totalHeadcount}`} />
            <Glance
              label="Overdue jobs"
              value={String(stats.overdueJobs)}
              tone={stats.overdueJobs > 0 ? "danger" : "default"}
            />
            <Glance label="Shortlisted" value={String(project.shortlisted)} tone="primary" />
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-brand-text">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function DescGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</dl>;
}

function DescItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] text-brand-text">{children}</dd>
    </div>
  );
}

function Glance({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "danger";
}) {
  const cls =
    tone === "primary"
      ? "text-brand-primary"
      : tone === "danger"
        ? "text-status-danger"
        : "text-brand-text";
  return (
    <li className="flex items-center justify-between">
      <span className="text-brand-text-secondary">{label}</span>
      <span className={cn("font-semibold tabular-nums", cls)}>{value}</span>
    </li>
  );
}

/* ---------- Jobs tab ---------- */

const BUCKET_DEFS: Array<{
  id: JobDerived["bucket"];
  label: string;
  tone: "danger" | "warning" | "success" | "neutral";
  description: string;
}> = [
  { id: "overdue", label: "Overdue", tone: "danger", description: "Past target close — needs action" },
  { id: "active", label: "Active", tone: "warning", description: "Open, sourcing, or in process" },
  { id: "on_hold", label: "On hold", tone: "neutral", description: "Paused by client or internally" },
  { id: "filled", label: "Filled", tone: "success", description: "Placements made" },
  { id: "closed_unfilled", label: "Closed unfilled", tone: "neutral", description: "Closed without placement" },
];

function JobsTab({ projectId, jobs }: { projectId: string; jobs: JobDerived[] }) {
  const navigate = useNavigate();
  const [activeBucket, setActiveBucket] = useState<JobDerived["bucket"] | "all">("all");

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs yet"
        description="Add your first job to start sourcing candidates for this mandate."
        actionLabel="Add job"
        onAction={() => navigate({ to: "/jobs/new", search: { projectId } })}
      />
    );
  }

  const counts: Record<JobDerived["bucket"] | "all", number> = {
    all: jobs.length,
    overdue: 0,
    active: 0,
    on_hold: 0,
    filled: 0,
    closed_unfilled: 0,
  };
  jobs.forEach((j) => {
    counts[j.bucket]++;
  });

  const visible = activeBucket === "all" ? jobs : jobs.filter((j) => j.bucket === activeBucket);

  return (
    <div className="space-y-4">
      {counts.overdue > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-status-danger/30 bg-status-danger/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-status-danger" />
          <span className="flex-1 text-[13px] text-brand-text">
            <span className="font-semibold text-status-danger">{counts.overdue} job{counts.overdue === 1 ? "" : "s"}</span>{" "}
            past their target close date and still open.
          </span>
          <button
            onClick={() => setActiveBucket("overdue")}
            className="text-[12px] font-medium text-status-danger hover:underline"
          >
            Show overdue
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="All jobs"
            count={counts.all}
            active={activeBucket === "all"}
            onClick={() => setActiveBucket("all")}
          />
          {BUCKET_DEFS.map((b) => {
            if (counts[b.id] === 0) return null;
            return (
              <FilterChip
                key={b.id}
                label={b.label}
                count={counts[b.id]}
                active={activeBucket === b.id}
                tone={b.tone}
                onClick={() => setActiveBucket(b.id)}
              />
            );
          })}
        </div>
        <Button
          className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          onClick={() => navigate({ to: "/jobs/new", search: { projectId } })}
        >
          <Plus className="h-4 w-4" />
          Add job
        </Button>
      </div>

      {activeBucket === "all" ? (
        <div className="space-y-6">
          {BUCKET_DEFS.map((b) => {
            const bucketJobs = jobs.filter((j) => j.bucket === b.id);
            if (bucketJobs.length === 0) return null;
            return (
              <BucketSection key={b.id} def={b} jobs={bucketJobs} />
            );
          })}
        </div>
      ) : (
        <JobsTable jobs={visible} />
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tone?: "danger" | "warning" | "success" | "neutral";
  onClick: () => void;
}) {
  const toneRing =
    tone === "danger"
      ? "ring-status-danger/30 text-status-danger"
      : tone === "warning"
        ? "ring-status-warning/30 text-status-warning"
        : tone === "success"
          ? "ring-status-success/30 text-status-success"
          : "ring-gray-200 text-brand-text";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ring-1 transition-colors",
        active
          ? "bg-brand-primary text-white ring-brand-primary"
          : `bg-white hover:bg-brand-bg ${toneRing}`,
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
          active ? "bg-white/20 text-white" : "bg-gray-100 text-brand-text-secondary",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function BucketSection({
  def,
  jobs,
}: {
  def: (typeof BUCKET_DEFS)[number];
  jobs: JobDerived[];
}) {
  const dotCls =
    def.tone === "danger"
      ? "bg-status-danger"
      : def.tone === "warning"
        ? "bg-status-warning"
        : def.tone === "success"
          ? "bg-status-success"
          : "bg-status-neutral";
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className={cn("h-2 w-2 rounded-full", dotCls)} />
        <h4 className="text-[13px] font-semibold uppercase tracking-wide text-brand-text">
          {def.label}
        </h4>
        <span className="text-[12px] text-brand-text-secondary">
          {jobs.length} · {def.description}
        </span>
      </div>
      <JobsTable jobs={jobs} highlightOverdue={def.id === "overdue"} />
    </div>
  );
}

function JobsTable({
  jobs,
  highlightOverdue,
}: {
  jobs: JobDerived[];
  highlightOverdue?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-brand-bg text-[11px] uppercase tracking-wide text-brand-text-secondary">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold">Job title</th>
              <th className="px-4 py-2.5 text-left font-semibold">Seniority</th>
              <th className="px-4 py-2.5 text-left font-semibold">Location</th>
              <th className="px-4 py-2.5 text-left font-semibold">Headcount</th>
              <th className="px-4 py-2.5 text-left font-semibold">Status</th>
              <th className="px-4 py-2.5 text-right font-semibold">Candidates</th>
              <th className="px-4 py-2.5 text-left font-semibold">Target close</th>
              <th className="px-4 py-2.5 text-right font-semibold">Days open</th>
              <th className="px-4 py-2.5 text-left font-semibold">Priority</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j, i) => {
              const filledPct = j.headcount ? (j.positionsFilled / j.headcount) * 100 : 0;
              const rowOverdue = highlightOverdue || j.isOverdue;
              return (
                <tr
                  key={j.id}
                  className={cn(
                    "cursor-pointer border-t border-gray-100 transition-colors",
                    i % 2 === 1 && "bg-brand-bg/30",
                    "hover:bg-brand-seafoam/30",
                    rowOverdue && "bg-status-danger/[0.04] hover:bg-status-danger/[0.08]",
                  )}
                  onClick={() => navigate({ to: "/jobs/$id", params: { id: j.id } })}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brand-primary">{j.jobTitle}</span>
                      {j.isOverdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-status-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-status-danger">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Overdue · {Math.abs(j.daysToClose)}d
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-brand-text-secondary">{j.jobCode}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-text">
                    {SENIORITY_LABEL[j.seniorityLevel] ?? j.seniorityLevel}
                  </td>
                  <td className="px-4 py-3 text-brand-text-secondary">{j.location}</td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] text-brand-text">
                      {j.positionsFilled}<span className="text-brand-text-secondary"> / {j.headcount}</span>
                    </div>
                    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-status-success" style={{ width: `${filledPct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={j.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{j.candidatesCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[12px]",
                        j.daysToClose < 0
                          ? "font-semibold text-status-danger"
                          : j.daysToClose <= 7
                            ? "text-status-warning"
                            : "text-brand-text-secondary",
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {j.targetCloseLabel}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums",
                      j.daysOpen > 60 && "text-status-danger",
                      j.daysOpen > 30 && j.daysOpen <= 60 && "text-status-warning",
                    )}
                  >
                    {j.daysOpen}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        PRIORITY_STYLE[j.priority],
                      )}
                    >
                      <Flag className="h-2.5 w-2.5" />
                      {j.priority}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Activity tab ---------- */

function buildActivity(project: { title: string; clientName: string; owner: string }) {
  const ownerFirst = project.owner.split(" ")[0];
  return [
    { who: ownerFirst, text: `ran AI matching on ${project.title}`, when: "1 day ago" },
    { who: ownerFirst, text: `shortlisted 3 candidates`, when: "1 day ago" },
    { who: "Dewi", text: `moved 2 candidates to Submitted to client`, when: "2 days ago" },
    { who: "AI", text: `parsed job brief — 12 fields extracted`, when: "3 days ago" },
    { who: ownerFirst, text: `added a new job to the mandate`, when: "4 days ago" },
    { who: ownerFirst, text: `launched outreach campaign — 24 prospects`, when: "5 days ago" },
    { who: ownerFirst, text: `linked engagement to client: ${project.clientName}`, when: "6 days ago" },
    { who: ownerFirst, text: `created project: ${project.title}`, when: "7 days ago" },
  ];
}

function ActivityTab({ project }: { project: { id: string; title: string; clientName: string; owner: string } }) {
  const activity = buildActivity(project);
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-text-secondary" />
        <h3 className="text-[14px] font-semibold text-brand-text">Full activity log</h3>
      </div>
      <ul className="space-y-4">
        {activity.map((a, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
              {a.who === "AI" ? <Sparkles className="h-3.5 w-3.5" /> : a.who.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-brand-text">
                <span className="font-medium">{a.who}</span>{" "}
                <span className="text-brand-text-secondary">{a.text}</span>
              </p>
              <p className="mt-0.5 text-xs text-brand-text-secondary">{a.when}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
