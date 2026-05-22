import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  Award,
  Bot,
  Briefcase,
  Calendar,
  Clock,
  Copy,
  Download,
  FileText,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  StickyNote,
  Target,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScoreRing, StatusBadge, EmptyState } from "@/components/shared";
import { AIVerdictChip } from "@/components/shared/AIVerdictChip";
import { cn } from "@/lib/utils";
import { candidates, projects, type Candidate, type SeniorityLevel } from "@/lib/mock-data";

const tabSchema = z.object({
  tab: fallback(
    z.enum(["profile", "work", "jobs", "outreach", "notes", "files"]),
    "profile",
  ).default("profile"),
});

export const Route = createFileRoute("/_app/candidates/$id")({
  head: () => ({ meta: [{ title: "Candidate — HireSmart" }] }),
  validateSearch: zodValidator(tabSchema),
  component: CandidateDetail,
});

const SENIORITY_LABEL: Record<SeniorityLevel, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid-level",
  junior: "Junior",
};


const SOURCE_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  chrome_extension: "Chrome Extension",
  referral: "Referral",
  manual: "Manual",
  import: "CSV Import",
};

const pipelineStages = ["Sourced", "Contacted", "Screening", "Shortlisted", "Client", "Offer"];

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---------- Per-candidate derived profile ----------
function buildProfile(c: Candidate) {
  const years = Math.max(8, Math.min(22, Math.round(c.matchScore / 5)));
  const handle = slug(c.name);
  const phone = "+62 812 " + (1000 + (c.matchScore * 7) % 9000) + " " + (1000 + (c.matchScore * 13) % 9000);
  const whatsapp = phone.replace(/\D/g, "");

  const profile = {
    ...c,
    title: c.currentTitle,
    company: c.currentCompany,
    experience: years,
    availability: "Contact for details",
    phone,
    whatsapp,
    linkedin: `linkedin.com/in/${handle}`,
    dnc: false,
    summary: `${SENIORITY_LABEL[c.seniority]} leader with ~${years} years of progressive experience, currently ${c.currentTitle} at ${c.currentCompany}. Based in ${c.location}. Sourced via ${SOURCE_LABEL[c.source] ?? c.source}.`,
    skills: [
      "Leadership",
      "Strategy",
      "Stakeholder Management",
      "Team Building",
      "P&L Management",
    ],
    languages: ["English (Fluent)"],
    tags: [SENIORITY_LABEL[c.seniority], c.location.split(",")[0], SOURCE_LABEL[c.source] ?? c.source],
  };

  const education = [
    { degree: "MBA", school: "INSEAD", year: "—" },
    { degree: "Bachelor's Degree", school: "—", year: "—" },
  ];

  const additionalDetails: Array<[string, string]> = [
    ["Salary expectation", "Contact for details"],
    ["Notice period", "—"],
    ["Willing to relocate", "—"],
    ["Source", SOURCE_LABEL[c.source] ?? c.source],
  ];

  // Build match history from real projects (top 3)
  const projectSample = projects.slice(0, 3);
  const matchHistory = projectSample.map((p, i) => {
    const score = Math.max(20, Math.min(95, c.matchScore - i * 18));
    const verdict =
      score >= 75 ? ("strong_match" as const) : score >= 50 ? ("possible_match" as const) : ("weak_match" as const);
    return {
      project: `${p.title} — ${p.clientName}`,
      score,
      verdict,
      date: i === 0 ? "2 days ago" : i === 1 ? "1 week ago" : "2 weeks ago",
      strengths: [`${years} yrs experience`, `${c.currentCompany} background`],
      gaps: i === 0 ? ["Industry adjacency"] : ["Limited domain overlap"],
      concerns: i === 2 ? ["Role scope mismatch"] : [],
    };
  });

  const workHistory = [
    {
      role: c.currentTitle,
      company: c.currentCompany,
      period: `Jan ${2026 - Math.min(years, 6)} – Present`,
      current: true,
      description: `Currently leading ${c.currentTitle.toLowerCase()} function at ${c.currentCompany}, based in ${c.location}.`,
    },
    {
      role: `Senior ${c.currentTitle.replace(/^(Chief |Head of |VP |Director of )/i, "")}`,
      company: "Previous Employer",
      period: `${2026 - years} – ${2026 - Math.min(years, 6)}`,
      current: false,
      description: `Progressive leadership roles culminating in current position at ${c.currentCompany}.`,
    },
  ];

  const jobsData = projectSample.map((p, i) => ({
    project: `${p.title} — ${p.clientName}`,
    client: p.clientName,
    score: matchHistory[i].score,
    stage: i === 0 ? "shortlisted" : i === 1 ? "screening" : "rejected",
    method: "AI matched",
    date: matchHistory[i].date,
  }));

  const outreach = projectSample[0]
    ? [
        {
          id: "m1",
          direction: "out" as const,
          channel: "LinkedIn",
          campaign: `${projectSample[0].title} — Outreach`,
          sender: projectSample[0].owner.name,
          date: "Mar 14, 2026 at 10:23 AM",
          status: "submitted",
          content: `Hi ${c.name.split(" ")[0]}, I'm working on a ${projectSample[0].title} mandate for ${projectSample[0].clientName}. Given your background at ${c.currentCompany}, I thought this could be a compelling fit. Open to a quick conversation?`,
        },
        {
          id: "m2",
          direction: "in" as const,
          channel: "LinkedIn",
          sender: c.name,
          date: "Mar 15, 2026 at 2:47 PM",
          status: "interested",
          content: `Thanks for reaching out — happy to learn more about the ${projectSample[0].title} role. Could we schedule a call next week?`,
          classification: "Interested",
        },
      ]
    : [];

  const notes = [
    {
      author: projectSample[0]?.owner.name ?? "System",
      date: "2 days ago",
      private: false,
      system: false,
      content: `Strong candidate. ${years} years of experience aligns with senior ${SENIORITY_LABEL[c.seniority]} mandates. Current role at ${c.currentCompany} provides relevant scope.`,
    },
    {
      author: "System",
      date: "1 week ago",
      private: false,
      system: true,
      content: `Profile enriched via ${SOURCE_LABEL[c.source] ?? c.source}.`,
    },
  ];

  const files = [
    {
      name: `${c.name.replace(/ /g, "_")}_CV.pdf`,
      type: "CV",
      size: "2.4 MB",
      uploader: projectSample[0]?.owner.name ?? "System",
      date: "1 week ago",
    },
  ];

  const activeProjects = projects.slice(0, 4).map((p) => `${p.title} — ${p.clientName}`);

  return {
    candidate: profile,
    education,
    additionalDetails,
    matchHistory,
    workHistory,
    jobsData,
    outreach,
    notes,
    files,
    activeProjects,
    currentProject: projectSample[0] ? `${projectSample[0].title} — ${projectSample[0].clientName}` : "—",
  };
}

