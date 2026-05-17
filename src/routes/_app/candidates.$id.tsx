import { useState } from "react";
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
  Trash2,
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

const tabSchema = z.object({
  tab: fallback(
    z.enum(["profile", "work", "jobs", "outreach", "notes", "files"]),
    "profile",
  ).default("profile"),
});

export const Route = createFileRoute("/_app/candidates/$id")({
  head: () => ({ meta: [{ title: "Rina Wijaya — HireSmart" }] }),
  validateSearch: zodValidator(tabSchema),
  component: CandidateDetail,
});

// ---------- Mock candidate ----------
const candidate = {
  id: "rina-wijaya",
  name: "Rina Wijaya",
  title: "Chief Financial Officer",
  company: "PT Telkom Indonesia",
  location: "Jakarta, Indonesia",
  experience: 18,
  source: "LinkedIn",
  availability: "Available — 2 month notice",
  email: "rina.wijaya@telkom.co.id",
  phone: "+62 812 3456 7890",
  whatsapp: "628123456890",
  linkedin: "linkedin.com/in/rina-wijaya",
  dnc: false,
  summary:
    "Seasoned Chief Financial Officer with 18 years of progressive experience in corporate finance, treasury, and strategic planning across Indonesia's telecommunications and technology sectors. Currently leading a 45-person finance team at PT Telkom Indonesia, managing a $2.1B revenue operation. Proven track record in M&A execution, IFRS compliance, and board-level financial reporting. Fluent in English and Bahasa Indonesia.",
  skills: [
    "Financial Planning & Analysis",
    "IFRS Compliance",
    "M&A Due Diligence",
    "Treasury Management",
    "Board Reporting",
    "Team Leadership",
    "SAP FICO",
    "Budgeting & Forecasting",
    "Capital Markets",
  ],
  languages: ["English (Fluent)", "Bahasa Indonesia (Native)", "Mandarin (Basic)"],
  tags: ["Executive", "Finance", "Jakarta", "Indorama shortlist", "Priority"],
};

const education = [
  { degree: "MBA, Finance", school: "University of Melbourne", year: "2008 – 2010" },
  { degree: "B.Comm, Accounting", school: "Universitas Indonesia", year: "2003 – 2007" },
  {
    degree: "CPA (Certified Public Accountant)",
    school: "Indonesian Institute of CPAs",
    year: "2009",
  },
];

const additionalDetails: Array<[string, string]> = [
  ["Salary expectation", "$200,000 – $250,000 USD per annum"],
  ["Notice period", "2 months"],
  ["Willing to relocate", "Singapore, Bangkok (open to discussion)"],
  ["Certifications", "CPA, IFRS Certificate (ACCA)"],
];

const matchHistory = [
  {
    project: "CFO — Indorama Ventures",
    score: 88,
    verdict: "strong_match" as const,
    date: "2 days ago",
    strengths: ["18 yrs experience", "Telkom multi-BU scope", "M&A track record"],
    gaps: ["No petrochemical exposure"],
    concerns: [],
  },
  {
    project: "VP Finance — OYO Hotels",
    score: 62,
    verdict: "possible_match" as const,
    date: "1 week ago",
    strengths: ["Strong CFO profile"],
    gaps: ["Senior to role", "No hospitality background"],
    concerns: ["Possible salary mismatch"],
  },
  {
    project: "Country Director — KNS Group",
    score: 34,
    verdict: "weak_match" as const,
    date: "2 weeks ago",
    strengths: ["Indonesia market knowledge"],
    gaps: ["Finance background, not GM"],
    concerns: ["Role scope mismatch"],
  },
];

const workHistory = [
  {
    role: "Chief Financial Officer",
    company: "PT Telkom Indonesia",
    period: "Jan 2020 – Present · 6 years",
    current: true,
    description:
      "Leading 45-person finance team managing $2.1B revenue across fixed-line, mobile, and digital business units. Oversaw successful $340M bond issuance in 2022. Implemented new ERP across 4 subsidiaries.",
  },
  {
    role: "VP Corporate Finance",
    company: "Indosat Ooredoo",
    period: "Mar 2016 – Dec 2019 · 3 years 10 months",
    current: false,
    description:
      "Managed treasury, capital markets, and investor relations. Led two M&A transactions totaling $180M. Drove IFRS 16 implementation.",
  },
  {
    role: "Finance Director — Southeast Asia",
    company: "Procter & Gamble",
    period: "Jun 2012 – Feb 2016 · 3 years 9 months",
    current: false,
    description:
      "Regional finance lead for 6 ASEAN markets. Managed $400M P&L, FX hedging, and supply chain costing.",
  },
  {
    role: "Senior Financial Analyst",
    company: "Deloitte Indonesia",
    period: "Jul 2007 – May 2012 · 4 years 11 months",
    current: false,
    description:
      "Audit and advisory engagements for major Indonesian corporates including Astra, Indofood, and Bank Mandiri.",
  },
];

const jobsData = [
  {
    project: "CFO — Indorama Ventures",
    client: "Indorama Ventures",
    score: 88,
    stage: "shortlisted",
    method: "AI matched",
    date: "2 days ago",
  },
  {
    project: "VP Finance — OYO Hotels",
    client: "OYO Hotels",
    score: 62,
    stage: "screening",
    method: "AI matched",
    date: "1 week ago",
  },
  {
    project: "Country Director — KNS Group",
    client: "KNS Group",
    score: 34,
    stage: "rejected",
    method: "AI matched",
    date: "2 weeks ago",
  },
];

