import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  Award,
  Building,
  Building2,
  Calendar,
  Clock,
  Copy,
  DollarSign,
  FileText,
  GitBranch,
  MapPin,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  User as UserIcon,
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
import { StatusBadge, EmptyState } from "@/components/shared";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/mock-data";

const tabSchema = z.object({
  tab: fallback(
    z.enum(["brief", "candidates", "outreach", "pipeline", "activity"]),
    "brief",
  ).default("brief"),
});

export const Route = createFileRoute("/_app/projects/$id")({
  validateSearch: zodValidator(tabSchema),
  head: () => ({ meta: [{ title: "Project — HireSmart" }] }),
  component: ProjectDetail,
});

const TABS = [
  { id: "brief" as const, label: "Brief", icon: FileText, badge: null },
  { id: "candidates" as const, label: "Candidates", icon: Users, badge: "14" },
  { id: "outreach" as const, label: "Outreach", icon: Send, badge: "2 campaigns" },
  { id: "pipeline" as const, label: "Pipeline", icon: GitBranch, badge: "8 in pipeline" },
  { id: "activity" as const, label: "Activity", icon: Clock, badge: null },
];

const requiredSkills = [
  "Financial Planning & Analysis",
  "M&A Due Diligence",
  "IFRS/GAAP Compliance",
  "Board Reporting",
  "Team Leadership",
  "Treasury Management",
];

const niceToHaveSkills = [
  "IPO Readiness",
  "ESG Reporting",
  "SAP FICO",
  "Bahasa Indonesia",
];

const responsibilities = [
  "Lead the finance function across 4 business units with a team of 50+",
  "Oversee financial planning, budgeting, forecasting, and variance analysis",
  "Drive M&A evaluation and post-merger integration for regional acquisitions",
  "Ensure compliance with IFRS, Indonesian tax regulations, and OJK requirements",
  "Present quarterly financial reports to the Board of Directors",
  "Manage banking relationships and optimize working capital",
  "Partner with the CEO on 5-year strategic growth plan",
];

const originalJD = `CHIEF FINANCIAL OFFICER — INDORAMA VENTURES

Indorama Ventures Public Company Limited is seeking a Chief Financial Officer to be based in Jakarta, Indonesia. The CFO will report directly to the CEO and will be responsible for the overall financial strategy, planning, and management of the company's Indonesia operations spanning 4 business units.

The ideal candidate will have 15-20 years of progressive finance experience, including at least 5 years in a CFO or equivalent role within a multinational manufacturing or petrochemical environment. Experience with M&A transactions, IFRS compliance, and Indonesian regulatory frameworks (OJK, tax authority) is essential.

Key Requirements:
- MBA or CPA/CA qualification
- Proven track record in financial planning, treasury, and board-level reporting
- Experience managing teams of 30+ across multiple entities
- Fluent English; Bahasa Indonesia is a strong advantage
- Willingness to travel regionally (20-30%)

Compensation is competitive and includes base salary of $180K-$250K USD, performance bonus of 20-30%, company car, comprehensive health coverage, and annual flight allowance.`;

const projectActivity = [
  { who: "Amarsh", text: "ran AI matching — 14 candidates scored", when: "1 day ago" },
  { who: "Amarsh", text: "shortlisted 5 candidates from match results", when: "1 day ago" },
  { who: "Dewi", text: "uploaded 3 CVs to candidate pool", when: "2 days ago" },
  { who: "AI", text: "parsed job description — 12 fields extracted", when: "3 days ago" },
  { who: "Amarsh", text: "linked project to client: Indorama Ventures", when: "3 days ago" },
  { who: "Amarsh", text: "created project: Chief Financial Officer", when: "3 days ago" },
];

