import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { toast } from "sonner";
import {
  Activity,
  Briefcase,
  Building2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  GitBranch,
  Inbox,
  Linkedin,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Sparkles,
  UserPlus,
  Share2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Globe,
  Copy as CopyIcon,
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
import { StatusBadge, EmptyState, ScoreRing } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  getJob,
  jobs as allJobs,
  projects,
  clients,
  candidates,
  campaigns,
  type Job,
  type JobStatus,
} from "@/lib/mock-data";
import { MatchResults } from "@/components/match/MatchResults";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import { ChannelPickerDialog } from "@/components/distribution/ChannelPickerDialog";
import {
  postingsForJob,
  getChannel,
  statusTone,
  daysUntil,
  type Posting,
  type ChannelId,
} from "@/lib/distribution";

const tabSchema = z.object({
  tab: fallback(
    z.enum(["pipeline", "details", "matching", "distribution", "campaigns", "inbound", "activity"]),
    "pipeline",
  ).default("pipeline"),
});

export const Route = createFileRoute("/_app/jobs/$id")({
  validateSearch: zodValidator(tabSchema),
  head: () => ({ meta: [{ title: "Job — Norvex" }] }),
  component: JobDetail,
});

const TABS = [
  { id: "pipeline" as const, label: "Pipeline", icon: GitBranch },
  { id: "details" as const, label: "Details", icon: FileText },
  { id: "matching" as const, label: "Matching", icon: Sparkles },
  { id: "distribution" as const, label: "Distribution", icon: Share2 },
  { id: "campaigns" as const, label: "Campaigns", icon: Send },
  { id: "inbound" as const, label: "Inbound", icon: Inbox },
  { id: "activity" as const, label: "Activity", icon: Activity },
];

const SENIORITY_LABEL: Record<string, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  senior_manager: "Senior Manager",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid",
  junior: "Junior",
};

const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "sourcing", label: "Sourcing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "placed", label: "Filled" },
  { value: "closed", label: "Closed unfilled" },
  { value: "on_hold", label: "On hold" },
];

function targetWindowDays(seniority: string): number {
  switch (seniority) {
    case "c_suite": return 75;
    case "vp":
    case "director": return 60;
    case "senior_manager":
    case "manager": return 45;
    default: return 35;
  }
}

const ACTIVITY = [
  { type: "create", icon: Briefcase, text: "Job created by Sarah Chen", when: "14 days ago" },
  { type: "match", icon: Sparkles, text: "AI matching run — 47 candidates evaluated, 30 results", when: "12 days ago" },
  { type: "campaign", icon: Send, text: "Campaign 'CFO Outreach Q2' launched", when: "8 days ago" },
  { type: "pipeline", icon: GitBranch, text: "Candidate Rajeev Menon moved to Interview stage", when: "3 days ago" },
  { type: "edit", icon: Pencil, text: "Salary range updated by Priya Sharma", when: "2 days ago" },
  { type: "pipeline", icon: GitBranch, text: "Candidate Hiroshi Yamamoto shortlisted", when: "Yesterday" },
];

const ACTIVITY_COLOR: Record<string, string> = {
  create: "border-l-status-info",
  match: "border-l-status-ai",
  campaign: "border-l-status-success",
  pipeline: "border-l-status-warning",
  edit: "border-l-status-neutral",
};

