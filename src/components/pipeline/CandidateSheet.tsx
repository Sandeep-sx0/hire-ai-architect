import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScoreRing, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Linkedin,
  Mail,
  Phone,
  MessageCircle,
  MoreHorizontal,
  Lock,
  Star,
  Upload,
  FileText,
  Download,
  ArrowRight,
  Plus,
  Send,
  X,
  AlertCircle,
} from "lucide-react";

/* ============================================================
 * Types
 * ============================================================ */

export type CandidateStage =
  | "applied"
  | "screening"
  | "shortlisted"
  | "submitted"
  | "interview"
  | "offer"
  | "placed"
  | "rejected";

export interface CandidateStageDef {
  id: CandidateStage;
  label: string;
  color?: string;
  gated?: boolean;
}

export interface CandidateLike {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  skills: string[];
  stage: CandidateStage;
  daysInStage: number;
  assigned: string;
  checklist: { label: string; done: boolean }[];
  rejectionReason?: string;
  doNotContact?: boolean;
}

export interface CandidateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateLike | null;
  stages: CandidateStageDef[];
  jobLabel?: string;
  requiredSkills?: string[];
  onMove: (to: CandidateStage) => void;
  onReject: (reason: string, note: string) => void;
  onMessage?: () => void;
}

/* ============================================================
 * Mock — global profile facts keyed by candidate id with sane defaults
 * ============================================================ */

interface ProfileFacts {
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  location: string;
  summary: string;
  experienceYears: number;
  seniority: string;
  notice: string;
  salaryExpectation: string;
  relocate: string;
  languages: string[];
  certifications: string[];
  education: { school: string; degree: string; year: string }[];
  workHistory: { title: string; company: string; from: string; to: string }[];
  files: { name: string; size: string; uploaded: string }[];
}

const PROFILE_DEFAULTS: ProfileFacts = {
  email: "candidate@example.com",
  phone: "+62 812 0000 0000",
  whatsapp: "+62 812 0000 0000",
  linkedin: "https://linkedin.com/in/example",
  location: "Jakarta, Indonesia",
  summary:
    "Seasoned finance leader with cross-border M&A and IPO experience across Southeast Asia, blending FP&A rigor with board-level communication.",
  experienceYears: 18,
  seniority: "C-Suite",
  notice: "3 months",
  salaryExpectation: "USD 240–280K base",
  relocate: "Open within APAC",
  languages: ["English (Native)", "Bahasa Indonesia (Native)", "Mandarin (Conversational)"],
  certifications: ["CFA Charterholder", "CPA"],
  education: [
    { school: "INSEAD", degree: "MBA", year: "2010" },
    { school: "Universitas Indonesia", degree: "B.Sc. Accounting", year: "2004" },
  ],
  workHistory: [
    { title: "Current title", company: "Current company", from: "2020", to: "Present" },
    { title: "VP Finance", company: "Prev. Co", from: "2015", to: "2020" },
    { title: "Finance Manager", company: "Earlier Co", from: "2010", to: "2015" },
  ],
  files: [
    { name: "CV_Master_2025.pdf", size: "412 KB", uploaded: "3 days ago" },
    { name: "Reference_letter.pdf", size: "88 KB", uploaded: "2 days ago" },
  ],
};

/* ============================================================
 * Main component
 * ============================================================ */

