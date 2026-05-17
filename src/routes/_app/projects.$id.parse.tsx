import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$id/parse")({
  head: () => ({ meta: [{ title: "Parse JD — HireSmart" }] }),
  component: ParsePage,
});

type SourceKey = "skills" | "experience" | "salary" | "location" | "title" | "responsibilities";
type Confidence = "high" | "medium" | "low";

const sourceClasses: Record<SourceKey, string> = {
  skills: "bg-brand-mint/30",
  experience: "bg-brand-seafoam/30",
  salary: "bg-brand-pink/30",
  location: "bg-blue-100/60",
  title: "bg-brand-seafoam/30",
  responsibilities: "bg-brand-mint/20",
};

const requiredSkills = [
  "Financial Planning & Analysis",
  "M&A Due Diligence",
  "IFRS/GAAP Compliance",
  "Board Reporting",
  "Team Leadership",
  "Treasury Management",
  "Budgeting & Forecasting",
];

const niceSkills: { label: string; conf: Confidence }[] = [
  { label: "IPO Readiness", conf: "medium" },
  { label: "ESG Reporting", conf: "medium" },
  { label: "SAP FICO", conf: "medium" },
  { label: "Manufacturing Industry", conf: "high" },
  { label: "Bahasa Indonesia", conf: "high" },
];

const responsibilities = [
  "Lead the finance function across 4 business units with a team of 50+ professionals",
  "Oversee financial planning, budgeting, forecasting, and variance analysis",
  "Drive M&A evaluation and post-merger integration for regional acquisitions",
  "Ensure compliance with IFRS, Indonesian tax regulations, and OJK requirements",
  "Present quarterly financial reports to the Board of Directors",
  "Manage banking relationships and optimize working capital across 12 entities",
  "Partner with the CEO on the 5-year strategic growth plan for Indonesia operations",
];

function ParsePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [hover, setHover] = useState<SourceKey | null>(null);
  const [reparsing, setReparsing] = useState(false);
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  const markEdited = (key: string) => setEdited((s) => ({ ...s, [key]: true }));

  const reparse = () => {
    setReparsing(true);
    setTimeout(() => {
      setReparsing(false);
      toast.success("Brief re-parsed successfully");
    }, 2000);
  };

  const approve = () => {
    toast.success("Brief approved. Ready for matching.");
    navigate({ to: "/projects/$id", params: { id }, search: { tab: "brief" } });
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col bg-white">
      {/* Contextual top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/projects/$id"
            params={{ id }}
            search={{ tab: "brief" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand-text hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
          <span className="hidden truncate text-sm text-brand-text-secondary md:inline">
            Parsing: Chief Financial Officer — Indorama Ventures
          </span>
        </div>

        <StepIndicator />

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={reparse}>
            <RefreshCw className={cn("h-3.5 w-3.5", reparsing && "animate-spin")} />
            Re-parse
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            onClick={approve}
          >
            <Check className="h-3.5 w-3.5" />
            Approve brief
          </Button>
        </div>
      </header>

      {/* Split view */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Left — source */}
        <section className="flex min-h-0 flex-col border-b border-gray-200 lg:border-b-0 lg:border-r">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
            <div>
              <div className="text-sm font-medium text-brand-text">
                Original job description
              </div>
              <div className="text-xs text-brand-text-secondary">
                Pasted text · 412 words
              </div>
            </div>
            <button
              className="rounded-md p-1.5 text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text"
              aria-label="Copy"
              onClick={() => toast.success("Copied to clipboard")}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-brand-bg p-6">
            <SourceText hover={hover} />
          </div>
        </section>

        {/* Right — extracted */}
        <section className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
                Extracted brief
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
                <Sparkles className="h-3 w-3 text-brand-magenta" />
                {reparsing
                  ? "Re-parsing with Claude Sonnet 4.6..."
                  : "AI-parsed · Claude Sonnet 4.6 · 3.2 seconds"}
              </div>
            </div>
            <span className="rounded-full bg-status-success/15 px-2.5 py-0.5 text-[11px] font-medium text-status-success">
              High confidence
            </span>
          </div>

          <div
            className={cn(
              "flex-1 overflow-y-auto bg-white p-6 pb-24",
              reparsing && "animate-pulse",
            )}
          >
            <SectionHeader>Position details</SectionHeader>
            <FieldRow
              label="Job title"
              value="Chief Financial Officer"
              conf="high"
              source="title"
              onHover={setHover}
              edited={edited.title}
              onEdit={() => markEdited("title")}
            />
            <FieldRow
              label="Seniority level"
              value="C-Suite"
              conf="high"
              type="select"
              options={["C-Suite", "VP", "Director", "Manager", "Senior", "Mid", "Junior"]}
              edited={edited.seniority}
              onEdit={() => markEdited("seniority")}
            />
            <FieldRow
              label="Department"
              value="Finance & Accounting"
              conf="medium"
              edited={edited.dept}
              onEdit={() => markEdited("dept")}
            />
            <FieldRow
              label="Reports to"
              value="Chief Executive Officer"
              conf="high"
              edited={edited.reports}
              onEdit={() => markEdited("reports")}
            />
            <FieldRow
              label="Location"
              value="Jakarta, Indonesia"
              conf="high"
              source="location"
              onHover={setHover}
              edited={edited.loc}
              onEdit={() => markEdited("loc")}
            />
            <FieldRow
              label="Work model"
              value="Hybrid"
              conf="high"
              type="select"
              options={["Onsite", "Hybrid", "Remote"]}
              edited={edited.wm}
              onEdit={() => markEdited("wm")}
            />

            <SectionHeader>Requirements</SectionHeader>
            <FieldRow
              label="Experience (min)"
              value="15 years"
              conf="high"
              source="experience"
              onHover={setHover}
              edited={edited.expMin}
              onEdit={() => markEdited("expMin")}
            />
            <FieldRow
              label="Experience (max)"
              value="20 years"
              conf="high"
              source="experience"
              onHover={setHover}
              edited={edited.expMax}
              onEdit={() => markEdited("expMax")}
            />
            <FieldRow
              label="Education"
              value="MBA or CPA/CA/ACCA"
              conf="high"
              edited={edited.edu}
              onEdit={() => markEdited("edu")}
            />
            <FieldRow
              label="Languages"
              value="English (fluent), Bahasa Indonesia (preferred)"
              conf="high"
              edited={edited.lang}
              onEdit={() => markEdited("lang")}
            />

            <SectionHeader>Skills</SectionHeader>
            <div
              className="mt-2"
              onMouseEnter={() => setHover("skills")}
              onMouseLeave={() => setHover(null)}
            >
              <div className="mb-1.5 text-[12px] font-medium text-brand-text">
                Required skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <SkillPill key={s} variant="required" conf="high">
                    {s}
                  </SkillPill>
                ))}
                <AddPill />
              </div>

              <div className="mb-1.5 mt-4 text-[12px] font-medium text-brand-text">
                Nice-to-have skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {niceSkills.map((s) => (
                  <SkillPill key={s.label} variant="nice" conf={s.conf}>
                    {s.label}
                  </SkillPill>
                ))}
                <AddPill />
              </div>
            </div>

            <SectionHeader>Compensation</SectionHeader>
            <FieldRow
              label="Salary min"
              value="$180,000"
              conf="high"
              source="salary"
              onHover={setHover}
              edited={edited.smin}
              onEdit={() => markEdited("smin")}
            />
            <FieldRow
              label="Salary max"
              value="$250,000"
              conf="high"
              source="salary"
              onHover={setHover}
              edited={edited.smax}
              onEdit={() => markEdited("smax")}
            />
            <FieldRow
              label="Currency"
              value="USD"
              conf="high"
              type="select"
              options={["USD", "IDR", "SGD", "AUD"]}
              edited={edited.cur}
              onEdit={() => markEdited("cur")}
            />
            <FieldRow
              label="Bonus"
              value="20–30% annual performance bonus"
              conf="high"
              edited={edited.bonus}
              onEdit={() => markEdited("bonus")}
            />
            <FieldRow
              label="Benefits"
              value="Company car, health insurance, flight allowance"
              conf="medium"
              edited={edited.benefits}
              onEdit={() => markEdited("benefits")}
            />

            <SectionHeader>Responsibilities</SectionHeader>
            <ol
              className="mt-2 space-y-1.5"
              onMouseEnter={() => setHover("responsibilities")}
              onMouseLeave={() => setHover(null)}
            >
              {responsibilities.map((r, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-2 rounded-md px-2 py-2 hover:bg-brand-bg/60"
                >
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-brand-text-secondary opacity-0 group-hover:opacity-100" />
                  <span className="w-5 shrink-0 pt-0.5 text-xs text-brand-text-secondary">
                    {i + 1}.
                  </span>
                  <span className="flex-1 text-[14px] leading-relaxed text-brand-text">
                    {r}
                  </span>
                  <ConfidenceDot conf="high" />
                  <button
                    className="shrink-0 rounded p-0.5 text-brand-text-secondary opacity-0 hover:text-status-danger group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              <li>
                <button className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline">
                  <Plus className="h-3 w-3" />
                  Add responsibility
                </button>
              </li>
            </ol>
          </div>
        </section>
      </div>

      {/* Bottom action bar */}
      <footer className="sticky bottom-0 flex h-16 shrink-0 items-center justify-between border-t border-gray-100 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-status-danger hover:bg-status-danger/10 hover:text-status-danger"
          >
            Discard changes
          </Button>
          <Button variant="outline" size="sm">
            Save as draft
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={reparse}>
            <RefreshCw className={cn("h-3.5 w-3.5", reparsing && "animate-spin")} />
            Re-parse with AI
          </Button>
          <Button
            className="gap-2 bg-brand-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-primary/90"
            onClick={approve}
          >
            <Check className="h-4 w-4" />
            Approve brief
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function StepIndicator() {
  const steps = [
    { label: "Client", state: "done" },
    { label: "JD input", state: "done" },
    { label: "AI review", state: "current" },
    { label: "Confirm", state: "pending" },
  ] as const;
  return (
    <div className="hidden items-center gap-2 md:flex">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                s.state === "done" && "bg-brand-primary",
                s.state === "current" &&
                  "bg-brand-primary ring-4 ring-brand-mint/40",
                s.state === "pending" && "border-2 border-gray-300 bg-white",
              )}
            />
            <span
              className={cn(
                "text-xs",
                s.state === "current"
                  ? "font-medium text-brand-text"
                  : "text-brand-text-secondary",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <span className="w-6 border-t border-gray-200" />}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-8 border-b border-gray-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary first:mt-0">
      {children}
    </div>
  );
}

function FieldRow({
  label,
  value,
  conf,
  source,
  onHover,
  type = "text",
  options,
  edited,
  onEdit,
}: {
  label: string;
  value: string;
  conf: Confidence;
  source?: SourceKey;
  onHover?: (s: SourceKey | null) => void;
  type?: "text" | "select";
  options?: string[];
  edited?: boolean;
  onEdit?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const commit = () => {
    setEditing(false);
    if (val !== value) onEdit?.();
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-brand-bg/60",
        edited && "border-l-2 border-brand-primary",
      )}
      onMouseEnter={() => source && onHover?.(source)}
      onMouseLeave={() => source && onHover?.(null)}
    >
      <div className="w-[140px] shrink-0 text-[13px] text-brand-text-secondary">
        {label}
      </div>
      <div className="flex flex-1 items-center gap-2">
        {editing ? (
          type === "select" && options ? (
            <select
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={commit}
              className="flex-1 rounded-md border border-brand-primary bg-white px-2 py-1 text-sm focus:outline-none"
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setVal(value);
                  setEditing(false);
                }
              }}
              className="flex-1 rounded-md border border-brand-primary bg-white px-2 py-1 text-sm focus:outline-none"
            />
          )
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-left text-[14px] text-brand-text"
          >
            {val}
          </button>
        )}
        <ConfidenceDot conf={conf} />
        <Pencil
          className="h-3 w-3 text-brand-text-secondary opacity-0 group-hover:opacity-100"
          onClick={() => setEditing(true)}
        />
      </div>
    </div>
  );
}

