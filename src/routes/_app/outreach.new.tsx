import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { projects, getJobsByProject, type Job } from "@/lib/mock-data";
import {
  Users,
  GitBranch,
  Settings as SettingsIcon,
  MessageSquare,
  Rocket,
  Check,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader, ScoreRing, StatusBadge } from "@/components/shared";
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
  head: () => ({ meta: [{ title: "New Campaign — HireSmart" }] }),
  component: CampaignBuilder,
});

type EligibilityReason = "ok" | "no_linkedin" | "dnc" | "in_campaign";

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  stage: string;
  hasLinkedIn: boolean;
  eligibility: EligibilityReason;
  blockedDetail?: string;
}

const CANDIDATES: Candidate[] = [
  { id: "c1", name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia", score: 88, stage: "Shortlisted", hasLinkedIn: true, eligibility: "ok" },
  { id: "c2", name: "Priya Nair", title: "Finance Director", company: "Reliance Industries", score: 85, stage: "Shortlisted", hasLinkedIn: true, eligibility: "ok" },
  { id: "c3", name: "Amara Osei", title: "Group CFO", company: "Dangote Group", score: 82, stage: "Shortlisted", hasLinkedIn: true, eligibility: "ok" },
  { id: "c4", name: "Budi Santoso", title: "VP Finance", company: "Astra International", score: 76, stage: "Approved", hasLinkedIn: true, eligibility: "ok" },
  { id: "c5", name: "Patrick O'Brien", title: "CFO", company: "CIMB Bank", score: 71, stage: "Approved", hasLinkedIn: true, eligibility: "ok" },
  { id: "c6", name: "Tom Nguyen", title: "Finance Lead", company: "Vingroup", score: 59, stage: "Screening", hasLinkedIn: true, eligibility: "dnc", blockedDetail: "Do Not Contact" },
  { id: "c7", name: "James Chen", title: "CFO", company: "Sinopec", score: 55, stage: "Screening", hasLinkedIn: true, eligibility: "in_campaign", blockedDetail: "Active in campaign: CFO — Stylo Q1" },
  { id: "c8", name: "Kartika Sari", title: "Finance Director", company: "Bank Mandiri", score: 42, stage: "Screening", hasLinkedIn: false, eligibility: "no_linkedin", blockedDetail: "Missing LinkedIn profile" },
];

const STEPS = [
  { id: 1, label: "Select candidates", Icon: Users },
  { id: 2, label: "Sequence", Icon: GitBranch },
  { id: 3, label: "Settings", Icon: SettingsIcon },
  { id: 4, label: "Review messages", Icon: MessageSquare },
  { id: 5, label: "Launch", Icon: Rocket },
];

const PRESETS = {
  quick: { label: "Quick (2 steps)", steps: 2, waits: [5] },
  standard: { label: "Standard (3 steps)", steps: 3, waits: [5, 7] },
  extended: { label: "Extended (4 steps)", steps: 4, waits: [5, 7, 7] },
} as const;
type PresetKey = keyof typeof PRESETS;

const TONES = ["Professional", "Warm", "Executive", "Casual"] as const;
const TONE_DESC: Record<string, string> = {
  Professional: "Formal, direct, business-focused",
  Warm: "Friendly, conversational, relationship-first",
  Executive: "Peer-to-peer, concise, respect for their time",
  Casual: "Relaxed, informal, approachable",
};

function CampaignBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [project, setProject] = useState("indorama-cfo");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(CANDIDATES.filter((c) => c.eligibility === "ok").slice(0, 5).map((c) => c.id)),
  );

  // Step 2
  const [preset, setPreset] = useState<PresetKey>("standard");
  const [waits, setWaits] = useState<number[]>([...PRESETS.standard.waits]);

  // Step 3
  const [campaignName, setCampaignName] = useState("CFO Search — Indorama · Outreach 1");
  const [linkedInAccount, setLinkedInAccount] = useState("amarsh");
  const [tone, setTone] = useState("Executive");
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("18:00");
  const [timezone, setTimezone] = useState("recipient");
  const [weekends, setWeekends] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Step 4
  const selectedCandidates = useMemo(
    () => CANDIDATES.filter((c) => selected.has(c.id)),
    [selected],
  );
  const numSteps = PRESETS[preset].steps;
  const totalMessages = selectedCandidates.length * numSteps;
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const reviewedCount = reviewed.size;

  const choosePreset = (k: PresetKey) => {
    setPreset(k);
    setWaits([...PRESETS[k].waits]);
  };

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const canLaunch = reviewedCount === totalMessages;

  const launch = () => {
    toast.success(`Campaign launched! ${selectedCandidates.length} connection requests queued.`);
    navigate({ to: "/outreach/$id", params: { id: "new-1" } });
  };

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader
        title="New campaign"
        subtitle="Build a LinkedIn outreach sequence with built-in safety rails."
      />

      <StepIndicator current={step} />

      <div className="mt-8 pb-24">
        {step === 1 && (
          <Step1
            project={project}
            setProject={setProject}
            selected={selected}
            setSelected={setSelected}
          />
        )}
        {step === 2 && (
          <Step2 preset={preset} choose={choosePreset} waits={waits} setWaits={setWaits} />
        )}
        {step === 3 && (
          <Step3
            campaignName={campaignName}
            setCampaignName={setCampaignName}
            linkedInAccount={linkedInAccount}
            setLinkedInAccount={setLinkedInAccount}
            tone={tone}
            setTone={setTone}
            startHour={startHour}
            setStartHour={setStartHour}
            endHour={endHour}
            setEndHour={setEndHour}
            timezone={timezone}
            setTimezone={setTimezone}
            weekends={weekends}
            setWeekends={setWeekends}
            startDate={startDate}
            setStartDate={setStartDate}
            numCandidates={selectedCandidates.length}
            numSteps={numSteps}
          />
        )}
        {step === 4 && (
          <Step4
            candidates={selectedCandidates}
            numSteps={numSteps}
            waits={waits}
            tone={tone}
            reviewed={reviewed}
            setReviewed={setReviewed}
            totalMessages={totalMessages}
          />
        )}
        {step === 5 && (
          <Step5
            campaignName={campaignName}
            candidates={selectedCandidates}
            numSteps={numSteps}
            waits={waits}
            tone={tone}
            startHour={startHour}
            endHour={endHour}
            weekends={weekends}
            startDate={startDate}
            reviewedCount={reviewedCount}
            totalMessages={totalMessages}
            canLaunch={canLaunch}
            onLaunch={launch}
          />
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            <button
              type="button"
              onClick={() => toast.success("Draft saved")}
              className="text-sm text-brand-text-secondary hover:text-brand-text"
            >
              Save as draft
            </button>
          </div>

          {step < 4 && (
            <Button onClick={goNext}>
              {step === 3 ? "Generate messages" : "Continue"}
            </Button>
          )}
          {step === 4 && <Button onClick={goNext}>Continue</Button>}
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Step indicator -------------------------- */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="sticky top-0 z-10 -mx-8 mb-2 border-b border-border bg-brand-bg/95 px-8 py-4 backdrop-blur">
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
                    "mt-1.5 text-[11px] whitespace-nowrap",
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

/* -------------------------- Step 1 -------------------------- */

function Step1({
  project,
  setProject,
  selected,
  setSelected,
}: {
  project: string;
  setProject: (v: string) => void;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
}) {
  const toggle = (id: string) => {
    const c = CANDIDATES.find((x) => x.id === id);
    if (!c || c.eligibility !== "ok") return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const eligibleIds = CANDIDATES.filter((c) => c.eligibility === "ok").map((c) => c.id);
  const allSelected = eligibleIds.every((id) => selected.has(id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(eligibleIds));
  };

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Select candidates</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Choose which shortlisted candidates to include in this campaign.
      </p>

      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
          Project
        </label>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indorama-cfo">CFO Search — Indorama Ventures</SelectItem>
            <SelectItem value="oyo-coo">COO Search — OYO Hotels</SelectItem>
            <SelectItem value="kns-cto">CTO Search — KNS Group</SelectItem>
          </SelectContent>
        </Select>
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
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">LinkedIn</th>
              <th className="px-4 py-3 text-left font-semibold">Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c) => {
              const blocked = c.eligibility !== "ok";
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(c.id)}
                      disabled={blocked}
                      onCheckedChange={() => toggle(c.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-text">{c.name}</div>
                    <div className="text-[13px] text-brand-text-secondary">
                      {c.title} · {c.company}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreRing score={c.score} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.stage} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.hasLinkedIn ? (
                      <Check className="mx-auto h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-red-500">✕</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.eligibility === "ok" ? (
                      <span className="text-green-700">Eligible</span>
                    ) : (
                      <span
                        className={cn(
                          c.eligibility === "in_campaign" ? "text-amber-600" : "text-red-500",
                        )}
                      >
                        Blocked — {c.blockedDetail}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-brand-text-secondary">
        {selected.size} of {CANDIDATES.filter((c) => c.eligibility === "ok").length} eligible candidates selected
      </div>
    </section>
  );
}

/* -------------------------- Step 2 -------------------------- */

function Step2({
  preset,
  choose,
  waits,
  setWaits,
}: {
  preset: PresetKey;
  choose: (k: PresetKey) => void;
  waits: number[];
  setWaits: (w: number[]) => void;
}) {
  const numSteps = PRESETS[preset].steps;

  const stepCard = (idx: number) => {
    const isConnection = idx === 0;
    const isFinal = idx === numSteps - 1;
    const label = isConnection
      ? "Connection request"
      : isFinal && idx > 0
        ? `Follow-up message #${idx} (final)`
        : `Follow-up message #${idx}`;
    const charLimit = isConnection ? "max 300 characters" : "max 2,000 characters";
    const channelLabel = isConnection ? "LinkedIn connection note" : "LinkedIn message";
    const subtitle = isConnection
      ? "Sent immediately on launch"
      : idx === 1
        ? "Sent if no reply after wait period"
        : isFinal
          ? "Final touchpoint — stop after this"
          : "Sent if no reply after wait period";

    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-[13px] font-medium text-brand-primary">Step {idx + 1}</div>
        <div className="mt-0.5 text-sm font-semibold text-brand-text">{label}</div>
        <div className="mt-1 text-[13px] text-brand-text-secondary">
          {channelLabel} <span className="text-brand-text-secondary/70">({charLimit})</span>
        </div>
        <div className="mt-2 text-[13px] text-brand-text-secondary">{subtitle}</div>
      </div>
    );
  };

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Sequence</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Define your outreach touchpoints and timing.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
          <button
            key={k}
            onClick={() => choose(k)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all",
              preset === k
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-border bg-card text-brand-text hover:border-brand-primary/50",
            )}
          >
            {PRESETS[k].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-stretch">
        {Array.from({ length: numSteps }).map((_, idx) => (
          <div key={idx}>
            {stepCard(idx)}
            {idx < numSteps - 1 && (
              <div className="relative flex h-20 items-center justify-center">
                <div className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-l-2 border-dashed border-gray-300" />
                <div className="relative z-10 flex items-center gap-2 rounded-full border-2 border-gray-300 bg-card px-3 py-1.5 shadow-sm">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={waits[idx] ?? 5}
                    onChange={(e) => {
                      const next = [...waits];
                      next[idx] = Number(e.target.value) || 1;
                      setWaits(next);
                    }}
                    className="h-7 w-14 text-center text-sm"
                  />
                  <span className="text-xs text-brand-text-secondary">
                    days {idx === 0 ? "after accepted" : "if no reply"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-lg border border-brand-mint/50 bg-brand-seafoam/20 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
        <p className="text-[13px] text-brand-text">
          <span className="font-medium">Auto-stop on reply is always enabled.</span> If a candidate replies at any step,
          the sequence stops immediately and the reply appears in your Inbox.
        </p>
      </div>
    </section>
  );
}

/* -------------------------- Step 3 -------------------------- */

function Step3(props: {
  campaignName: string;
  setCampaignName: (v: string) => void;
  linkedInAccount: string;
  setLinkedInAccount: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  startHour: string;
  setStartHour: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  weekends: boolean;
  setWeekends: (v: boolean) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  numCandidates: number;
  numSteps: number;
}) {
  const totalMsgs = props.numCandidates * props.numSteps;
  const dailyCap = 15;
  const todayUsed = 6;

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Settings</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Configure campaign details and review your account's safety status.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <Card title="Campaign details">
            <Field label="Campaign name">
              <Input value={props.campaignName} onChange={(e) => props.setCampaignName(e.target.value)} />
            </Field>
            <Field label="LinkedIn account">
              <Select value={props.linkedInAccount} onValueChange={props.setLinkedInAccount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amarsh">Amarsh Jain — LinkedIn</SelectItem>
                  <SelectItem value="sarah">Sarah Patel — LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tone">
              <Select value={props.tone} onValueChange={props.setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[12px] text-brand-text-secondary">{TONE_DESC[props.tone]}</p>
            </Field>
          </Card>

          <Card title="Schedule">
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <Input type="time" value={props.startHour} onChange={(e) => props.setStartHour(e.target.value)} />
              </Field>
              <Field label="To">
                <Input type="time" value={props.endHour} onChange={(e) => props.setEndHour(e.target.value)} />
              </Field>
            </div>
            <Field label="Timezone">
              <Select value={props.timezone} onValueChange={props.setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipient">Recipient's timezone (auto-detected)</SelectItem>
                  <SelectItem value="sender">Sender's timezone</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border bg-brand-bg/40 px-3 py-2">
              <span className="text-sm text-brand-text">Send on weekends</span>
              <Switch checked={props.weekends} onCheckedChange={props.setWeekends} />
            </div>
            <Field label="Start date">
              <Input type="date" value={props.startDate} onChange={(e) => props.setStartDate(e.target.value)} />
            </Field>
          </Card>
        </div>

        {/* Right column */}
        <div>
          <div className="rounded-xl border border-border border-l-4 border-l-brand-primary bg-brand-seafoam/10 p-5">
            <div className="mb-4">
              <div className="text-sm font-semibold text-brand-text">Account health</div>
              <div className="mt-2 text-sm font-medium text-brand-text">Amarsh Jain — LinkedIn</div>
              <div className="text-[13px] text-brand-text-secondary">1,247 connections</div>
              <div className="text-[13px] text-brand-text-secondary">Connected 3 months ago</div>
            </div>

            <div className="space-y-4">
              <SafetyRow label="Daily send cap">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-[12px] text-brand-text-secondary">
                    <span>{todayUsed} of {dailyCap} used today</span>
                    <span>15 / day</span>
                  </div>
                  <Progress value={(todayUsed / dailyCap) * 100} className="h-2" />
                </div>
              </SafetyRow>

              <SafetyRow label="Warmup status">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700">
                  Complete ✓
                </span>
              </SafetyRow>

              <SafetyRow label="Manual approval">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[12px] font-medium text-amber-700">
                  Required for next 41 sends
                </span>
              </SafetyRow>

              <SafetyRow label="Weekend sending">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-600">
                  Disabled
                </span>
              </SafetyRow>

              <SafetyRow label="Send window">
                <span className="text-[12px] text-brand-text">
                  {props.startHour} – {props.endHour} (recipient timezone)
                </span>
              </SafetyRow>
            </div>

            <div className="mt-5 rounded-lg bg-brand-bg p-4 text-[13px] text-brand-text-secondary">
              <p>
                This campaign: <strong className="text-brand-text">{props.numCandidates}</strong> candidates ×{" "}
                <strong className="text-brand-text">{props.numSteps}</strong> steps ={" "}
                <strong className="text-brand-text">{totalMsgs}</strong> total messages
              </p>
              <p className="mt-1">
                At <strong className="text-brand-text">{dailyCap}</strong> sends/day: ~
                <strong className="text-brand-text">
                  {Math.max(1, Math.ceil(props.numCandidates / dailyCap))}
                </strong>{" "}
                day to send all connection requests
              </p>
              <p className="mt-1">
                Full sequence completion: <strong className="text-brand-text">~3 weeks</strong> (including follow-up wait times)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-sm font-semibold text-brand-text">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

function SafetyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-[140px] flex-shrink-0 text-[13px] text-brand-text-secondary">{label}</span>
      <div className="flex flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

/* -------------------------- Step 4 -------------------------- */

function draftMessage(candidate: Candidate, stepIdx: number, _tone: string): string {
  const first = candidate.name.split(" ")[0];
  if (stepIdx === 0) {
    return `${first} — I'm advising a leading petrochemical company in Jakarta on their CFO appointment. Your track record at ${candidate.company}, particularly the scale of the operation and your M&A experience, aligns closely with what they're looking for. Would you be open to a brief, confidential conversation?`;
  }
  if (stepIdx === 1) {
    return `${first}, thank you for connecting. I wanted to share a bit more context — the role reports directly to the CEO and oversees finance across four business units with a team of 50+. The compensation is highly competitive. Would Tuesday or Wednesday work for a 20-minute call?`;
  }
  return `Hi ${first} — just a brief follow-up on the CFO opportunity I mentioned. I appreciate these decisions take time. If the timing isn't right now, I completely understand. Happy to reconnect whenever it suits you.`;
}

function Step4({
  candidates,
  numSteps,
  waits: _waits,
  tone,
  reviewed,
  setReviewed,
  totalMessages,
}: {
  candidates: Candidate[];
  numSteps: number;
  waits: number[];
  tone: string;
  reviewed: Set<string>;
  setReviewed: (s: Set<string>) => void;
  totalMessages: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(candidates[0]?.id ?? null);

  const toggleReviewed = (key: string) => {
    const next = new Set(reviewed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setReviewed(next);
  };

  const markAll = () => {
    const next = new Set<string>();
    candidates.forEach((c) => {
      for (let i = 0; i < numSteps; i++) next.add(`${c.id}-${i}`);
    });
    setReviewed(next);
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">
            AI has drafted {totalMessages} messages for {candidates.length} candidates
          </h2>
          <p className="mt-1 text-[12px] text-brand-text-secondary">
            Model: Claude Sonnet 4.6 · Tone: {tone} · Est. cost: ${(totalMessages * 0.011).toFixed(2)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Regenerated all messages")}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Regenerate all
        </Button>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-brand-text">
            {reviewed.size} of {totalMessages} messages reviewed
          </span>
          <button
            type="button"
            onClick={markAll}
            className="text-[13px] font-medium text-brand-primary hover:underline"
          >
            Mark all as reviewed
          </button>
        </div>
        <Progress value={(reviewed.size / totalMessages) * 100} className="h-2" />
      </div>

      <div className="space-y-3">
        {candidates.map((c) => {
          const reviewedCount = Array.from({ length: numSteps }).filter((_, i) =>
            reviewed.has(`${c.id}-${i}`),
          ).length;
          const open = expanded === c.id;
          return (
            <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : c.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-brand-seafoam/20"
              >
                <div>
                  <div className="font-medium text-brand-text">{c.name}</div>
                  <div className="text-[13px] text-brand-text-secondary">
                    {c.title} at {c.company}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-brand-text-secondary">
                  <span>{reviewedCount} / {numSteps} reviewed</span>
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              {open && (
                <div className="space-y-4 border-t border-border bg-brand-bg/40 p-5">
                  {Array.from({ length: numSteps }).map((_, i) => {
                    const key = `${c.id}-${i}`;
                    const isReviewed = reviewed.has(key);
                    const isConnection = i === 0;
                    const limit = isConnection ? 300 : 2000;
                    const draft = draftMessage(c, i, tone);
                    return (
                      <MessageEditor
                        key={key}
                        title={isConnection ? "Step 1: Connection note" : `Step ${i + 1}: Follow-up #${i}`}
                        defaultValue={draft}
                        limit={limit}
                        reviewed={isReviewed}
                        onToggleReviewed={() => toggleReviewed(key)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MessageEditor({
  title,
  defaultValue,
  limit,
  reviewed,
  onToggleReviewed,
}: {
  title: string;
  defaultValue: string;
  limit: number;
  reviewed: boolean;
  onToggleReviewed: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const over = value.length > limit;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-medium text-brand-text">{title}</div>
        <div className={cn("text-[12px] tabular-nums", over ? "text-red-500" : "text-brand-text-secondary")}>
          {value.length} / {limit}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[100px] resize-y text-sm leading-relaxed"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setValue(defaultValue)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
        <button
          type="button"
          onClick={onToggleReviewed}
          className="flex items-center gap-1.5 text-[13px] font-medium"
        >
          {reviewed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700">Reviewed</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-brand-text-secondary">Mark as reviewed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------------- Step 5 -------------------------- */

function Step5({
  campaignName,
  candidates,
  numSteps,
  waits,
  tone,
  startHour,
  endHour,
  weekends,
  startDate,
  reviewedCount,
  totalMessages,
  canLaunch,
  onLaunch,
}: {
  campaignName: string;
  candidates: Candidate[];
  numSteps: number;
  waits: number[];
  tone: string;
  startHour: string;
  endHour: string;
  weekends: boolean;
  startDate: string;
  reviewedCount: number;
  totalMessages: number;
  canLaunch: boolean;
  onLaunch: () => void;
}) {
  const seqStr = `${numSteps}-step sequence: Connection note${waits
    .slice(0, numSteps - 1)
    .map((w, i) => ` → ${i === waits.length - 1 || i === numSteps - 2 ? "Final follow-up" : "Follow-up"} (${w} days)`)
    .join("")}`;

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-brand-text">Review and launch</h2>
      <p className="mb-6 text-sm text-brand-text-secondary">
        Confirm your campaign configuration before going live.
      </p>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold text-brand-text">
          Campaign summary
        </div>
        <dl className="divide-y divide-border">
          <SumRow label="Campaign" value={campaignName} />
          <SumRow label="Project" value="Chief Financial Officer — Indorama Ventures" />
          <SumRow label="Candidates">
            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-bg px-2 py-1 text-[12px]"
                >
                  <ScoreRing score={c.score} size="sm" />
                  {c.name}
                </span>
              ))}
            </div>
          </SumRow>
          <SumRow label="Sequence" value={seqStr} />
          <SumRow label="LinkedIn account">
            <span className="inline-flex items-center gap-2">
              Amarsh Jain
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                Healthy
              </span>
            </span>
          </SumRow>
          <SumRow label="Tone" value={tone} />
          <SumRow
            label="Schedule"
            value={`${weekends ? "Mon–Sun" : "Mon–Fri"}, ${startHour} – ${endHour} (recipient timezone), starting ${startDate}`}
          />
          <SumRow label="Messages reviewed">
            <span className={cn(reviewedCount === totalMessages ? "text-green-700" : "text-amber-600")}>
              {reviewedCount} of {totalMessages} reviewed
              {reviewedCount === totalMessages && " ✓"}
            </span>
          </SumRow>
          <SumRow label="Est. completion" value="~3 weeks for full sequence" />
          <SumRow label="Est. AI cost" value={`$${(totalMessages * 0.011).toFixed(2)}`} />
        </dl>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 text-sm font-semibold text-brand-text">Safety rails</div>
        <ul className="space-y-2 text-sm">
          {[
            "Daily send cap: 15 messages/day",
            "Manual approval mode: Active (first 50 sends)",
            "Stop on reply: Enabled",
            "Business hours only: 8 AM – 6 PM",
            "Weekend sending: Disabled",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-brand-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-brand-mint/50 bg-brand-seafoam/20 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
        <div>
          <p className="text-[13px] text-brand-text">
            Because this account has fewer than 50 total sends, every message requires your manual approval
            before sending. Messages will appear in your Approval Queue — you click Send on each one.
          </p>
          <p className="mt-1 text-[12px] text-brand-text-secondary">
            This is a safety feature that protects your LinkedIn account.
          </p>
        </div>
      </div>

      {!canLaunch && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-[13px] text-amber-800">
            Review all messages before launching. {totalMessages - reviewedCount} message
            {totalMessages - reviewedCount === 1 ? "" : "s"} still need your approval.
          </p>
        </div>
      )}

      <Button
        onClick={onLaunch}
        disabled={!canLaunch}
        className="mt-6 w-full rounded-xl py-6 text-base font-medium"
      >
        <Rocket className="mr-2 h-5 w-5" />
        Launch campaign
      </Button>
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
