import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Briefcase,
  Building,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  GitBranch,
  MapPin,
  MoreHorizontal,
  Pencil,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, EmptyState, ScoreRing, StatCard } from "@/components/shared";
import { cn } from "@/lib/utils";
import { getJob, jobs, projects, candidates, campaigns } from "@/lib/mock-data";
import { MatchResults } from "@/components/match/MatchResults";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";

const tabSchema = z.object({
  tab: fallback(
    z.enum(["brief", "candidates", "matching", "pipeline", "outreach", "activity"]),
    "brief",
  ).default("brief"),
});

export const Route = createFileRoute("/_app/jobs/$id")({
  validateSearch: zodValidator(tabSchema),
  head: () => ({ meta: [{ title: "Job — HireSmart" }] }),
  component: JobDetail,
});

const TABS = [
  { id: "brief" as const, label: "Brief", icon: FileText },
  { id: "candidates" as const, label: "Candidates", icon: Users },
  { id: "matching" as const, label: "Matching", icon: Sparkles },
  { id: "pipeline" as const, label: "Pipeline", icon: GitBranch },
  { id: "outreach" as const, label: "Outreach", icon: Send },
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
  const navigate = Route.useNavigate();
  const job = getJob(id) ?? jobs[0];
  const project = projects.find((p) => p.id === job.projectId);

  const setTab = (next: typeof tab) => navigate({ search: { tab: next } });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-8 -mt-8 border-b border-border bg-brand-bg/95 px-8 pb-4 pt-6 backdrop-blur">
        <div className="mb-2 flex items-center gap-1 text-sm text-brand-text-secondary">
          <Link to="/projects" className="hover:underline">Projects</Link>
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
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-semibold leading-tight text-brand-text">
                {job.jobTitle}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-status-ai/15 px-2.5 py-0.5 text-xs font-medium text-status-ai">
                {SENIORITY_LABEL[job.seniorityLevel]}
              </span>
              <span className="inline-flex items-center gap-1 text-brand-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1 text-brand-text-secondary">
                <Building className="h-3.5 w-3.5" />
                <span className="capitalize">{job.workModel}</span>
              </span>
              <span className="text-brand-text-secondary">
                {job.positionsFilled} of {job.headcount} filled
              </span>
              <span className="text-brand-text-secondary">Code: {job.jobCode}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit job
            </Button>
            <Button
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => {
                toast.success("Matching started — 47 candidates evaluated");
                setTab("matching");
              }}
            >
              <Sparkles className="h-4 w-4" />
              Run matching
            </Button>
            <Button
              className="gap-2 bg-status-success text-white hover:bg-status-success/90"
              onClick={() => navigate({ to: "/outreach/new" })}
            >
              <Send className="h-4 w-4" />
              Launch campaign
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast("Duplicate — coming soon")}>
                  Duplicate job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Status change — coming soon")}>
                  Change status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast(job.isPublished ? "Unpublished" : "Published")}>
                  {job.isPublished ? "Unpublish" : "Publish to portal"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast("Closed")}>Close job</DropdownMenuItem>
                <DropdownMenuItem className="text-status-danger">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mini stat bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniStat label="Sourced" value={job.candidatesCount} />
          <MiniStat label="In pipeline" value={job.inPipeline} />
          <MiniStat label="Active campaigns" value={job.activeCampaigns} />
          <MiniStat label="Response rate" value={`${job.responseRate}%`} />
          <MiniStat
            label="Days open"
            value={job.daysOpen}
            tone={job.daysOpen > 60 ? "danger" : job.daysOpen > 30 ? "warn" : undefined}
          />
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

      {tab === "brief" && <BriefTab job={job} />}
      {tab === "candidates" && <CandidatesTab job={job} />}
      {tab === "matching" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-brand-text-secondary">
              Last run: {job.createdAt} · {job.candidatesCount} candidates evaluated
            </div>
            <Button className="gap-2" onClick={() => toast.success("Matching started")}>
              <Sparkles className="h-4 w-4" />
              Run matching
            </Button>
          </div>
          <MatchResults projectId={job.projectId} />
        </div>
      )}
      {tab === "pipeline" && <PipelineKanban />}
      {tab === "outreach" && <OutreachTab job={job} />}
      {tab === "activity" && <ActivityTab />}
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
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums",
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

function BriefTab({ job }: { job: ReturnType<typeof getJob> & {} }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-3 rounded-xl border border-border bg-card p-6">
        <BriefRow label="Required skills">
          <div className="flex flex-wrap gap-1.5">
            {job.skillsRequired.map((s) => (
              <span
                key={s}
                className="rounded-full bg-status-info/10 px-2.5 py-1 text-xs text-status-info"
              >
                {s}
              </span>
            ))}
          </div>
        </BriefRow>
        <BriefRow label="Nice to have">
          <div className="flex flex-wrap gap-1.5">
            {job.skillsNiceToHave.map((s) => (
              <span
                key={s}
                className="rounded-full bg-status-neutral/10 px-2.5 py-1 text-xs text-status-neutral"
              >
                {s}
              </span>
            ))}
          </div>
        </BriefRow>
        <BriefRow label="Experience">
          {job.experienceMin}–{job.experienceMax} years
        </BriefRow>
        <BriefRow label="Education">{job.education}</BriefRow>
        <BriefRow label="Salary">
          {job.salaryCurrency} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()} / month
        </BriefRow>
        <BriefRow label="Languages">{job.languageRequirements.join(", ")}</BriefRow>
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
        <div className="rounded-xl border border-border bg-brand-bg/60">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Original JD
            </div>
            <button
              onClick={() => toast.success("Copied")}
              className="rounded p-1 text-brand-text-secondary hover:bg-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
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
        </div>
      </div>
    </div>
  );
}

function BriefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-border/60 py-2.5 last:border-0">
      <div className="w-36 shrink-0 text-xs uppercase tracking-wide text-brand-text-secondary">
        {label}
      </div>
      <div className="flex-1 text-sm text-brand-text">{children}</div>
    </div>
  );
}

function CandidatesTab({ job }: { job: ReturnType<typeof getJob> & {} }) {
  const subset = candidates.slice(0, Math.max(5, Math.min(10, job.candidatesCount)));
  if (subset.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No candidates yet"
        description="Run AI matching or wait for applications to start filling the candidate pool."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-brand-text-secondary">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Candidate</th>
            <th className="px-4 py-3 text-left font-semibold">Score</th>
            <th className="px-4 py-3 text-left font-semibold">Source</th>
            <th className="px-4 py-3 text-left font-semibold">Stage</th>
            <th className="px-4 py-3 text-left font-semibold">Last contact</th>
          </tr>
        </thead>
        <tbody>
          {subset.map((c) => (
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
              <td className="px-4 py-3 capitalize text-brand-text-secondary">
                {c.source.replace("_", " ")}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status="shortlisted" />
              </td>
              <td className="px-4 py-3 text-brand-text-secondary">{c.lastContact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OutreachTab({ job }: { job: ReturnType<typeof getJob> & {} }) {
  const jobCampaigns = campaigns.filter((c) => c.projectId === job.projectId);
  if (jobCampaigns.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No outreach campaigns yet"
        description="Shortlist candidates first, then launch a campaign to reach them on LinkedIn."
        actionLabel="Launch campaign"
      />
    );
  }
  return (
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
                <div className="mt-0.5 text-xs text-brand-text-secondary">
                  Started {c.startedAt}
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
              <div className="text-xs text-brand-text-secondary">{a.when}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