function JobDetail() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const setTab = (next: typeof tab) =>
    navigate({ to: "/jobs/$id", params: { id }, search: { tab: next } });

  const job = getJob(id) ?? allJobs[0];
  const project = projects.find((p) => p.id === job.projectId);
  const client = project ? clients.find((c) => c.id === project.clientId) : undefined;

  const [status, setStatus] = useState<JobStatus>(job.status);
  const [pickerOpen, setPickerOpen] = useState(false);

  const window_ = targetWindowDays(job.seniorityLevel);
  const daysToClose = window_ - job.daysOpen;
  const isOverdue =
    daysToClose < 0 && status !== "placed" && status !== "closed";
  const targetCloseLabel =
    daysToClose >= 0 ? `Target close in ${daysToClose}d` : `${Math.abs(daysToClose)}d overdue`;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-8 -mt-8 border-b border-border bg-brand-bg/95 px-8 pb-4 pt-6 backdrop-blur">
        <div className="mb-2 flex items-center gap-1 text-sm text-brand-text-secondary">
          <Link to="/jobs" className="hover:underline">Jobs</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {project && (
            <>
              <Link
                to="/projects/$id"
                params={{ id: project.id }}
                className="hover:underline"
              >
                {project.title}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-brand-text">{job.jobTitle}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-brand-text-secondary">{job.jobCode}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-semibold leading-tight text-brand-text">
                {job.jobTitle}
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand-primary">
                    <StatusBadge status={status} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="text-xs">Set status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {JOB_STATUSES.map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onClick={() => {
                        setStatus(s.value);
                        toast.success(`Status set to ${s.label}`);
                      }}
                    >
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="rounded-full bg-status-ai/15 px-2.5 py-0.5 text-xs font-medium text-status-ai">
                {SENIORITY_LABEL[job.seniorityLevel]}
              </span>
              <span className="inline-flex items-center gap-1 text-brand-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1 capitalize text-brand-text-secondary">
                <Building2 className="h-3.5 w-3.5" />
                {job.workModel}
              </span>
              {client && (
                <span className="inline-flex items-center gap-2 text-brand-text-secondary">
                  <span className="text-brand-text">{client.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-brand-text-secondary">
                    {client.industry}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => {
                toast.success("Matching started — evaluating candidates");
                setTab("matching");
              }}
            >
              <Sparkles className="h-4 w-4" />
              Run Matching
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                navigate({
                  to: "/outreach/new",
                  search: { projectId: job.projectId, jobId: job.id },
                })
              }
            >
              <Send className="h-4 w-4" />
              New Campaign
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                toast("Opening pipeline to add candidate");
                setTab("pipeline");
              }}
            >
              <UserPlus className="h-4 w-4" />
              Add Candidate
            </Button>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit job
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setTab("distribution");
                    setTimeout(() => setPickerOpen(true), 50);
                  }}
                >
                  Post to job boards
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Duplicate — coming soon")}>
                  Duplicate job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast(job.isPublished ? "Unpublished" : "Published to portal")}>
                  {job.isPublished ? "Unpublish from portal" : "Publish to portal"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setStatus("closed"); toast("Job closed"); }}>
                  Close job
                </DropdownMenuItem>
                <DropdownMenuItem className="text-status-danger">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mini stat bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniStat
            label="Headcount"
            value={`${job.positionsFilled} of ${job.headcount} filled`}
          />
          <MiniStat
            label="Days open"
            value={`${job.daysOpen}d`}
            tone={job.daysOpen > 60 ? "danger" : job.daysOpen > 30 ? "warn" : undefined}
          />
          <MiniStat
            label="Target close"
            value={targetCloseLabel}
            tone={isOverdue ? "danger" : daysToClose <= 7 ? "warn" : undefined}
          />
          <MiniStat label="In pipeline" value={job.inPipeline} />
          <div className="rounded-lg border border-border bg-card px-3 py-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-seafoam text-xs font-semibold text-brand-primary">
              {job.assignedInitials}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
                Recruiter
              </div>
              <div className="truncate text-sm font-medium text-brand-text">{job.assignedTo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 mt-2 flex gap-1 border-b border-border">
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
                  : "border-b-2 border-transparent text-brand-text-secondary hover:text-brand-text",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "pipeline" && <PipelineKanban />}
      {tab === "details" && <DetailsTab job={job} />}
      {tab === "matching" && (
        <div>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="text-sm font-medium text-brand-text">Latest match run</div>
              <div className="text-xs text-brand-text-secondary">
                {job.createdAt} · {job.candidatesCount} candidates evaluated · avg score {job.avgMatchScore}
              </div>
            </div>
            <Button className="gap-2" onClick={() => toast.success("Matching started")}>
              <Sparkles className="h-4 w-4" />
              Run Matching
            </Button>
          </div>
          <MatchResults projectId={job.projectId} />
        </div>
      )}
      {tab === "distribution" && (
        <DistributionTab job={job} onOpenPicker={() => setPickerOpen(true)} setTab={setTab} />
      )}
      {tab === "campaigns" && <CampaignsTab job={job} />}
      {tab === "inbound" && <InboundTab job={job} />}
      {tab === "activity" && <ActivityTab />}

      <ChannelPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        alreadyPosted={postingsForJob(job.id).map((p) => p.channel)}
        onConfirm={(chs) =>
          toast.success(
            `Queued ${chs.length} posting${chs.length === 1 ? "" : "s"} for ${job.jobTitle}`,
          )
        }
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "warn" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-3 py-2",
        tone === "danger" ? "border-status-danger/40 bg-status-danger/5" : "border-border",
      )}
    >
      <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-base font-semibold tabular-nums",
          tone === "danger" && "text-status-danger",
          tone === "warn" && "text-status-warning",
          !tone && "text-brand-text",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DetailsTab({ job }: { job: Job }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-3 rounded-xl border border-border bg-card p-6">
        <Row label="Parent project">
          <Link
            to="/projects/$id"
            params={{ id: job.projectId }}
            className="text-brand-primary hover:underline"
          >
            {projects.find((p) => p.id === job.projectId)?.title ?? "—"}
          </Link>
        </Row>
        <Row label="Department">{job.department}</Row>
        <Row label="Hiring manager">{job.assignedTo}</Row>
        <Row label="Opened">{job.createdAt}</Row>
        <Row label="Target close">in {Math.max(0, targetWindowDays(job.seniorityLevel) - job.daysOpen)} days</Row>
        <Row label="Required skills">
          <div className="flex flex-wrap gap-1.5">
            {job.skillsRequired.map((s) => (
              <span key={s} className="rounded-full bg-status-info/10 px-2.5 py-1 text-xs text-status-info">
                {s}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Nice to have">
          <div className="flex flex-wrap gap-1.5">
            {job.skillsNiceToHave.map((s) => (
              <span key={s} className="rounded-full bg-status-neutral/10 px-2.5 py-1 text-xs text-status-neutral">
                {s}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Experience">{job.experienceMin}–{job.experienceMax} years</Row>
        <Row label="Education">{job.education}</Row>
        <Row label="Languages">{job.languageRequirements.join(", ")}</Row>
        <Row label="Salary">
          {job.salaryCurrency} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()} / month
        </Row>
        <div>
          <div className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
            Responsibilities
          </div>
          <ol className="space-y-2">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="w-5 text-brand-text-secondary">{i + 1}.</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Edit brief
        </Button>
      </div>
      <div className="lg:col-span-2">
        <details className="rounded-xl border border-border bg-brand-bg/60" open>
          <summary className="flex items-center justify-between border-b border-border px-5 py-3 cursor-pointer">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Original JD
            </div>
            <button
              onClick={(e) => { e.preventDefault(); toast.success("Copied"); }}
              className="rounded p-1 text-brand-text-secondary hover:bg-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </summary>
          <div className="max-h-[500px] overflow-y-auto px-5 py-4">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-brand-text-secondary">
              {job.rawJdText}
            </pre>
          </div>
          <div className="border-t border-border px-5 py-3 text-xs text-brand-text-secondary">
            <div className="flex items-center justify-between">
              <span>Uploaded {job.createdAt}</span>
              <Link to="/jobs/$id/parse" params={{ id: job.id }} className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                <Download className="h-3 w-3" />
                Re-review parse
              </Link>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-border/60 py-2.5 last:border-0">
      <div className="w-36 shrink-0 text-xs uppercase tracking-wide text-brand-text-secondary">
        {label}
      </div>
      <div className="flex-1 text-sm text-brand-text">{children}</div>
    </div>
  );
}

function CampaignsTab({ job }: { job: Job }) {
  const jobCampaigns = campaigns.filter((c) => c.projectId === job.projectId);
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-brand-text-secondary">
          {jobCampaigns.length} campaign{jobCampaigns.length === 1 ? "" : "s"} attached to this job
        </div>
        <Button
          className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          onClick={() =>
            navigate({
              to: "/outreach/new",
              search: { projectId: job.projectId, jobId: job.id },
            })
          }
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>
      {jobCampaigns.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No outreach campaigns yet"
          description="Shortlist candidates first, then launch a campaign to reach them on LinkedIn."
        />
      ) : (
        <div className="space-y-3">
          {jobCampaigns.map((c) => {
            const rate = c.sent ? Math.round((c.replied / c.sent) * 100) : 0;
            return (
              <Link
                key={c.id}
                to="/outreach/$id"
                params={{ id: c.id }}
                className="block rounded-xl border border-border bg-card p-5 hover:border-brand-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-brand-text">{c.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-text-secondary">
                      <Linkedin className="h-3 w-3" />
                      <span>linkedin.com/in/recruiter-amarsh</span>
                      <span>· Started {c.startedAt}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                  <Stat label="Sent" value={c.sent} />
                  <Stat label="Replies" value={c.replied} />
                  <Stat label="Interested" value={c.interested} />
                  <Stat label="Response rate" value={`${rate}%`} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-brand-text-secondary">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-brand-text">{value}</div>
    </div>
  );
}

function InboundTab({ job }: { job: Job }) {
  // Mock inbound applicants from candidates pool with inbound-like sources
  const inboundSources = ["inbound", "referral"] as const;
  const subset = candidates
    .filter((c) => (inboundSources as readonly string[]).includes(c.source))
    .slice(0, 6);

  if (subset.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No inbound applicants yet"
        description="Applications submitted via the candidate portal or website contact form will appear here."
      />
    );
  }

  const classify = (score: number) =>
    score >= 80 ? { label: "Strong fit", tone: "text-status-success bg-status-success/15" }
      : score >= 65 ? { label: "Possible fit", tone: "text-status-warning bg-status-warning/15" }
      : { label: "Weak fit", tone: "text-status-neutral bg-status-neutral/15" };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wide text-brand-text-secondary">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Applicant</th>
            <th className="px-4 py-3 text-left font-semibold">Match</th>
            <th className="px-4 py-3 text-left font-semibold">Classification</th>
            <th className="px-4 py-3 text-left font-semibold">Source</th>
            <th className="px-4 py-3 text-left font-semibold">Applied</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {subset.map((c) => {
            const cls = classify(c.matchScore);
            return (
              <tr key={c.id} className="border-t border-border hover:bg-brand-bg/40">
                <td className="px-4 py-3">
                  <Link
                    to="/candidates/$id"
                    params={{ id: c.id }}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                  <div className="text-xs text-brand-text-secondary">
                    {c.currentTitle} · {c.currentCompany}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ScoreRing score={c.matchScore} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", cls.tone)}>
                    {cls.label}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-brand-text-secondary">
                  {c.source.replace("_", " ")}
                </td>
                <td className="px-4 py-3 text-brand-text-secondary">{c.lastContact}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`${c.name} moved to pipeline`)}
                  >
                    Move to pipeline
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <ul className="space-y-3">
        {ACTIVITY.map((a, i) => {
          const Icon = a.icon;
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 border-l-4 bg-brand-bg/40 px-3 py-2.5 rounded-r-md",
                ACTIVITY_COLOR[a.type],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 text-brand-text-secondary" />
              <div className="flex-1 text-sm text-brand-text">{a.text}</div>
              <div className="text-xs text-brand-text-secondary inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {a.when}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================ Distribution tab =============================

function DistributionTab({
  job,
  onOpenPicker,
  setTab,
}: {
  job: Job;
  onOpenPicker: () => void;
  setTab: (t: "pipeline" | "details" | "matching" | "distribution" | "campaigns" | "inbound" | "activity") => void;
}) {
  const rows = postingsForJob(job.id);
  const careersUrl = `https://norvex-careers.example/jobs/${job.jobCode.toLowerCase()}`;
  const careersRow = rows.find((r) => r.channel === "careers_page");
  const totalApps = rows.reduce((s, r) => s + r.applicants, 0);
  const liveCount = rows.filter((r) => r.status === "live").length;
  const expiringSoon = rows.filter((r) => {
    const d = daysUntil(r.expiresAt);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryStat label="Channels live" value={liveCount} />
        <SummaryStat label="Applicants from postings" value={totalApps} />
        <SummaryStat
          label="Expiring in 7 days"
          value={expiringSoon}
          tone={expiringSoon > 0 ? "warn" : undefined}
        />
        <SummaryStat label="Posted channels" value={rows.length} />
      </div>

      {/* Careers page row (always present) */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary text-sm font-bold text-white">
              Nx
            </div>
            <div>
              <div className="text-sm font-semibold text-brand-text">Norvex Careers Page</div>
              <div className="text-xs text-brand-text-secondary">
                {careersRow?.status === "live"
                  ? "Live on your white-label careers site"
                  : "Not currently published"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-brand-bg/50 px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-brand-text-secondary" />
              <code className="text-xs text-brand-text">{careersUrl}</code>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(careersUrl);
                  toast.success("URL copied");
                }}
                className="rounded p-1 hover:bg-muted"
                aria-label="Copy URL"
              >
                <CopyIcon className="h-3.5 w-3.5 text-brand-text-secondary" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(careersRow?.status === "live" ? "Unpublished" : "Published")}
            >
              {careersRow?.status === "live" ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Per-channel posting status table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-brand-text">Channel postings</div>
            <div className="text-xs text-brand-text-secondary">
              Status synced from each board. Errors and expired postings need recruiter action.
            </div>
          </div>
          <Button
            size="sm"
            onClick={onOpenPicker}
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Plus className="h-4 w-4" />
            Post to more channels
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wide text-brand-text-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Channel</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Posted</th>
                <th className="px-4 py-3 text-left font-semibold">Expires</th>
                <th className="px-4 py-3 text-left font-semibold">Applicants</th>
                <th className="px-4 py-3 text-left font-semibold">Last synced</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <PostingRow key={p.id} posting={p} setTab={setTab} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-text-secondary">
                    No postings yet. Use “Post to more channels” to distribute this role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source effectiveness mini-chart */}
      <SourceEffectiveness rows={rows} setTab={setTab} />
    </div>
  );
}

function PostingRow({
  posting,
  setTab,
}: {
  posting: Posting;
  setTab: (t: "inbound") => void;
}) {
  const ch = getChannel(posting.channel);
  const tone = statusTone(posting.status);
  const expiryDays = daysUntil(posting.expiresAt);
  const expiringSoon =
    expiryDays !== null && expiryDays >= 0 && expiryDays <= 7 && posting.status === "live";

  return (
    <tr className="border-t border-border align-top hover:bg-brand-bg/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded text-[11px] font-bold text-white", ch.accent)}>
            {ch.initial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-brand-text">{ch.name}</div>
            {posting.errorMessage && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-status-danger">
                <AlertTriangle className="h-3 w-3" /> {posting.errorMessage}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", tone.className)}>
          {tone.label}
        </span>
        {expiringSoon && (
          <div className="mt-1 text-[11px] font-medium text-status-warning">
            Expires in {expiryDays}d
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-brand-text-secondary">{posting.postedAt ?? "—"}</td>
      <td className={cn("px-4 py-3", expiringSoon ? "text-status-warning font-medium" : "text-brand-text-secondary")}>
        {posting.expiresAt ?? "—"}
      </td>
      <td className="px-4 py-3">
        {posting.applicants > 0 ? (
          <button
            onClick={() => setTab("inbound")}
            className="font-medium text-brand-primary hover:underline"
          >
            {posting.applicants}
          </button>
        ) : (
          <span className="text-brand-text-secondary">0</span>
        )}
      </td>
      <td className="px-4 py-3 text-brand-text-secondary">{posting.lastSyncedAt ?? "—"}</td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          {posting.status === "live" && posting.externalUrl && (
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href={posting.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> View
              </a>
            </Button>
          )}
          {posting.status === "live" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.success(`${ch.name} posting closed`)}
            >
              Close
            </Button>
          )}
          {posting.status === "expired" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => toast.success(`Re-posted to ${ch.name}`)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-post
            </Button>
          )}
          {posting.status === "error" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-status-danger"
              onClick={() => toast(`Retrying ${ch.name}…`)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          )}
          {posting.status === "pending" && (
            <span className="text-xs text-brand-text-secondary">Queued</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "warn" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "warn" ? "text-status-warning" : tone === "danger" ? "text-status-danger" : "text-brand-text",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function SourceEffectiveness({
  rows,
  setTab,
}: {
  rows: Posting[];
  setTab: (t: "inbound") => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.applicants));
  const sorted = [...rows].sort((a, b) => b.applicants - a.applicants);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-text">Applicants by source</div>
          <div className="text-xs text-brand-text-secondary">
            Which channel is producing this role's inbound funnel.
          </div>
        </div>
        <button
          onClick={() => setTab("inbound")}
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          View all inbound →
        </button>
      </div>
      <div className="space-y-2">
        {sorted.map((p) => {
          const ch = getChannel(p.channel);
          const pct = (p.applicants / max) * 100;
          return (
            <div key={p.id} className="flex items-center gap-3">
              <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white", ch.accent)}>
                {ch.initial}
              </div>
              <div className="w-36 truncate text-sm text-brand-text">{ch.name}</div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand-primary/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-10 text-right text-sm tabular-nums text-brand-text">{p.applicants}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