function ProjectDetail() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [editMode, setEditMode] = useState(false);

  const project = projects.find((p) => p.id === id) ?? projects[0];
  const title = "Chief Financial Officer";
  const clientName = project.clientName || "Indorama Ventures";
  const clientId = project.clientId || "c1";

  const setTab = (next: typeof tab) => {
    navigate({ search: { tab: next } });
  };

  return (
    <div className="flex flex-col">
      {/* Project Header */}
      <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
        {/* Row 1 */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight text-brand-text">
              {title}
            </h1>
            <Link
              to="/clients/$id"
              params={{ id: clientId }}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
            >
              <Building2 className="h-3.5 w-3.5" />
              {clientName}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90">
              <Sparkles className="h-4 w-4" />
              Run matching
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setEditMode((v) => !v)}
            >
              <Pencil className="h-4 w-4" />
              {editMode ? "Exit edit" : "Edit brief"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate project</DropdownMenuItem>
                <DropdownMenuItem>Change status</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-status-danger">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2 - metadata pills */}
        <div className="mt-4 flex items-center gap-0 overflow-x-auto">
          <MetaPill>
            <StatusBadge status="shortlisted" />
          </MetaPill>
          <MetaPill icon={Award}>C-Suite</MetaPill>
          <MetaPill icon={MapPin}>Jakarta, Indonesia</MetaPill>
          <MetaPill icon={Building}>Hybrid</MetaPill>
          <MetaPill icon={Clock}>15+ years</MetaPill>
          <MetaPill icon={DollarSign}>$180K – $250K USD</MetaPill>
          <MetaPill icon={Calendar} muted>
            Mar 12, 2026
          </MetaPill>
          <MetaPill last>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
              AM
            </span>
            <span className="text-[13px] text-brand-text">Amarsh</span>
          </MetaPill>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mt-0 flex gap-1 border-b border-gray-100 bg-white px-6">
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
                <span className="rounded-full bg-brand-seafoam px-2 py-0.5 text-[11px] font-medium text-brand-primary">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tab === "brief" && <BriefTab editMode={editMode} setEditMode={setEditMode} />}
        {tab === "candidates" && <MatchResults projectId={id} />}
        {tab === "outreach" && (
          <EmptyState
            icon={Send}
            title="Outreach campaigns"
            description="Create a LinkedIn outreach campaign to reach shortlisted candidates."
            actionLabel="Create campaign"
            onAction={() => {}}
          />
        )}
        {tab === "pipeline" && (
          <EmptyState
            icon={GitBranch}
            title="Screening pipeline"
            description="Candidates who respond or apply will appear here for screening and selection."
            actionLabel="View pipeline"
            onAction={() => {}}
          />
        )}
        {tab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
}

function MetaPill({
  children,
  icon: Icon,
  muted,
  last,
}: {
  children: React.ReactNode;
  icon?: typeof Award;
  muted?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap pr-4",
        !last && "mr-4 border-r border-gray-200",
      )}
    >
      {Icon && (
        <Icon className="h-3.5 w-3.5 text-brand-text-secondary" strokeWidth={1.75} />
      )}
      <span
        className={cn(
          "text-[13px]",
          muted ? "text-brand-text-secondary" : "text-brand-text",
        )}
      >
        {children}
      </span>
    </div>
  );
}