type Profile = ReturnType<typeof buildProfile>;

function CandidateDetail() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();

  const cand = useMemo(() => candidates.find((c) => c.id === id) ?? candidates[0], [id]);
  const profile = useMemo(() => buildProfile(cand), [cand]);
  const { candidate, activeProjects } = profile;

  const setTab = (t: string) =>
    navigate({ to: ".", search: { tab: t as never }, replace: true });

  const copy = (val: string, label: string) => {
    navigator.clipboard?.writeText(val);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-brand-text-secondary">
        <Link to="/candidates" className="hover:text-brand-primary">
          Candidates
        </Link>
        <span>/</span>
        <span className="text-brand-text">{candidate.name}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-xl border border-gray-100 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-lg font-semibold text-brand-primary">
              {initials(candidate.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight text-brand-text">
                {candidate.name}
              </h1>
              <p className="text-sm text-brand-text-secondary">
                {candidate.title} at {candidate.company}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-brand-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {candidate.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-brand-text-secondary" />
              <StatusBadge status="ai_generated" label={SENIORITY_LABEL[cand.seniority]} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-brand-text">
              <Clock className="h-4 w-4 text-brand-text-secondary" />
              ~{candidate.experience} years
            </div>
            <div className="flex items-center gap-1.5">
              <Linkedin className="h-4 w-4 text-status-info" />
              <span className="rounded-full bg-status-info/15 px-2 py-0.5 text-[11px] font-medium text-status-info">
                {SOURCE_LABEL[cand.source] ?? cand.source}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-text">
              <Calendar className="h-4 w-4 text-brand-text-secondary" />
              Last contact: {cand.lastContact}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-brand-primary text-white hover:bg-brand-primary/90">
                  <Plus className="h-4 w-4" />
                  Add to project
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Active projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activeProjects.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => toast.success(`Added to ${p}`)}>
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => toast.info("Outreach coming soon")}>
              <Send className="h-4 w-4" />
              Send message
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit profile</DropdownMenuItem>
                <DropdownMenuItem>Download as PDF</DropdownMenuItem>
                <DropdownMenuItem className="text-status-danger">
                  <ShieldAlert className="h-4 w-4" />
                  Flag as Do Not Contact
                </DropdownMenuItem>
                <DropdownMenuItem>Merge with duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-status-danger">
                  Delete candidate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-[13px]">
          <ContactItem
            icon={<Mail className="h-4 w-4 text-brand-text-secondary" />}
            value={candidate.email}
            onClick={() => copy(candidate.email, "Email")}
          />
          <ContactItem
            icon={<Phone className="h-4 w-4 text-brand-text-secondary" />}
            value={candidate.phone}
            onClick={() => copy(candidate.phone, "Phone")}
          />
          <a
            href={`https://wa.me/${candidate.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-brand-primary hover:underline"
          >
            <MessageCircle className="h-4 w-4 text-status-success" />
            {candidate.phone}
          </a>
          <a
            href={`https://${candidate.linkedin}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-brand-primary hover:underline"
          >
            <Linkedin className="h-4 w-4 text-status-info" />
            {candidate.linkedin}
          </a>
        </div>
      </div>

      {candidate.dnc && (
        <div className="flex items-center justify-between rounded-lg border border-status-danger/30 bg-status-danger/10 p-3 text-[13px] text-status-danger">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            This candidate is flagged as Do Not Contact. All outreach is blocked.
          </div>
          <button className="font-medium hover:underline">Remove flag</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: "profile", label: "Profile", icon: User, badge: null as string | null },
            { id: "work", label: "Work history", icon: Briefcase, badge: `${profile.workHistory.length} roles` },
            { id: "jobs", label: "Jobs", icon: Target, badge: `${profile.jobsData.length} projects` },
            { id: "outreach", label: "Outreach", icon: Send, badge: `${profile.outreach.length} messages` },
            { id: "notes", label: "Notes", icon: StickyNote, badge: `${profile.notes.length} notes` },
            { id: "files", label: "Files", icon: Paperclip, badge: `${profile.files.length} files` },
          ].map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-brand-text-secondary hover:text-brand-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px]",
                      active ? "bg-brand-primary/10 text-brand-primary" : "bg-muted text-brand-text-secondary",
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

      {tab === "profile" && <ProfileTab profile={profile} />}
      {tab === "work" && <WorkTab profile={profile} />}
      {tab === "jobs" && <JobsTab profile={profile} />}
      {tab === "outreach" && <OutreachTab profile={profile} />}
      {tab === "notes" && <NotesTab profile={profile} />}
      {tab === "files" && <FilesTab profile={profile} />}
    </div>
  );
}