function ConfidenceDot({ conf }: { conf: Confidence }) {
  const map: Record<Confidence, { color: string; title: string }> = {
    high: { color: "bg-[#16A34A]", title: "Extracted from source text" },
    medium: { color: "bg-[#D97706]", title: "Inferred from context" },
    low: { color: "bg-[#DC2626]", title: "Low confidence — please verify" },
  };
  const e = map[conf];
  return <span title={e.title} className={cn("h-1.5 w-1.5 shrink-0 rounded-full", e.color)} />;
}

function SkillPill({
  children,
  variant,
  conf,
}: {
  children: React.ReactNode;
  variant: "required" | "nice";
  conf: Confidence;
}) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variant === "required"
          ? "border border-brand-mint/50 bg-brand-seafoam/40 text-brand-primary"
          : "border border-dashed border-gray-300 bg-white text-brand-text-secondary",
      )}
    >
      {children}
      <ConfidenceDot conf={conf} />
      <button
        className="opacity-0 transition-opacity hover:text-status-danger group-hover:opacity-100"
        aria-label="Remove"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function AddPill() {
  return (
    <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text">
      <Plus className="h-3 w-3" />
      Add
    </button>
  );
}

function SourceText({ hover }: { hover: SourceKey | null }) {
  const hl = (key: SourceKey, text: React.ReactNode) => (
    <span
      data-source={key}
      className={cn(
        "rounded px-0.5 transition-colors duration-200",
        hover === key ? sourceClasses[key] : "bg-transparent",
      )}
    >
      {text}
    </span>
  );

  return (
    <div className="space-y-4 text-[14px] leading-relaxed text-brand-text">
      <div>
        <div className="font-semibold">
          {hl("title", "CHIEF FINANCIAL OFFICER")} — INDORAMA VENTURES
        </div>
        <div className="mt-2 text-brand-text-secondary">
          Location: {hl("location", "Jakarta, Indonesia")}
          <br />
          Reports to: Chief Executive Officer
          <br />
          Employment type: Full-time, Permanent
          <br />
          Work arrangement: Hybrid (3 days in office, 2 days remote)
        </div>
      </div>

      <div>
        <div className="font-medium">About Indorama Ventures:</div>
        <p className="mt-1">
          Indorama Ventures Public Company Limited is one of the world's leading
          petrochemical companies, with operations across 35 countries. The Indonesia
          operations span 4 business units covering polyester, fibers, packaging, and
          specialty chemicals, employing over 6,000 people across 12 manufacturing sites.
        </p>
      </div>

      <div>
        <div className="font-medium">Role Overview:</div>
        <p className="mt-1">
          We are seeking an experienced {hl("title", "Chief Financial Officer")} to lead the
          financial strategy and operations for our Indonesia business. The CFO will be a key
          member of the Indonesia leadership team, reporting directly to the CEO and
          presenting quarterly to the Group Board of Directors in Bangkok.
        </p>
      </div>

      <div>
        <div className="font-medium">Key Responsibilities:</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {hl(
            "responsibilities",
            <>
              <li>Lead the finance function across 4 business units with a team of 50+ professionals</li>
              <li>Oversee financial planning, budgeting, forecasting, and variance analysis</li>
              <li>Drive M&A evaluation and post-merger integration for regional acquisitions</li>
              <li>Ensure compliance with IFRS, Indonesian tax regulations, and OJK requirements</li>
              <li>Present quarterly financial reports to the Board of Directors</li>
              <li>Manage banking relationships and optimize working capital across 12 entities</li>
              <li>Partner with the CEO on the 5-year strategic growth plan for Indonesia operations</li>
            </>,
          )}
        </ul>
      </div>

      <div>
        <div className="font-medium">Requirements:</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            {hl("experience", "15-20 years of progressive finance experience")} in multinational
            environments
          </li>
          <li>At least 5 years in a CFO or Group Finance Director role</li>
          <li>MBA or professional accounting qualification (CPA, CA, ACCA)</li>
          <li>
            Strong experience with {hl("skills", "IFRS/GAAP, M&A transactions, and treasury management")}
          </li>
          <li>Track record of managing large finance teams (30+ people)</li>
          <li>Experience in manufacturing, petrochemicals, or heavy industry preferred</li>
          <li>Fluent English required; Bahasa Indonesia is a strong advantage</li>
        </ul>
      </div>

      <div>
        <div className="font-medium">Compensation & Benefits:</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Base salary: {hl("salary", "USD $180,000 – $250,000 per annum")}</li>
          <li>Annual performance bonus: 20-30% of base salary</li>
          <li>Company car and driver</li>
          <li>Comprehensive health insurance for family</li>
          <li>Annual flight allowance for home country travel</li>
          <li>Relocation support if applicable</li>
        </ul>
      </div>

      <p className="text-brand-text-secondary">
        To apply or discuss confidentially, please contact the Norvex Solutions executive
        search team at hello@norvexsolutions.com or via WhatsApp at +62 819 4421 0355.
      </p>
    </div>
  );
}
