import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/mock-data";

const searchSchema = z.object({
  projectId: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/_app/jobs/new")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "New Job — HireSmart" }] }),
  component: JobWizard,
});

const STEPS = [
  { id: 1, label: "Project & basics" },
  { id: 2, label: "JD input" },
  { id: 3, label: "AI review" },
  { id: 4, label: "Confirm" },
];

const SAMPLE_JD = `CHIEF FINANCIAL OFFICER — INDORAMA VENTURES

Indorama Ventures is seeking a Group Chief Financial Officer based in Bangkok, Thailand. Reporting to the CEO, the CFO owns financial strategy, capital allocation, M&A execution, and investor relations across our regional petrochemical operations.

Responsibilities
- Lead financial strategy, planning, and forecasting across 4 business units
- Drive M&A due diligence and post-merger integration
- Ensure IFRS compliance and regional tax adherence
- Present quarterly to the Board and investor community
- Manage banking relationships and working capital
- Partner with the CEO on 5-year growth plan

Requirements
- 15-25 years of progressive finance experience
- 5+ years as CFO of a listed company
- MBA, CPA, or CFA strongly preferred
- M&A track record on deals > $100M
- Manufacturing or petrochemical industry experience
- Fluent English; Bahasa Indonesia an advantage

Compensation: IDR 150M-250M / month, plus 30-40% bonus, LTIP, benefits.`;

const EXTRACTED = {
  jobTitle: "Chief Financial Officer",
  seniority: "c_suite",
  department: "Finance",
  skillsRequired: [
    "Financial Planning & Analysis",
    "M&A Due Diligence",
    "IFRS Compliance",
    "Treasury Management",
    "Board Reporting",
    "Team Leadership",
  ],
  skillsNice: ["Manufacturing Industry", "IPO Experience", "Bahasa Indonesia"],
  expMin: 15,
  expMax: 25,
  education: "MBA, CPA, or CFA preferred",
  location: "Bangkok, Thailand",
  workModel: "hybrid",
  salaryMin: "150000000",
  salaryMax: "250000000",
  currency: "IDR",
  responsibilities: [
    "Lead financial strategy, planning, and forecasting across 4 business units",
    "Drive M&A due diligence and post-merger integration",
    "Ensure IFRS compliance and regional tax adherence",
    "Present quarterly to the Board and investor community",
    "Manage banking relationships and working capital",
    "Partner with the CEO on the 5-year growth plan",
  ],
  languages: ["English (fluent)", "Bahasa Indonesia (preferred)"],
};