function ContactItem({
  icon,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 text-brand-primary hover:underline"
    >
      {icon}
      <span>{value}</span>
      <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
    </button>
  );
}

function Card({
  title,
  children,
  rightSlot,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-card p-6", className)}>
      {(title || rightSlot) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-brand-text">{title}</h3>}
          {rightSlot}
        </div>
      )}
      {children}
    </div>
  );
}

function ProfileTab({ profile }: { profile: Profile }) {
  const { candidate, education, additionalDetails, matchHistory, currentProject } = profile;
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card
          title="Professional summary"
          rightSlot={
            <span className="flex items-center gap-1 text-[12px] text-brand-text-secondary">
              <Sparkles className="h-3 w-3 text-status-ai" />
              AI-generated summary
            </span>
          }
        >
          <p className="text-sm leading-relaxed text-brand-text">{candidate.summary}</p>
        </Card>

        <Card title="Skills & competencies">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
                Primary skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-seafoam/40 px-3 py-1 text-xs font-medium text-brand-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.languages.map((l) => (
                  <span
                    key={l}
                    className="rounded-full bg-brand-bg px-3 py-1 text-xs font-medium text-brand-text-secondary"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Education">
          <div className="divide-y divide-gray-50">
            {education.map((e) => (
              <div key={e.degree} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-brand-text">{e.degree}</p>
                  <p className="text-[13px] text-brand-text-secondary">{e.school}</p>
                </div>
                <span className="text-[13px] text-brand-text-secondary">{e.year}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Additional details">
          <div className="divide-y divide-gray-50">
            {additionalDetails.map(([k, v]) => (
              <div key={k} className="flex py-3 first:pt-0 last:pb-0">
                <div className="w-40 shrink-0 text-[13px] text-brand-text-secondary">{k}</div>
                <div className="text-sm text-brand-text">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card title="AI match history" className="p-5">
          <div className="space-y-4">
            {matchHistory.map((m) => (
              <div key={m.project} className="space-y-2 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <ScoreRing score={m.score} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-text">{m.project}</p>
                    <p className="text-[12px] text-brand-text-secondary">{m.date}</p>
                  </div>
                </div>
                <AIVerdictChip
                  verdict={m.verdict}
                  expandable
                  strengths={m.strengths}
                  gaps={m.gaps}
                  concerns={m.concerns}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pipeline status" className="p-5">
          <div className="space-y-3">
            <p className="text-sm text-brand-text">
              <span className="text-brand-text-secondary">Current: </span>
              {currentProject}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge status="shortlisted" />
              <span className="text-[12px] text-brand-text-secondary">3 days in stage</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {pipelineStages.map((stage, i) => {
                const active = stage === "Shortlisted";
                const past = i < pipelineStages.indexOf("Shortlisted");
                return (
                  <div key={stage} className="flex flex-1 items-center gap-1.5">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        active
                          ? "bg-brand-primary ring-2 ring-brand-mint/40"
                          : past
                            ? "bg-brand-primary/60"
                            : "bg-gray-200",
                      )}
                      title={stage}
                    />
                    {i < pipelineStages.length - 1 && (
                      <div className={cn("h-px flex-1", past ? "bg-brand-primary/40" : "bg-gray-200")} />
                    )}
                  </div>
                );
              })}
            </div>
            <button className="text-[13px] font-medium text-brand-primary hover:underline">
              View in pipeline →
            </button>
          </div>
        </Card>

        <Card title="Tags" className="p-5">
          <div className="flex flex-wrap gap-1.5">
            {candidate.tags.map((t) => (
              <Link
                key={t}
                to="/candidates"
                className="rounded-md bg-brand-bg px-2 py-1 text-xs text-brand-text-secondary hover:bg-muted"
              >
                {t}
              </Link>
            ))}
            <button className="flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary">
              <Plus className="h-3 w-3" />
              Add tag
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkTab({ profile }: { profile: Profile }) {
  return (
    <Card>
      <div className="relative pl-10">
        <div className="absolute left-5 top-2 bottom-2 border-l-2 border-gray-200" />
        <div className="space-y-6">
          {profile.workHistory.map((w) => (
            <div key={w.role + w.company} className="relative">
              <div
                className={cn(
                  "absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full",
                  w.current
                    ? "bg-brand-primary ring-4 ring-brand-mint/30"
                    : "border-2 border-gray-300 bg-card",
                )}
              />
              <div>
                <p className="text-[15px] font-medium text-brand-text">{w.role}</p>
                <p className="text-sm text-brand-text-secondary">{w.company}</p>
                <p className="mt-0.5 text-[12px] text-brand-text-secondary">{w.period}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-brand-text-secondary">
                  {w.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function JobsTab({ profile }: { profile: Profile }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[12px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 pr-4 font-medium">Project</th>
              <th className="py-2 pr-4 font-medium">Match</th>
              <th className="py-2 pr-4 font-medium">Stage</th>
              <th className="py-2 pr-4 font-medium">Method</th>
              <th className="py-2 pr-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profile.jobsData.map((j) => (
              <tr key={j.project} className="cursor-pointer hover:bg-brand-bg/60">
                <td className="py-3 pr-4">
                  <p className="font-medium text-brand-text">{j.project}</p>
                  <p className="text-[12px] text-brand-text-secondary">{j.client}</p>
                </td>
                <td className="py-3 pr-4">
                  <ScoreRing score={j.score} size="sm" />
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={j.stage} size="sm" />
                </td>
                <td className="py-3 pr-4 text-brand-text-secondary">{j.method}</td>
                <td className="py-3 pr-4 text-brand-text-secondary">{j.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OutreachTab({ profile }: { profile: Profile }) {
  if (profile.outreach.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No outreach yet"
        description="No outreach messages sent to this candidate."
      />
    );
  }

  return (
    <div className="space-y-3">
      {profile.outreach.map((m) => {
        const isIn = m.direction === "in";
        return (
          <div
            key={m.id}
            className={cn(
              "rounded-xl border p-5",
              isIn ? "border-brand-mint/30 bg-brand-seafoam/10" : "border-gray-100 bg-card",
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
                  {initials(m.sender)}
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-text">{m.sender}</p>
                  <p className="text-[12px] text-brand-text-secondary">{m.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[12px] text-brand-text-secondary">
                  <Linkedin className="h-3.5 w-3.5 text-status-info" />
                  {m.channel}
                </span>
                <StatusBadge status={m.status} size="sm" />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-brand-text">{m.content}</p>
            {!isIn && "campaign" in m && (
              <p className="mt-3 text-[12px]">
                <span className="text-brand-text-secondary">Campaign: </span>
                <Link to="/outreach" className="text-brand-primary hover:underline">
                  {m.campaign}
                </Link>
              </p>
            )}
            {isIn && "classification" in m && (
              <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[12px] text-brand-text-secondary">
                <Sparkles className="h-3 w-3 text-status-ai" />
                Classified as: {m.classification}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NotesTab({ profile }: { profile: Profile }) {
  const [draft, setDraft] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note about this candidate..."
          rows={3}
          className="resize-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} id="private-toggle" />
            <label htmlFor="private-toggle" className="text-[13px] text-brand-text-secondary">
              Private note
            </label>
          </div>
          <Button
            size="sm"
            disabled={!draft.trim()}
            onClick={() => {
              toast.success("Note added");
              setDraft("");
            }}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Add note
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {profile.notes.map((n, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl bg-brand-bg p-4",
              n.private && "border-l-2 border-amber-300",
              n.system && "italic",
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              {n.system ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-3.5 w-3.5 text-brand-text-secondary" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
                  {initials(n.author)}
                </div>
              )}
              <p className="text-[13px] font-medium text-brand-text">{n.author}</p>
              <p className="text-[12px] text-brand-text-secondary">· {n.date}</p>
              {n.private && (
                <span className="flex items-center gap-0.5 rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>
            <p className={cn("text-sm leading-relaxed", n.system ? "text-brand-text-secondary" : "text-brand-text")}>
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-card/40 p-8 text-center">
        <Upload className="h-8 w-8 text-brand-text-secondary/60" />
        <p className="text-sm text-brand-text">
          Drop files here or{" "}
          <button className="font-medium text-brand-primary hover:underline">click to upload</button>
        </p>
        <p className="text-[12px] text-brand-text-secondary">PDF, DOCX, images accepted</p>
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {profile.files.map((f) => (
            <div key={f.name} className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <FileText className="h-8 w-8 text-status-danger" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-text hover:text-brand-primary cursor-pointer truncate">
                  {f.name}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-brand-text-secondary">
                  <span className="rounded bg-muted px-1.5 py-0.5">{f.type}</span>
                  <span>{f.size}</span>
                  <span>· Uploaded by {f.uploader}</span>
                  <span>· {f.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-status-danger">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
