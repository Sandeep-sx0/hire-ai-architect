import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { projects, getJobsByProject } from "@/lib/mock-data";
import {
  Linkedin,
  Users,
  MessageSquare,
  ShieldCheck,
  Rocket,
  Check,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Briefcase,
} from "lucide-react";
import { PageHeader, ScoreRing } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/outreach/new")({
  head: () => ({ meta: [{ title: "New Campaign — Norvex" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    projectId: typeof s.projectId === "string" ? s.projectId : undefined,
    jobId: typeof s.jobId === "string" ? s.jobId : undefined,
  }),
  component: CampaignBuilder,
});

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                 */
/* -------------------------------------------------------------------------- */

type WarmupStatus = { day: number; todayLimit: number } | null; // null = warmup complete

interface LinkedInAccount {
  id: string;
  name: string;
  initials: string;
  email: string;
  connections: number;
  connectedAgo: string;
  sentToday: number;
  dailyCap: number; // 15 default
  totalSent: number; // for first-50 manual approval logic
  warmup: WarmupStatus;
}

const ACCOUNTS: LinkedInAccount[] = [
  {
    id: "amarsh",
    name: "Amarsh Jain",
    initials: "AJ",
    email: "amarsh@norvex.id",
    connections: 1247,
    connectedAgo: "3 months ago",
    sentToday: 4,
    dailyCap: 15,
    totalSent: 9,
    warmup: null,
  },
  {
    id: "sarah",
    name: "Sarah Patel",
    initials: "SP",
    email: "sarah@norvex.id",
    connections: 842,
    connectedAgo: "12 days ago",
    sentToday: 7,
    dailyCap: 15,
    totalSent: 38,
    warmup: { day: 4, todayLimit: 10 },
  },
  {
    id: "rio",
    name: "Rio Hartono",
    initials: "RH",
    email: "rio@norvex.id",
    connections: 2103,
    connectedAgo: "8 months ago",
    sentToday: 12,
    dailyCap: 15,
    totalSent: 312,
    warmup: null,
  },
];

const WARMUP_RAMP = [5, 7, 9, 10, 12, 14, 15]; // day 1..7

type SourceKey = "shortlist" | "match" | "saved";

type EligibilityReason = "ok" | "no_linkedin" | "dnc" | "in_campaign";

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  source: SourceKey;
  hasLinkedIn: boolean;
  eligibility: EligibilityReason;
  blockedDetail?: string;
}

const ALL_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia", score: 88, source: "shortlist", hasLinkedIn: true, eligibility: "ok" },
  { id: "c2", name: "Priya Nair", title: "Finance Director", company: "Reliance Industries", score: 85, source: "shortlist", hasLinkedIn: true, eligibility: "ok" },
  { id: "c3", name: "Amara Osei", title: "Group CFO", company: "Dangote Group", score: 82, source: "shortlist", hasLinkedIn: true, eligibility: "ok" },
  { id: "c4", name: "Budi Santoso", title: "VP Finance", company: "Astra International", score: 76, source: "match", hasLinkedIn: true, eligibility: "ok" },
  { id: "c5", name: "Patrick O'Brien", title: "CFO", company: "CIMB Bank", score: 71, source: "match", hasLinkedIn: true, eligibility: "ok" },
  { id: "c6", name: "Kartika Sari", title: "Finance Director", company: "Bank Mandiri", score: 68, source: "match", hasLinkedIn: true, eligibility: "dnc", blockedDetail: "Do Not Contact" },
  { id: "c7", name: "James Chen", title: "CFO", company: "Sinopec", score: 64, source: "saved", hasLinkedIn: true, eligibility: "in_campaign", blockedDetail: "Active in: CFO — Stylo Q1" },
  { id: "c8", name: "Tom Nguyen", title: "Finance Lead", company: "Vingroup", score: 59, source: "saved", hasLinkedIn: false, eligibility: "no_linkedin", blockedDetail: "No LinkedIn profile" },
  { id: "c9", name: "Linh Tran", title: "Finance Director", company: "Masan Group", score: 79, source: "saved", hasLinkedIn: true, eligibility: "ok" },
];