const outreach = [
  {
    id: "m1",
    direction: "out" as const,
    channel: "LinkedIn",
    campaign: "CFO Search — Indorama",
    sender: "Amarsh Jain",
    date: "Mar 14, 2026 at 10:23 AM",
    status: "submitted",
    content:
      "Hi Rina, I'm working with a leading petrochemical company in Jakarta searching for their next CFO. Given your impressive track record at Telkom, I thought this could be a compelling opportunity. Would you be open to a confidential conversation?",
  },
  {
    id: "m2",
    direction: "in" as const,
    channel: "LinkedIn",
    sender: "Rina Wijaya",
    date: "Mar 15, 2026 at 2:47 PM",
    status: "interested",
    content:
      "Hi Amarsh, thank you for reaching out. I'd definitely be interested in learning more about the opportunity. Would next Tuesday work for a brief call?",
    classification: "Interested",
  },
];

const notes = [
  {
    author: "Amarsh Jain",
    date: "2 days ago",
    private: false,
    system: false,
    content:
      "Strong candidate for Indorama CFO role. 18 years experience aligns perfectly with the 15-20 year requirement. Her Telkom background in managing multiple business units is directly relevant to Indorama's 4-unit structure. Recommend moving to shortlist.",
  },
  {
    author: "Dewi Putri",
    date: "5 days ago",
    private: false,
    system: false,
    content:
      "Spoke with Rina over WhatsApp. She's open to opportunities but has a 2-month notice period at Telkom. Salary expectation is $200-250K which is within the Indorama band.",
  },
  {
    author: "Amarsh Jain",
    date: "1 week ago",
    private: false,
    system: false,
    content:
      "LinkedIn profile reviewed. Impressive career trajectory: Deloitte → P&G → Indosat → Telkom. Each move was a step up in scope. Classic CFO career path.",
  },
  {
    author: "System",
    date: "1 week ago",
    private: false,
    system: true,
    content: "Profile enriched via Proxycurl. 23 data fields updated.",
  },
  {
    author: "Amarsh Jain",
    date: "2 weeks ago",
    private: true,
    system: false,
    content:
      "Initial flag: potential match for the Indorama CFO mandate. Adding to watch list.",
  },
];

const files = [
  {
    name: "Rina_Wijaya_CV_2026.pdf",
    type: "CV",
    size: "2.4 MB",
    uploader: "Dewi Putri",
    date: "1 week ago",
  },
  {
    name: "Rina_Wijaya_CPA_Certificate.pdf",
    type: "Certificate",
    size: "890 KB",
    uploader: "Amarsh Jain",
    date: "2 weeks ago",
  },
];

const activeProjects = [
  "CFO — Indorama Ventures",
  "VP Finance — OYO Hotels",
  "Head of Strategy — Astra",
  "CTO — Tokopedia",
];

const pipelineStages = ["Sourced", "Contacted", "Screening", "Shortlisted", "Client", "Offer"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CandidateDetail() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
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
          {/* Identity */}
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

          {/* Quick info pills */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-brand-text-secondary" />
              <StatusBadge status="ai_generated" label="C-Suite" size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-brand-text">
              <Clock className="h-4 w-4 text-brand-text-secondary" />
              {candidate.experience} years
            </div>
            <div className="flex items-center gap-1.5">
              <Linkedin className="h-4 w-4 text-status-info" />
              <span className="rounded-full bg-status-info/15 px-2 py-0.5 text-[11px] font-medium text-status-info">
                {candidate.source}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-text">
              <Calendar className="h-4 w-4 text-brand-text-secondary" />
              {candidate.availability}
            </div>
          </div>

          {/* Actions */}
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
                  <DropdownMenuItem
                    key={p}
                    onClick={() => toast.success(`Added to ${p}`)}
                  >
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

        {/* Contact bar */}
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

      {/* DNC banner */}
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
            { id: "profile", label: "Profile", icon: User, badge: null },
            { id: "work", label: "Work history", icon: Briefcase, badge: "4 roles" },
            { id: "jobs", label: "Jobs", icon: Target, badge: "3 projects" },
            { id: "outreach", label: "Outreach", icon: Send, badge: "2 messages" },
            { id: "notes", label: "Notes", icon: StickyNote, badge: "5 notes" },
            { id: "files", label: "Files", icon: Paperclip, badge: "2 files" },
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

      {/* Tab content */}
      {tab === "profile" && <ProfileTab />}
      {tab === "work" && <WorkTab />}
      {tab === "jobs" && <JobsTab />}
      {tab === "outreach" && <OutreachTab />}
      {tab === "notes" && <NotesTab />}
      {tab === "files" && <FilesTab />}
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

// ---------- Profile Tab ----------
function ProfileTab() {
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
              CFO — Indorama Ventures
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

// ---------- Work Tab ----------
function WorkTab() {
  return (
    <Card>
      <div className="relative pl-10">
        <div className="absolute left-5 top-2 bottom-2 border-l-2 border-gray-200" />
        <div className="space-y-6">
          {workHistory.map((w) => (
            <div key={w.role} className="relative">
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

// ---------- Jobs Tab ----------
function JobsTab() {
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
            {jobsData.map((j) => (
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

// ---------- Outreach Tab ----------
function OutreachTab() {
  if (outreach.length === 0) {
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
      {outreach.map((m) => {
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

// ---------- Notes Tab ----------
function NotesTab() {
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
        {notes.map((n, i) => (
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

// ---------- Files Tab ----------
function FilesTab() {
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
          {files.map((f) => (
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