function BriefTab({
  editMode,
  setEditMode,
}: {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          {editMode && (
            <div className="-mt-2 mb-4 flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-brand-primary text-white hover:bg-brand-primary/90"
                onClick={() => setEditMode(false)}
              >
                Save changes
              </Button>
            </div>
          )}

          <SectionLabel>Core requirements</SectionLabel>
          <Field label="Job title" value="Chief Financial Officer" emphasize editMode={editMode} />
          <Field
            label="Seniority level"
            value={<StatusBadge status="ai_generated" label="C-Suite" />}
            editMode={editMode}
          />
          <Field label="Department" value="Finance & Accounting" editMode={editMode} />
          <Field label="Reports to" value="Chief Executive Officer" editMode={editMode} />
          <Field
            label="Location"
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-text-secondary" />
                Jakarta, Indonesia
              </span>
            }
            editMode={editMode}
          />
          <Field
            label="Work model"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-brand-text-secondary" />
                Hybrid (3 days office)
              </span>
            }
            editMode={editMode}
          />
          <Field label="Experience required" value="15–20 years" editMode={editMode} />
          <Field label="Education" value="MBA or CPA preferred" editMode={editMode} last />

          <SectionLabel>Skills & competencies</SectionLabel>
          <Field
            label="Required skills"
            value={
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <SkillPill key={s} editMode={editMode}>
                    {s}
                  </SkillPill>
                ))}
                {editMode && (
                  <button className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-brand-text-secondary hover:bg-brand-bg">
                    + Add skill
                  </button>
                )}
              </div>
            }
            editMode={editMode}
          />
          <Field
            label="Nice-to-have skills"
            value={
              <div className="flex flex-wrap gap-1.5">
                {niceToHaveSkills.map((s) => (
                  <SkillPill key={s} variant="nice" editMode={editMode}>
                    {s}
                  </SkillPill>
                ))}
              </div>
            }
            editMode={editMode}
          />
          <Field
            label="Languages"
            value="English (fluent), Bahasa Indonesia (preferred)"
            editMode={editMode}
            last
          />

          <SectionLabel>Compensation</SectionLabel>
          <Field
            label="Salary range"
            value="$180,000 – $250,000 USD per annum"
            emphasize
            editMode={editMode}
          />
          <Field
            label="Bonus structure"
            value="20–30% annual performance bonus"
            editMode={editMode}
          />
          <Field
            label="Additional"
            value="Company car, health insurance, annual flight allowance"
            editMode={editMode}
            last
          />

          <SectionLabel>Responsibilities</SectionLabel>
          <ol className="mt-2 space-y-2">
            {responsibilities.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 text-[14px] leading-relaxed text-brand-text"
              >
                <span className="w-5 shrink-0 text-brand-text-secondary">{i + 1}.</span>
                {editMode ? (
                  <input
                    defaultValue={r}
                    className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                  />
                ) : (
                  <span>{r}</span>
                )}
              </li>
            ))}
            {editMode && (
              <li>
                <button className="mt-1 text-sm text-brand-primary hover:underline">
                  + Add item
                </button>
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-gray-100 bg-brand-bg">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text">Original JD</span>
            </div>
            <button
              className="rounded-md p-1.5 text-brand-text-secondary hover:bg-white hover:text-brand-text"
              aria-label="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto px-5 py-4">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-brand-text-secondary">
              {originalJD}
            </pre>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="text-[13px] font-medium text-brand-text-secondary">
            Parsing metadata
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <MetaRow label="Model" value="Claude Sonnet 4.6" />
            <MetaRow label="Parsed at" value="Mar 12, 2026 at 2:34 PM" />
            <div className="flex items-center justify-between">
              <dt className="text-brand-text-secondary">Confidence</dt>
              <dd>
                <StatusBadge status="active" label="High" size="sm" />
              </dd>
            </div>
            <MetaRow label="Cost" value="$0.021" muted />
          </dl>
          <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline">
            <RefreshCw className="h-3 w-3" />
            Re-parse
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-text-secondary">{label}</dt>
      <dd className={cn(muted ? "text-brand-text-secondary" : "text-brand-text")}>
        {value}
      </dd>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary first:mt-0">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  emphasize,
  editMode,
  last,
}: {
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
  editMode?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 py-3",
        !last && "border-b border-gray-50",
      )}
    >
      <div className="w-40 shrink-0 pt-0.5 text-[13px] text-brand-text-secondary">
        {label}
      </div>
      <div
        className={cn(
          "flex-1 text-brand-text",
          emphasize ? "text-[15px] font-medium" : "text-[14px]",
        )}
      >
        {editMode && typeof value === "string" ? (
          <input
            defaultValue={value}
            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function SkillPill({
  children,
  variant = "required",
  editMode,
}: {
  children: React.ReactNode;
  variant?: "required" | "nice";
  editMode?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variant === "required"
          ? "border border-brand-mint/50 bg-brand-seafoam/40 text-brand-primary"
          : "border border-dashed border-gray-300 bg-white text-brand-text-secondary",
      )}
    >
      {children}
      {editMode && (
        <button className="text-brand-text-secondary hover:text-status-danger" aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}

function ActivityTab() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <ul className="space-y-4">
        {projectActivity.map((a, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-semibold text-brand-primary">
              {a.who === "AI" ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                a.who.slice(0, 2).toUpperCase()
              )}
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