const SOURCES: { id: SourceKey; label: string; hint: string }[] = [
  { id: "shortlist", label: "From shortlist for this job", hint: "Recruiter-curated, highest intent" },
  { id: "match", label: "From AI match results", hint: "Top-scoring candidates from matching engine" },
  { id: "saved", label: "From a saved search", hint: "Reusable candidate list" },
];

const TONES = ["Professional", "Warm", "Executive", "Casual"] as const;
const TONE_DESC: Record<string, string> = {
  Professional: "Formal, direct, business-focused",
  Warm: "Friendly, conversational, relationship-first",
  Executive: "Peer-to-peer, concise, respect for their time",
  Casual: "Relaxed, informal, approachable",
};

const STEPS = [
  { id: 1, label: "Sending account", Icon: Linkedin },
  { id: 2, label: "Candidates", Icon: Users },
  { id: 3, label: "Sequence", Icon: MessageSquare },
  { id: 4, label: "Schedule & safety", Icon: ShieldCheck },
  { id: 5, label: "Review & launch", Icon: Rocket },
];

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type SequenceStep = {
  id: string;
  kind: "connection" | "followup";
  body: string;
  waitDays: number; // for followups: days after previous step
};

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

function CampaignBuilder() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_app/outreach/new" });
  const [step, setStep] = useState(1);

  // Pre-attached project & job (read-only header)
  const projectId = search.projectId && projects.some((p) => p.id === search.projectId)
    ? search.projectId
    : projects[0]?.id ?? "";
  const project = projects.find((p) => p.id === projectId);
  const jobsForProject = useMemo(() => getJobsByProject(projectId), [projectId]);
  const jobId = search.jobId && jobsForProject.some((j) => j.id === search.jobId)
    ? search.jobId
    : jobsForProject[0]?.id ?? "";
  const job = jobsForProject.find((j) => j.id === jobId);
  const preAttached = !!search.jobId;

  // Step 1: sending account
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id);
  const account = ACCOUNTS.find((a) => a.id === accountId)!;

  // Step 2: candidates
  const [source, setSource] = useState<SourceKey>("shortlist");
  const visibleCandidates = useMemo(
    () => ALL_CANDIDATES.filter((c) => c.source === source),
    [source],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Auto-select all eligible candidates when source changes
  useEffect(() => {
    setSelected(new Set(visibleCandidates.filter((c) => c.eligibility === "ok").map((c) => c.id)));
  }, [source, visibleCandidates]);

  // Step 3: sequence
  const [tone, setTone] = useState<string>("Executive");
  const [steps, setSteps] = useState<SequenceStep[]>(() => [
    {
      id: "s0",
      kind: "connection",
      body: "",
      waitDays: 0,
    },
    {
      id: "s1",
      kind: "followup",
      body: "",
      waitDays: 4,
    },
    {
      id: "s2",
      kind: "followup",
      body: "",
      waitDays: 6,
    },
  ]);
  const [previewIdx, setPreviewIdx] = useState(0);

  // Step 4: schedule & safety
  const [dailyCap, setDailyCap] = useState(account.dailyCap);
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("18:00");
  const [weekends, setWeekends] = useState(false);

  // Recompute editable cap when account changes
  useEffect(() => {
    setDailyCap(account.dailyCap);
  }, [accountId, account.dailyCap]);

  const selectedCandidates = useMemo(
    () => ALL_CANDIDATES.filter((c) => selected.has(c.id)),
    [selected],
  );

  const effectiveDailyCap = account.warmup
    ? Math.min(dailyCap, account.warmup.todayLimit)
    : dailyCap;
  const daysToComplete = selectedCandidates.length === 0
    ? 0
    : Math.max(1, Math.ceil(selectedCandidates.length / Math.max(1, effectiveDailyCap)));

  const remainingManualApprovals = Math.max(0, 50 - account.totalSent);
  const approvalsNeeded = Math.min(remainingManualApprovals, selectedCandidates.length);

  const canContinueStep = (n: number) => {
    if (n === 1) return !!accountId;
    if (n === 2) return selectedCandidates.length > 0;
    if (n === 3) {
      const conn = steps.find((s) => s.kind === "connection");
      if (!conn || conn.body.trim().length === 0 || conn.body.length > 300) return false;
      return steps.every((s) => s.body.trim().length > 0);
    }
    return true;
  };

  const launch = () => {
    toast.success(
      `Campaign launched. ${selectedCandidates.length} prospects queued${
        approvalsNeeded > 0 ? ` · ${approvalsNeeded} await your approval` : ""
      }.`,
    );
    navigate({ to: "/outreach/$id", params: { id: "new-1" } });
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <PageHeader
        title="New campaign"
        subtitle="LinkedIn outreach via your connected account — recruiter-approved, never auto-sent."
      />

      {/* Pre-attached job context */}
      {job && project && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-brand-seafoam/15 px-4 py-3">
          <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
          <div className="flex-1 text-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-brand-text">{job.jobTitle}</span>
              <span className="font-mono text-[12px] text-brand-text-secondary">{job.jobCode}</span>
              <span className="text-brand-text-secondary">·</span>
              <span className="text-brand-text-secondary">
                {project.clientName} — {project.title}
              </span>
            </div>
            <div className="mt-0.5 text-[12px] text-brand-text-secondary">
              {preAttached
                ? "Pre-attached from job · campaign will be linked to this role"
                : "Default context · pre-attach a job by launching from the job page"}
            </div>
          </div>
          {job && (
            <Link
              to="/jobs/$id"
              params={{ id: job.id }}
              className="text-[12px] font-medium text-brand-primary hover:underline"
            >
              View job →
            </Link>
          )}
        </div>
      )}

      <StepIndicator current={step} />

      <div className="mt-8 pb-24">
        {step === 1 && (
          <Step1Account accountId={accountId} setAccountId={setAccountId} />
        )}
        {step === 2 && (
          <Step2Candidates
            source={source}
            setSource={setSource}
            visible={visibleCandidates}
            selected={selected}
            setSelected={setSelected}
            effectiveDailyCap={effectiveDailyCap}
            daysToComplete={daysToComplete}
          />
        )}
        {step === 3 && (
          <Step3Sequence
            steps={steps}
            setSteps={setSteps}
            tone={tone}
            setTone={setTone}
            candidates={selectedCandidates}
            previewIdx={previewIdx}
            setPreviewIdx={setPreviewIdx}
            job={job?.jobTitle ?? "the role"}
          />
        )}
        {step === 4 && (
          <Step4Safety
            account={account}
            dailyCap={dailyCap}
            setDailyCap={setDailyCap}
            startHour={startHour}
            setStartHour={setStartHour}
            endHour={endHour}
            setEndHour={setEndHour}
            weekends={weekends}
            setWeekends={setWeekends}
            approvalsNeeded={approvalsNeeded}
            remainingManualApprovals={remainingManualApprovals}
          />
        )}
        {step === 5 && (
          <Step5Review
            account={account}
            project={project?.title ?? ""}
            client={project?.clientName ?? ""}
            jobTitle={job?.jobTitle ?? ""}
            jobCode={job?.jobCode ?? ""}
            candidates={selectedCandidates}
            steps={steps}
            tone={tone}
            dailyCap={dailyCap}
            startHour={startHour}
            endHour={endHour}
            weekends={weekends}
            approvalsNeeded={approvalsNeeded}
            daysToComplete={daysToComplete}
            onLaunch={launch}
          />
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          {step < 5 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinueStep(step)}
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step indicator                                                            */
/* -------------------------------------------------------------------------- */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="sticky top-0 z-10 -mx-8 border-b border-border bg-brand-bg/95 px-8 py-4 backdrop-blur">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const completed = current > s.id;
          const active = current === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    completed && "bg-brand-primary text-white",
                    active && "bg-brand-primary text-white ring-4 ring-brand-mint/40",
                    !completed && !active && "bg-gray-200 text-gray-500",
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "mt-1.5 whitespace-nowrap text-[11px]",
                    completed && "text-brand-primary",
                    active && "font-medium text-brand-text",
                    !completed && !active && "text-brand-text-secondary",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 -translate-y-3",
                    current > s.id ? "bg-brand-primary" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 1 — Sending account                                                  */
/* -------------------------------------------------------------------------- */

function Step1Account({
  accountId,
  setAccountId,
}: {
  accountId: string;
  setAccountId: (v: string) => void;
}) {
  const account = ACCOUNTS.find((a) => a.id === accountId)!;
  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Choose sending account</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Outreach goes from a recruiter's own connected LinkedIn account via our licensed Unipile
        integration. No scraping, no password sharing.
      </p>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Sending from
        </label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="h-auto py-2.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNTS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-[11px] font-semibold text-white">
                    {a.initials}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-brand-text">{a.name}</div>
                    <div className="text-[11px] text-brand-text-secondary">
                      {a.sentToday}/{a.dailyCap} sent today
                      {a.warmup ? ` · Warmup day ${a.warmup.day}/7` : ""}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
            {account.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-brand-text">{account.name}</div>
              <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />
            </div>
            <div className="text-[12px] text-brand-text-secondary">
              {account.email} · {account.connections.toLocaleString()} connections · connected{" "}
              {account.connectedAgo}
            </div>
          </div>
          {account.warmup ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              Warmup day {account.warmup.day}/7
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
              Healthy
            </span>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-[12px] text-brand-text-secondary">
              <span>Daily sends used today</span>
              <span className="tabular-nums">
                {account.sentToday} / {account.warmup?.todayLimit ?? account.dailyCap}
              </span>
            </div>
            <Progress
              value={
                (account.sentToday / (account.warmup?.todayLimit ?? account.dailyCap)) * 100
              }
              className="h-2"
            />
          </div>

          {account.totalSent < 50 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-[12px] text-amber-800">
              <strong>{50 - account.totalSent} manual approvals</strong> still required on this
              account (first 50 sends are recruiter-approved one-by-one).
            </div>
          )}
        </div>
      </div>

      {account.warmup && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="text-[13px] text-amber-900">
            <strong>This account is in 7-day warmup (day {account.warmup.day}/7).</strong> Daily
            sends ramp 5 → 7 → 9 → 10 → 12 → 14 → 15 to protect the LinkedIn account from being
            flagged. Today's ceiling is{" "}
            <strong>{account.warmup.todayLimit} sends</strong>. Warmup is not editable.
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => toast("Unipile OAuth flow would open here")}
        className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-brand-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Connect another LinkedIn account
      </button>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 — Candidates                                                       */
/* -------------------------------------------------------------------------- */

function Step2Candidates({
  source,
  setSource,
  visible,
  selected,
  setSelected,
  effectiveDailyCap,
  daysToComplete,
}: {
  source: SourceKey;
  setSource: (v: SourceKey) => void;
  visible: Candidate[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  effectiveDailyCap: number;
  daysToComplete: number;
}) {
  const toggle = (c: Candidate) => {
    if (c.eligibility !== "ok") return;
    const next = new Set(selected);
    if (next.has(c.id)) next.delete(c.id);
    else next.add(c.id);
    setSelected(next);
  };

  const eligibleIds = visible.filter((c) => c.eligibility === "ok").map((c) => c.id);
  const allSelected = eligibleIds.length > 0 && eligibleIds.every((id) => selected.has(id));
  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      eligibleIds.forEach((id) => next.delete(id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      eligibleIds.forEach((id) => next.add(id));
      setSelected(next);
    }
  };

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Select candidates</h2>
      <p className="mb-5 text-sm text-brand-text-secondary">
        Candidates come from your Norvex database. No live LinkedIn search.
      </p>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {SOURCES.map((s) => {
          const active = s.id === source;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(s.id)}
              className={cn(
                "rounded-xl border bg-card p-4 text-left transition-all",
                active
                  ? "border-brand-primary ring-2 ring-brand-mint/40"
                  : "border-border hover:border-brand-primary/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-text">{s.label}</span>
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-brand-text-secondary/40" />
                )}
              </div>
              <div className="mt-1 text-[12px] text-brand-text-secondary">{s.hint}</div>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-brand-text-secondary">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Candidate</th>
              <th className="px-4 py-3 text-left font-semibold">Match</th>
              <th className="px-4 py-3 text-left font-semibold">Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => {
              const blocked = c.eligibility !== "ok";
              return (
                <tr
                  key={c.id}
                  className={cn(
                    "border-t border-border",
                    blocked && "bg-gray-50/60 text-brand-text-secondary",
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(c.id)}
                      disabled={blocked}
                      onCheckedChange={() => toggle(c)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className={cn("font-medium", blocked ? "text-brand-text-secondary" : "text-brand-text")}>
                      {c.name}
                    </div>
                    <div className="text-[13px] text-brand-text-secondary">
                      {c.title} · {c.company}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreRing score={c.score} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {c.eligibility === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-[12px] text-green-700">
                        <Check className="h-3.5 w-3.5" /> Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-red-600">
                        <Lock className="h-3.5 w-3.5" /> {c.blockedDetail}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-brand-text-secondary">
                  No candidates from this source yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-mint/50 bg-brand-seafoam/15 px-4 py-3 text-sm">
        <div>
          <span className="font-semibold text-brand-text">{selected.size}</span>{" "}
          <span className="text-brand-text-secondary">candidates selected</span>
        </div>
        {selected.size > 0 && (
          <div className="text-[12px] text-brand-text-secondary">
            ≈ <strong className="text-brand-text">{daysToComplete}</strong>{" "}
            {daysToComplete === 1 ? "day" : "days"} to send all connection requests at{" "}
            {effectiveDailyCap}/day
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 — Sequence & messaging                                             */
/* -------------------------------------------------------------------------- */

function makeDraft(
  kind: SequenceStep["kind"],
  stepIdx: number,
  c: Candidate | undefined,
  tone: string,
  jobLabel: string,
): string {
  const first = c?.name.split(" ")[0] ?? "there";
  const companyBit = c ? ` at ${c.company}` : "";
  const toneOpener =
    tone === "Casual"
      ? "Hi"
      : tone === "Warm"
        ? "Hello"
        : tone === "Executive"
          ? ""
          : "Dear";
  const greet = toneOpener ? `${toneOpener} ${first},` : `${first} —`;

  if (kind === "connection") {
    return `${greet} I'm advising a leading client on a ${jobLabel} appointment in Jakarta. Your track record${companyBit} looks closely aligned with what they need. Open to a brief, confidential chat?`;
  }
  if (stepIdx === 1) {
    return `${greet} thanks for connecting. A bit more context: this ${jobLabel} role reports to the CEO and oversees a sizable team. Compensation is highly competitive. Would early next week work for a 20-minute call?`;
  }
  return `${greet} a brief final note on the ${jobLabel} opportunity. Decisions like this take time — happy to reconnect whenever the timing suits.`;
}

function Step3Sequence({
  steps,
  setSteps,
  tone,
  setTone,
  candidates,
  previewIdx,
  setPreviewIdx,
  job,
}: {
  steps: SequenceStep[];
  setSteps: (s: SequenceStep[]) => void;
  tone: string;
  setTone: (v: string) => void;
  candidates: Candidate[];
  previewIdx: number;
  setPreviewIdx: (n: number) => void;
  job: string;
}) {
  const updateStep = (i: number, patch: Partial<SequenceStep>) => {
    const next = steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setSteps(next);
  };
  const removeStep = (i: number) => {
    if (steps[i].kind === "connection") return;
    setSteps(steps.filter((_, idx) => idx !== i));
  };
  const addFollowup = () => {
    if (steps.length >= 4) return;
    setSteps([
      ...steps,
      { id: `s${steps.length}`, kind: "followup", body: "", waitDays: 5 },
    ]);
  };

  const draftWithAI = (i: number) => {
    const previewCand = candidates[previewIdx];
    const body = makeDraft(steps[i].kind, i, previewCand, tone, job);
    updateStep(i, { body });
    toast.success("AI draft generated · personalize before launch");
  };

  const draftAll = () => {
    const previewCand = candidates[previewIdx];
    setSteps(
      steps.map((s, i) => ({
        ...s,
        body: makeDraft(s.kind, i, previewCand, tone, job),
      })),
    );
    toast.success("AI drafted all steps");
  };

  const preview = candidates[previewIdx];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">Sequence & messaging</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">
            Connection note → up to 2 follow-ups. Editable per step. AI drafts personalize per
            candidate using name, title, company and job selling points.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={draftAll} className="gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Draft all with AI
        </Button>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
            Tone
          </label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-[12px] text-brand-text-secondary">{TONE_DESC[tone]}</p>
        </div>
        {candidates.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
              Personalization preview
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPreviewIdx((previewIdx - 1 + candidates.length) % candidates.length)
                }
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1 truncate rounded-md border border-border bg-brand-bg/40 px-3 py-1.5 text-[13px]">
                <span className="font-medium text-brand-text">{preview?.name}</span>{" "}
                <span className="text-brand-text-secondary">
                  · {preview?.title} at {preview?.company}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewIdx((previewIdx + 1) % candidates.length)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-1.5 text-[12px] text-brand-text-secondary">
              Cycle to verify AI personalization on different candidates
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {steps.map((s, i) => {
          const isConnection = s.kind === "connection";
          const limit = isConnection ? 300 : 2000;
          const overLimit = s.body.length > limit;
          const empty = s.body.trim().length === 0;
          return (
            <div key={s.id}>
              {i > 0 && (
                <div className="relative flex h-16 items-center justify-center">
                  <div className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-l-2 border-dashed border-gray-300" />
                  <div className="relative z-10 flex items-center gap-2 rounded-full border-2 border-gray-300 bg-card px-3 py-1.5 shadow-sm">
                    <span className="text-[12px] text-brand-text-secondary">Wait</span>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={s.waitDays}
                      onChange={(e) =>
                        updateStep(i, { waitDays: Number(e.target.value) || 1 })
                      }
                      className="h-7 w-14 text-center text-sm"
                    />
                    <span className="text-[12px] text-brand-text-secondary">
                      days {i === 1 ? "after accepted" : "after prev. if no reply"}
                    </span>
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-medium text-brand-primary">Step {i + 1}</div>
                    <div className="mt-0.5 text-sm font-semibold text-brand-text">
                      {isConnection ? "Connection request note" : `Follow-up message ${i}`}
                    </div>
                    <div className="text-[12px] text-brand-text-secondary">
                      {isConnection
                        ? "LinkedIn connection note · max 300 characters"
                        : "LinkedIn message · sent if no reply"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => draftWithAI(i)}
                      className="gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Draft with AI
                    </Button>
                    {!isConnection && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(i)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  value={s.body}
                  onChange={(e) => updateStep(i, { body: e.target.value })}
                  placeholder={
                    isConnection
                      ? "Short, personal, opens the door…"
                      : "Add context, value, and a clear ask…"
                  }
                  className="min-h-[110px] resize-y text-sm leading-relaxed"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[12px]",
                      empty
                        ? "text-amber-600"
                        : overLimit
                          ? "text-red-600"
                          : "text-brand-text-secondary",
                    )}
                  >
                    {empty
                      ? "Required"
                      : overLimit
                        ? `${s.body.length - limit} over limit`
                        : "Looks good"}
                  </span>
                  <span
                    className={cn(
                      "text-[12px] tabular-nums",
                      overLimit ? "text-red-600" : "text-brand-text-secondary",
                    )}
                  >
                    {s.body.length} / {limit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {steps.length < 4 && (
        <button
          type="button"
          onClick={addFollowup}
          className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-brand-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add follow-up
        </button>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-lg border border-brand-mint/50 bg-brand-seafoam/20 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
        <p className="text-[13px] text-brand-text">
          <span className="font-medium">Stop-on-reply is always on.</span> If a candidate replies
          at any step, the sequence stops immediately and the reply lands in your Inbox.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 4 — Schedule & safety                                                */
/* -------------------------------------------------------------------------- */

function Step4Safety({
  account,
  dailyCap,
  setDailyCap,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  weekends,
  setWeekends,
  approvalsNeeded,
  remainingManualApprovals,
}: {
  account: LinkedInAccount;
  dailyCap: number;
  setDailyCap: (n: number) => void;
  startHour: string;
  setStartHour: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  weekends: boolean;
  setWeekends: (v: boolean) => void;
  approvalsNeeded: number;
  remainingManualApprovals: number;
}) {
  const warmupCeiling = account.warmup?.todayLimit ?? null;

  const clampHour = (v: string, fallback: string, min = 8, max = 18) => {
    const h = parseInt(v.split(":")[0] ?? "0", 10);
    if (Number.isNaN(h) || h < min || h > max) return fallback;
    return v;
  };

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Schedule & safety</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        These defaults are deliberate executive-search safety rails. Locked items cannot be
        disabled — they protect the recruiter's LinkedIn account and candidate experience.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Editable: daily cap */}
        <SafetyItem
          label="Daily send cap"
          help="Hard ceiling is 25. Default 15. Warmup may lower today's effective cap."
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={25}
              value={dailyCap}
              onChange={(e) =>
                setDailyCap(Math.min(25, Math.max(1, Number(e.target.value) || 15)))
              }
              className="h-8 w-20 text-center text-sm"
            />
            <span className="text-[12px] text-brand-text-secondary">per day</span>
            {warmupCeiling !== null && warmupCeiling < dailyCap && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Capped at {warmupCeiling} today by warmup
              </span>
            )}
          </div>
        </SafetyItem>

        {/* Editable: send window */}
        <SafetyItem
          label="Send window"
          help="Editable between 08:00 and 18:00 only — recipient timezone is enforced."
        >
          <div className="flex items-center gap-2">
            <Input
              type="time"
              min="08:00"
              max="18:00"
              value={startHour}
              onChange={(e) => setStartHour(clampHour(e.target.value, startHour))}
              className="h-8 w-28 text-sm"
            />
            <span className="text-[12px] text-brand-text-secondary">to</span>
            <Input
              type="time"
              min="08:00"
              max="18:00"
              value={endHour}
              onChange={(e) => setEndHour(clampHour(e.target.value, endHour))}
              className="h-8 w-28 text-sm"
            />
            <span className="rounded-full bg-brand-seafoam/40 px-2 py-0.5 text-[11px] font-medium text-brand-primary">
              Recipient TZ
            </span>
          </div>
        </SafetyItem>

        {/* Editable: weekends */}
        <SafetyItem
          label="Weekend sending"
          help="Off by default. Most executives prefer weekday-only outreach."
        >
          <div className="flex items-center gap-2">
            <Switch checked={weekends} onCheckedChange={setWeekends} />
            <span className="text-[12px] text-brand-text-secondary">
              {weekends ? "Mon–Sun" : "Mon–Fri only"}
            </span>
          </div>
        </SafetyItem>

        {/* Locked: stop-on-reply */}
        <SafetyItem
          label="Stop on reply"
          locked
          help="Always on. Any reply at any step halts the sequence for that candidate."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
            <Lock className="h-3 w-3" /> Locked ON
          </span>
        </SafetyItem>

        {/* Locked: manual approval first 50 */}
        <SafetyItem
          label="Manual approval — first 50 sends"
          locked
          help="The first 50 sends from this account go to an Approval Queue. Recruiter clicks Send on each one."
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
              <Lock className="h-3 w-3" /> Locked ON
            </span>
            {remainingManualApprovals > 0 ? (
              <span className="text-[12px] text-amber-700">
                {remainingManualApprovals} approvals remaining on this account
              </span>
            ) : (
              <span className="text-[12px] text-green-700">Threshold reached</span>
            )}
          </div>
        </SafetyItem>

        {/* Locked: warmup */}
        <SafetyItem
          label="New account warmup"
          locked
          help="New accounts ramp 5 → 7 → 9 → 10 → 12 → 14 → 15 over 7 days. Not editable."
        >
          {account.warmup ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              <Lock className="h-3 w-3" /> Day {account.warmup.day}/7 · {account.warmup.todayLimit}/day
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
              <Lock className="h-3 w-3" /> Complete
            </span>
          )}
        </SafetyItem>

        {/* Locked: do_not_contact */}
        <SafetyItem
          label="Do Not Contact list"
          locked
          help="Candidates flagged do_not_contact are excluded automatically and cannot be selected."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
            <Lock className="h-3 w-3" /> Enforced
          </span>
        </SafetyItem>
      </div>

      {approvalsNeeded > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-[13px] text-amber-900">
            <strong>{approvalsNeeded} of your selected candidates</strong> will require manual
            approval before sending. They'll appear in the Approval Queue — you click Send on each.
          </p>
        </div>
      )}
    </section>
  );
}

function SafetyItem({
  label,
  help,
  locked,
  children,
}: {
  label: string;
  help: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0",
        locked && "bg-brand-seafoam/10",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
          {locked && <Lock className="h-3.5 w-3.5 text-brand-primary" />}
          {label}
        </div>
        <div className="mt-0.5 text-[12px] text-brand-text-secondary">{help}</div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 5 — Review & launch                                                  */
/* -------------------------------------------------------------------------- */

function Step5Review({
  account,
  project,
  client,
  jobTitle,
  jobCode,
  candidates,
  steps,
  tone,
  dailyCap,
  startHour,
  endHour,
  weekends,
  approvalsNeeded,
  daysToComplete,
  onLaunch,
}: {
  account: LinkedInAccount;
  project: string;
  client: string;
  jobTitle: string;
  jobCode: string;
  candidates: Candidate[];
  steps: SequenceStep[];
  tone: string;
  dailyCap: number;
  startHour: string;
  endHour: string;
  weekends: boolean;
  approvalsNeeded: number;
  daysToComplete: number;
  onLaunch: () => void;
}) {
  const seqDescription =
    `${steps.length}-step sequence: Connection note` +
    steps
      .slice(1)
      .map((s, i) => ` → Follow-up ${i + 1} (wait ${s.waitDays}d)`)
      .join("");

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Review & launch</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Confirm campaign configuration. After launch, prospects appear in the campaign detail with
        per-prospect status and three-level kill switches (prospect / campaign / account).
      </p>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold text-brand-text">
          Campaign summary
        </div>
        <dl className="divide-y divide-border">
          <SumRow label="Job">
            <span className="font-medium text-brand-text">{jobTitle}</span>
            <span className="ml-2 font-mono text-[12px] text-brand-text-secondary">{jobCode}</span>
          </SumRow>
          <SumRow label="Project" value={`${client} — ${project}`} />
          <SumRow label="Sending account">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-semibold text-white">
                {account.initials}
              </span>
              {account.name}
              {account.warmup ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  Warmup day {account.warmup.day}/7
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                  Healthy
                </span>
              )}
            </span>
          </SumRow>
          <SumRow label="Candidates">
            <div className="flex flex-wrap gap-1.5">
              {candidates.slice(0, 8).map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-bg px-2 py-0.5 text-[12px]"
                >
                  {c.name}
                </span>
              ))}
              {candidates.length > 8 && (
                <span className="text-[12px] text-brand-text-secondary">
                  +{candidates.length - 8} more
                </span>
              )}
            </div>
          </SumRow>
          <SumRow label="Sequence" value={seqDescription} />
          <SumRow label="Tone" value={tone} />
          <SumRow
            label="Schedule"
            value={`${weekends ? "Mon–Sun" : "Mon–Fri"}, ${startHour}–${endHour} (recipient TZ)`}
          />
          <SumRow
            label="Pace"
            value={`Up to ${dailyCap}/day · ~${daysToComplete} ${daysToComplete === 1 ? "day" : "days"} to send all connection requests`}
          />
        </dl>
      </div>

      {approvalsNeeded > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
          <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-semibold text-amber-900">
              The first 50 sends from this account require manual approval
            </div>
            <p className="mt-1 text-[13px] text-amber-900">
              <strong>{approvalsNeeded}</strong> of your selected candidates will appear in the
              Approval Queue — you click Send on each one. This protects the LinkedIn account and
              is non-negotiable for executive-search outreach.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 text-sm font-semibold text-brand-text">Safety rails (locked)</div>
        <ul className="space-y-2 text-sm">
          {[
            "Stop on reply — sequence halts the moment a candidate replies",
            "Manual approval queue for first 50 sends per account",
            "7-day account warmup (5 → 15/day) on new accounts",
            "Send window 08:00 – 18:00, recipient timezone",
            "Daily cap ≤ 25, default 15",
            "Do Not Contact list enforced",
            "No scraping · sent from your own connected LinkedIn",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-brand-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onLaunch}
        className="mt-6 w-full rounded-xl py-6 text-base font-medium"
        disabled={candidates.length === 0}
      >
        <Rocket className="mr-2 h-5 w-5" />
        Launch campaign · {candidates.length} prospect{candidates.length === 1 ? "" : "s"}
      </Button>
      <p className="mt-2 text-center text-[12px] text-brand-text-secondary">
        AI drafts the messages. You approve and send. No auto-send, ever.
      </p>
    </section>
  );
}

function SumRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 px-5 py-3 text-sm">
      <dt className="text-brand-text-secondary">{label}</dt>
      <dd className="text-brand-text">{children ?? value}</dd>
    </div>
  );
}

// Re-export to satisfy unused warm-up constant reference
export const _WARMUP = WARMUP_RAMP;