function JobWizard() {
  const navigate = useNavigate();
  const { projectId: prefilledProjectId } = Route.useSearch();
  const [step, setStep] = useState(1);

  // Step 1
  const [projectId, setProjectId] = useState(prefilledProjectId ?? "p1");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [assignee, setAssignee] = useState("priya");

  // Step 2
  const [inputMode, setInputMode] = useState<"paste" | "upload" | "manual">("paste");
  const [pastedJd, setPastedJd] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  // Step 3
  const [data, setData] = useState(EXTRACTED);

  // Step 4
  const [publish, setPublish] = useState(false);
  const [runMatching, setRunMatching] = useState(true);

  const parse = async () => {
    setParsing(true);
    await new Promise((r) => setTimeout(r, 2200));
    if (pastedJd.trim().length === 0 && !uploadedFile) {
      setPastedJd(SAMPLE_JD);
    }
    setParsing(false);
    setStep(3);
  };

  const canNext1 = !!projectId && jobTitle.trim().length > 0;

  const create = () => {
    toast.success("Job created successfully");
    navigate({ to: "/jobs/$id", params: { id: "j1" } });
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] pb-16">
      <div className="mb-2 flex items-center gap-1 text-sm text-brand-text-secondary">
        <Link to="/projects" className="hover:underline">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>New job</span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-brand-text">Create a new job</h1>

      <StepBar current={step} />

      <div className="mt-8">
        {step === 1 && (
          <Card>
            <h2 className="mb-1 text-lg font-semibold">Project & basics</h2>
            <p className="mb-6 text-sm text-brand-text-secondary">
              Pick the engagement this job lives under.
            </p>
            <div className="grid gap-5">
              <div>
                <Label className="mb-1.5 block">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} — {p.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">
                  Job title <span className="text-status-danger">*</span>
                </Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Chief Financial Officer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Department</Label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Finance"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">
                    Headcount
                    <span className="ml-1 text-xs text-brand-text-secondary">
                      How many positions?
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={headcount}
                    onChange={(e) => setHeadcount(parseInt(e.target.value || "1", 10))}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Assigned recruiter</Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priya">Priya Sharma</SelectItem>
                    <SelectItem value="daniel">Daniel Wirawan</SelectItem>
                    <SelectItem value="aisha">Aisha Rahman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="mb-1 text-lg font-semibold">Add the job description</h2>
            <p className="mb-6 text-sm text-brand-text-secondary">
              Paste, upload, or enter the details manually.
            </p>
            <div className="mb-5 flex gap-1 border-b border-border">
              {(["paste", "upload", "manual"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMode(m)}
                  className={cn(
                    "rounded-t-md px-4 py-2 text-sm font-medium capitalize",
                    inputMode === m
                      ? "border-b-2 border-brand-primary text-brand-primary"
                      : "border-b-2 border-transparent text-brand-text-secondary hover:text-brand-text",
                  )}
                >
                  {m === "paste" ? "Paste JD" : m === "upload" ? "Upload file" : "Manual entry"}
                </button>
              ))}
            </div>
            {inputMode === "paste" && (
              <div>
                <Textarea
                  rows={12}
                  value={pastedJd}
                  onChange={(e) => setPastedJd(e.target.value)}
                  placeholder="Paste the full job description here..."
                />
                <Button onClick={parse} disabled={parsing} className="mt-4 gap-2">
                  {parsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is extracting job details...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Parse with AI
                    </>
                  )}
                </Button>
              </div>
            )}
            {inputMode === "upload" && (
              <div>
                <label className="flex h-44 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-brand-bg/50 text-center transition-colors hover:border-brand-primary hover:bg-brand-bg">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploadedFile(`${f.name} (${Math.round(f.size / 1024)} KB)`);
                    }}
                  />
                  <div>
                    <Upload className="mx-auto h-8 w-8 text-brand-text-secondary" />
                    <p className="mt-2 text-sm font-medium text-brand-text">
                      {uploadedFile ?? "Drop a PDF, DOCX, or TXT file"}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-text-secondary">
                      or click to browse
                    </p>
                  </div>
                </label>
                <Button
                  onClick={parse}
                  disabled={parsing || !uploadedFile}
                  className="mt-4 gap-2"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Parse with AI
                    </>
                  )}
                </Button>
              </div>
            )}
            {inputMode === "manual" && (
              <div className="rounded-md bg-brand-bg p-4 text-sm text-brand-text-secondary">
                Skip to the next step — you'll fill in fields directly in the editor.
              </div>
            )}
          </Card>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[45fr_55fr]">
            <Card>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-text">
                <FileText className="h-4 w-4" />
                Original JD
              </div>
              <div className="max-h-[600px] overflow-y-auto rounded-md bg-brand-bg/60 p-4">
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-brand-text-secondary">
                  {pastedJd || SAMPLE_JD}
                </pre>
              </div>
            </Card>
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
                  <Sparkles className="h-4 w-4 text-status-ai" />
                  Extracted fields
                </div>
                <span className="rounded-full bg-status-ai/15 px-2 py-0.5 text-[11px] font-medium text-status-ai">
                  AI parsed
                </span>
              </div>
              <div className="mb-4 rounded-md border border-status-info/30 bg-status-info/10 p-3 text-[13px] text-brand-text">
                Review and edit the AI-extracted fields. The AI gets it right ~90% of the
                time — always verify.
              </div>
              <ExtractedFields data={data} setData={setData} />
            </Card>
          </div>
        )}

        {step === 4 && (
          <Card>
            <h2 className="mb-1 text-lg font-semibold">Confirm & create</h2>
            <p className="mb-6 text-sm text-brand-text-secondary">
              Review the brief before creating the job.
            </p>
            <div className="rounded-xl border border-border bg-brand-bg/40 p-5">
              <h3 className="text-xl font-semibold text-brand-text">
                {data.jobTitle}
              </h3>
              <p className="mt-1 text-sm text-brand-text-secondary">
                {data.location} · {data.workModel} · {data.expMin}-{data.expMax} years
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.skillsRequired.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-status-info/10 px-2.5 py-1 text-xs text-status-info"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Row label="Salary" value={`${data.currency} ${Number(data.salaryMin).toLocaleString()} – ${Number(data.salaryMax).toLocaleString()}`} />
                <Row label="Headcount" value={String(headcount)} />
                <Row label="Project" value={projects.find((p) => p.id === projectId)?.title ?? "—"} />
                <Row label="Assigned" value={assignee === "priya" ? "Priya Sharma" : assignee === "daniel" ? "Daniel Wirawan" : "Aisha Rahman"} />
              </dl>
            </div>
            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-2.5 text-sm">
                <Checkbox checked={publish} onCheckedChange={(v) => setPublish(!!v)} />
                <span>Publish this job to the candidate portal</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm">
                <Checkbox checked={runMatching} onCheckedChange={(v) => setRunMatching(!!v)} />
                <span>Run AI matching against existing candidates immediately</span>
              </label>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Link
            to="/projects"
            className="self-center text-sm text-brand-text-secondary hover:text-brand-text"
          >
            Cancel
          </Link>
        </div>
        <div className="flex gap-2">
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!canNext1}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button onClick={() => setStep(3)} variant={inputMode === "manual" ? "default" : "outline"}>
              {inputMode === "manual" ? "Continue" : "Skip AI parse"}
            </Button>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={parse} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Re-parse
              </Button>
              <Button onClick={() => setStep(4)}>Next</Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={create} className="gap-2 bg-status-success text-white hover:bg-status-success/90">
              <Check className="h-4 w-4" />
              Create job
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const completed = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  completed && "bg-status-success text-white",
                  active && "bg-brand-primary text-white ring-4 ring-brand-mint/40",
                  !completed && !active && "bg-gray-200 text-gray-500",
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={cn(
                  "mt-1.5 whitespace-nowrap text-[11px]",
                  active ? "font-medium text-brand-text" : "text-brand-text-secondary",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 -translate-y-3",
                  current > s.id ? "bg-status-success" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brand-text-secondary">{label}</dt>
      <dd className="mt-0.5 font-medium text-brand-text">{value}</dd>
    </div>
  );
}

function ExtractedFields({
  data,
  setData,
}: {
  data: typeof EXTRACTED;
  setData: (d: typeof EXTRACTED) => void;
}) {
  const update = <K extends keyof typeof EXTRACTED>(k: K, v: (typeof EXTRACTED)[K]) =>
    setData({ ...data, [k]: v });

  return (
    <div className="space-y-4 text-sm">
      <Field label="Job title">
        <Input value={data.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
      </Field>
      <Field label="Seniority">
        <Select value={data.seniority} onValueChange={(v) => update("seniority", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="c_suite">C-Suite</SelectItem>
            <SelectItem value="vp">VP</SelectItem>
            <SelectItem value="director">Director</SelectItem>
            <SelectItem value="senior_manager">Senior Manager</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="mid">Mid</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Required skills">
        <TagInput
          values={data.skillsRequired}
          onChange={(v) => update("skillsRequired", v)}
          color="info"
        />
      </Field>
      <Field label="Nice to have">
        <TagInput
          values={data.skillsNice}
          onChange={(v) => update("skillsNice", v)}
          color="neutral"
        />
      </Field>
      <Field label="Experience (years)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={data.expMin}
            onChange={(e) => update("expMin", parseInt(e.target.value, 10))}
            className="w-24"
          />
          <span className="text-brand-text-secondary">to</span>
          <Input
            type="number"
            value={data.expMax}
            onChange={(e) => update("expMax", parseInt(e.target.value, 10))}
            className="w-24"
          />
        </div>
      </Field>
      <Field label="Location">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <Input
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            className="pl-8"
          />
        </div>
      </Field>
      <Field label="Work model">
        <div className="flex gap-3">
          {(["onsite", "hybrid", "remote"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1.5 text-sm capitalize">
              <input
                type="radio"
                checked={data.workModel === m}
                onChange={() => update("workModel", m)}
              />
              {m}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Salary">
        <div className="flex items-center gap-2">
          <Input
            value={data.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value)}
          />
          <span className="text-brand-text-secondary">to</span>
          <Input
            value={data.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value)}
          />
          <Select value={data.currency} onValueChange={(v) => update("currency", v)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IDR">IDR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="SGD">SGD</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
        {label}
      </Label>
      {children}
    </div>
  );
}

function TagInput({
  values,
  onChange,
  color,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  color: "info" | "neutral";
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="rounded-md border border-input bg-background p-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
              color === "info"
                ? "bg-status-info/10 text-status-info"
                : "bg-status-neutral/10 text-status-neutral",
            )}
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type and press Enter..."
          className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}