export function CandidateSheet({
  open,
  onOpenChange,
  candidate,
  stages,
  jobLabel = "CFO Search — Indorama Ventures",
  requiredSkills = [],
  onMove,
  onReject,
  onMessage,
}: CandidateSheetProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmAdvance, setConfirmAdvance] = useState<CandidateStage | null>(null);

  if (!candidate) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="p-0 sm:max-w-none" style={{ width: 520, maxWidth: "100vw" }} />
      </Sheet>
    );
  }

  const profile = PROFILE_DEFAULTS;
  const stageDef = stages.find((s) => s.id === candidate.stage)!;
  const stageIdx = stages.findIndex((s) => s.id === candidate.stage);
  const next = stages[stageIdx + 1];
  const initials = candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const requiredSet = useMemo(
    () => new Set(requiredSkills.map((s) => s.toLowerCase())),
    [requiredSkills],
  );

  const handleAdvance = () => {
    if (!next) return;
    const incomplete = candidate.checklist.length > 0 && candidate.checklist.some((i) => !i.done);
    const advancingPastGate = stageDef.gated && incomplete;
    if (advancingPastGate) {
      setConfirmAdvance(next.id);
      return;
    }
    onMove(next.id);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 sm:max-w-none"
          style={{ width: 560, maxWidth: "100vw" }}
        >
          {/* HEADER (sticky) */}
          <div className="border-b border-border bg-card px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-sm font-semibold text-brand-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-[15px] font-semibold text-brand-text">
                    {candidate.name}
                  </h2>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-text-secondary hover:text-brand-primary"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="truncate text-[13px] text-brand-text-secondary">
                  {candidate.title} @ {candidate.company}
                </div>
                <div className="truncate text-[12px] text-brand-text-secondary">
                  {profile.location}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <ScoreRing score={candidate.score} size="md" />
                {candidate.doNotContact && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200">
                    <Lock className="h-3 w-3" />
                    Do not contact
                  </span>
                )}
              </div>
            </div>

            {/* Quick actions row */}
            <div className="mt-3 flex items-center gap-2">
              <Select
                value={candidate.stage}
                onValueChange={(v) => onMove(v as CandidateStage)}
              >
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                disabled={candidate.doNotContact}
                onClick={() => (onMessage ? onMessage() : toast("Outreach composer"))}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Message
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast("Add to another job")}>
                    Add to another job
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast("Edit profile")}>
                    Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Do-not-contact flag updated")}>
                    {candidate.doNotContact ? "Remove do-not-contact" : "Flag do-not-contact"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-status-danger"
                    onClick={() => toast("Removed from pipeline")}
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Remove from pipeline
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-brand-text-secondary">
              <StatusBadge status={stageDef.id} label={stageDef.label} />
              <span>·</span>
              <span>{jobLabel}</span>
            </div>
          </div>

          {/* BODY — Tabs (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="overview" className="flex h-full flex-col">
              <TabsList className="sticky top-0 z-10 grid w-full grid-cols-5 rounded-none border-b border-border bg-card px-2">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="match" className="text-xs">AI Match</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="m-0 space-y-5 px-5 py-5">
                {/* Contact row */}
                <section className="grid grid-cols-2 gap-2">
                  <ContactPill icon={Mail} label={profile.email} />
                  <ContactPill icon={Phone} label={profile.phone} />
                  <ContactPill
                    icon={MessageCircle}
                    label={`WhatsApp · ${profile.whatsapp}`}
                    accent
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                  />
                  <ContactPill icon={Linkedin} label="LinkedIn profile" href={profile.linkedin} />
                </section>

                {/* AI summary */}
                <section className="rounded-lg border border-border bg-brand-bg/40 p-3">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
                    AI summary
                  </div>
                  <p className="text-[13px] leading-relaxed text-brand-text">{profile.summary}</p>
                </section>

                {/* Key facts grid */}
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                    Key facts
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                    <Fact label="Experience" value={`${profile.experienceYears} years`} />
                    <Fact label="Seniority" value={profile.seniority} />
                    <Fact label="Notice period" value={profile.notice} />
                    <Fact label="Salary expectation" value={profile.salaryExpectation} />
                    <Fact label="Relocation" value={profile.relocate} />
                    <Fact label="Assigned" value={candidate.assigned} />
                  </dl>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s) => {
                      const matched = requiredSet.has(s.toLowerCase());
                      return (
                        <span
                          key={s}
                          className={cn(
                            "rounded px-2 py-0.5 text-[11px]",
                            matched
                              ? "bg-brand-mint/30 text-brand-primary ring-1 ring-brand-mint"
                              : "bg-brand-bg text-brand-text-secondary",
                          )}
                          title={matched ? "Matches job requirement" : undefined}
                        >
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </section>

                {/* Work history */}
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                    Work history
                  </h3>
                  <ol className="space-y-2.5 border-l border-border pl-3">
                    {profile.workHistory.map((w, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[15px] top-1.5 h-2 w-2 rounded-full bg-brand-mint ring-2 ring-card" />
                        <div className="text-[13px] font-medium text-brand-text">{w.title}</div>
                        <div className="text-[12px] text-brand-text-secondary">
                          {w.company} · {w.from}–{w.to}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Education / certs / languages */}
                <section className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                      Education
                    </h3>
                    <ul className="space-y-1 text-[13px] text-brand-text">
                      {profile.education.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium">{e.degree}</span>
                          <span className="text-brand-text-secondary"> · {e.school} · {e.year}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.certifications.map((c) => (
                        <span key={c} className="rounded bg-brand-bg px-2 py-0.5 text-[12px] text-brand-text">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                      Languages
                    </h3>
                    <ul className="text-[13px] text-brand-text">
                      {profile.languages.map((l) => <li key={l}>{l}</li>)}
                    </ul>
                  </div>
                </section>
              </TabsContent>

              {/* AI MATCH */}
              <TabsContent value="match" className="m-0 space-y-5 px-5 py-5">
                <MatchPanel score={candidate.score} />
              </TabsContent>

              {/* ACTIVITY */}
              <TabsContent value="activity" className="m-0 space-y-3 px-5 py-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                  Activity · {jobLabel}
                </h3>
                <ol className="space-y-3 border-l border-border pl-4">
                  <ActivityItem
                    when="2 hours ago"
                    who="Amarsh"
                    title="Moved to Shortlisted"
                    detail="From Screening · 5 days in previous stage"
                  />
                  <ActivityItem
                    when="Yesterday"
                    who="Dewi"
                    title="Scorecard submitted"
                    detail="Overall 4.2 / 5 · Strong communicator"
                  />
                  <ActivityItem
                    when="2 days ago"
                    who="Outreach"
                    title="Reply received"
                    detail="Campaign: CFO outreach — Wave 2"
                  />
                  <ActivityItem
                    when="3 days ago"
                    who="System"
                    title="Match recomputed"
                    detail="Score 84 → 88 after JD update"
                  />
                  <ActivityItem
                    when="5 days ago"
                    who="Amarsh"
                    title="Note added"
                    detail="Available to interview after Diwali"
                  />
                </ol>
              </TabsContent>

              {/* FILES */}
              <TabsContent value="files" className="m-0 space-y-3 px-5 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                    Files & attachments
                  </h3>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => toast("File upload")}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload
                  </Button>
                </div>
                <ul className="space-y-2">
                  {profile.files.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <FileText className="h-4 w-4 text-brand-text-secondary" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-brand-text">{f.name}</div>
                        <div className="text-[11px] text-brand-text-secondary">
                          {f.size} · uploaded {f.uploaded}
                        </div>
                      </div>
                      <button
                        className="rounded p-1 text-brand-text-secondary hover:bg-brand-bg"
                        onClick={() => toast("Preview")}
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-brand-text-secondary hover:bg-brand-bg"
                        onClick={() => toast("Download")}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              {/* NOTES */}
              <TabsContent value="notes" className="m-0 space-y-4 px-5 py-5">
                <NotesPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* FOOTER (sticky) */}
          <div className="border-t border-border bg-card px-5 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 text-status-danger hover:bg-red-50"
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              {next && next.id !== "rejected" ? (
                <Button className="flex-1" onClick={handleAdvance}>
                  Advance to {next.label}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button className="flex-1" disabled>
                  End of pipeline
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reject dialog */}
      <RejectDialog
        open={rejectOpen}
        candidateName={candidate.name}
        jobLabel={jobLabel}
        onCancel={() => setRejectOpen(false)}
        onConfirm={(reason, note) => {
          onReject(reason, note);
          setRejectOpen(false);
        }}
      />

      {/* Gate-bypass confirm */}
      <Dialog
        open={!!confirmAdvance}
        onOpenChange={(o) => !o && setConfirmAdvance(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Advance with incomplete checklist?
            </DialogTitle>
            <DialogDescription>
              The {stageDef.label} checklist for {candidate.name} is not complete.
              Advancing now bypasses a gate stage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAdvance(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmAdvance) onMove(confirmAdvance);
                setConfirmAdvance(null);
              }}
            >
              Advance anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ============================================================
 * Subcomponents
 * ============================================================ */

function ContactPill({
  icon: Icon,
  label,
  href,
  accent,
}: {
  icon: typeof Mail;
  label: string;
  href?: string;
  accent?: boolean;
}) {
  const cls = cn(
    "flex items-center gap-2 truncate rounded-md border px-2.5 py-1.5 text-[12px]",
    accent
      ? "border-brand-mint bg-brand-mint/15 text-brand-primary"
      : "border-border bg-card text-brand-text",
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </a>
    );
  }
  return (
    <div className={cls}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</dt>
      <dd className="text-brand-text">{value}</dd>
    </div>
  );
}

function ActivityItem({
  when,
  who,
  title,
  detail,
}: {
  when: string;
  who: string;
  title: string;
  detail?: string;
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-brand-primary ring-2 ring-card" />
      <div className="text-[13px] font-medium text-brand-text">{title}</div>
      {detail && <div className="text-[12px] text-brand-text-secondary">{detail}</div>}
      <div className="mt-0.5 text-[11px] text-brand-text-secondary">{who} · {when}</div>
    </li>
  );
}

/* ----- AI Match ----- */

function MatchPanel({ score }: { score: number }) {
  const components = [
    { label: "Skills match", weight: 30, value: Math.round(score * 0.95) },
    { label: "Experience", weight: 20, value: Math.round(score * 0.9) },
    { label: "Seniority", weight: 10, value: Math.round(score * 1.0) },
    { label: "Location", weight: 10, value: Math.round(score * 0.85) },
    { label: "Semantic fit", weight: 30, value: Math.round(score * 0.92) },
  ];
  const [override, setOverride] = useState<string>("");
  const [note, setNote] = useState<string>("");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-lg border border-border bg-brand-bg/30 p-4">
        <ScoreRing score={score} size="lg" />
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
            AI verdict
          </div>
          <div className="text-sm font-semibold text-brand-text">Strong fit — recommend shortlist</div>
          <div className="text-[12px] text-brand-text-secondary">Confidence: high</div>
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
          Component breakdown
        </h3>
        <ul className="space-y-2">
          {components.map((c) => (
            <li key={c.label}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-brand-text">{c.label}</span>
                <span className="tabular-nums text-brand-text-secondary">
                  {c.value} <span className="text-[10px]">/ {c.weight}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-bg">
                <div
                  className="h-full bg-brand-primary"
                  style={{ width: `${Math.min(100, (c.value / c.weight) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ExplainList title="Strengths" tone="positive" items={[
        "15+ years of regional CFO experience",
        "Led two cross-border M&A deals (>USD 500M)",
        "Strong IFRS and treasury depth",
      ]} />
      <ExplainList title="Gaps" tone="warning" items={[
        "No prior consumer-goods sector exposure",
        "Limited IPO leadership experience",
      ]} />
      <ExplainList title="Concerns" tone="danger" items={[
        "Salary expectation slightly above ceiling",
      ]} />

      <section className="rounded-lg border border-border p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
          Recruiter override
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="0–100"
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            className="h-9 w-24"
          />
          <Textarea
            placeholder="Reason for override (e.g. domain expertise not captured)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[40px] flex-1"
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            disabled={!override}
            onClick={() => toast.success(`Override saved: ${override}`)}
          >
            Save override
          </Button>
        </div>
        <div className="mt-2 text-[11px] italic text-brand-text-secondary">
          Previous override: none
        </div>
      </section>
    </div>
  );
}

function ExplainList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "warning" | "danger";
}) {
  const toneCls = {
    positive: "text-green-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  }[tone];
  return (
    <section>
      <h3 className={cn("mb-1.5 text-xs font-semibold uppercase tracking-wide", toneCls)}>
        {title}
      </h3>
      <ul className="ml-4 list-disc space-y-0.5 text-[13px] text-brand-text">
        {items.map((it) => <li key={it}>{it}</li>)}
      </ul>
    </section>
  );
}

/* ----- Notes ----- */

interface NoteEntry { id: string; author: string; when: string; body: string }

function NotesPanel() {
  const [notes, setNotes] = useState<NoteEntry[]>([
    { id: "n1", author: "Amarsh", when: "Yesterday", body: "Spoke with candidate — confirmed 3-month notice. Available for client interview week of the 15th." },
    { id: "n2", author: "Dewi", when: "3 days ago", body: "Strong board exposure. Should highlight ESG experience in the dossier." },
  ]);
  const [draft, setDraft] = useState("");
  return (
    <>
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg border border-border bg-card p-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-brand-text-secondary">
              <span className="font-medium text-brand-text">{n.author}</span>
              <span>{n.when}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-brand-text">{n.body}</p>
          </li>
        ))}
      </ul>
      <div className="rounded-lg border border-border bg-brand-bg/30 p-3">
        <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
          Add a note
        </Label>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share an update… use @name to mention a teammate"
          className="min-h-[80px]"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            disabled={!draft.trim()}
            onClick={() => {
              setNotes((prev) => [
                { id: crypto.randomUUID(), author: "You", when: "Just now", body: draft.trim() },
                ...prev,
              ]);
              setDraft("");
              toast.success("Note added");
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Post note
          </Button>
        </div>
      </div>
    </>
  );
}

/* ----- Reject dialog ----- */

const REJECT_REASONS = [
  "Skills mismatch",
  "Experience gap",
  "Salary expectations",
  "Cultural fit",
  "Candidate withdrew",
  "Client rejected",
  "Position filled",
  "Other",
];

function RejectDialog({
  open,
  candidateName,
  jobLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  candidateName: string;
  jobLabel: string;
  onCancel: () => void;
  onConfirm: (reason: string, note: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          setNote("");
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Reject {candidateName}?</DialogTitle>
          <DialogDescription>{jobLabel}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Rejection reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why was this candidate rejected? Helps improve future matching."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            disabled={!reason}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              onConfirm(reason, note);
              setReason("");
              setNote("");
            }}
          >
            Reject candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* unused import guard for Star icon (kept for future scorecard inline use) */
void Star;
