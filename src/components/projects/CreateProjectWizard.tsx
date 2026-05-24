import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardPaste,
  FileUp,
  Loader2,
  PenTool,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { clients as mockClients } from "@/lib/mock-data";

export interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultClientId?: string;
}

type JdMode = "manual" | "paste" | "upload";
type Priority = "Low" | "Medium" | "High" | "Urgent";

interface ManualForm {
  // Role basics
  jobTitle: string;
  seniority: string;
  department: string;
  hiringManager: string;
  headcount: string;
  location: string;
  workModel: string;
  // Requirements
  experienceMin: string;
  experienceMax: string;
  education: string;
  skillsRequired: string[];
  skillsNice: string[];
  languages: string[];
  responsibilities: string;
  // Compensation & timeline
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  priority: Priority;
  openedDate: string;
  targetCloseDate: string;
}

const SENIORITIES = ["C-Suite", "VP", "Director", "Senior Manager", "Manager", "Senior", "Mid", "Junior"];
const WORK_MODELS = ["On-site", "Hybrid", "Remote"];
const EDUCATION_OPTIONS = ["Any", "Bachelor's", "Master's", "MBA", "PhD"];
const CURRENCIES = ["USD", "EUR", "GBP", "SGD", "IDR", "AUD", "JPY"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];
const DEFAULT_LANGUAGES = ["English", "Bahasa Indonesia"];

const STEP_LABELS = ["Client", "Job description", "Confirm"];

const today = () => new Date().toISOString().slice(0, 10);

export function CreateProjectWizard({
  open,
  onOpenChange,
  defaultClientId,
}: CreateProjectWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState<string>(defaultClientId ?? "");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const [extraClients, setExtraClients] = useState<
    { id: string; name: string; industry: string }[]
  >([]);

  const [jdMode, setJdMode] = useState<JdMode>("manual");
  const [pasteText, setPasteText] = useState("");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const blankForm = (): ManualForm => ({
    jobTitle: "",
    seniority: "",
    department: "",
    hiringManager: "",
    headcount: "1",
    location: "",
    workModel: "",
    experienceMin: "",
    experienceMax: "",
    education: "Any",
    skillsRequired: [],
    skillsNice: [],
    languages: [...DEFAULT_LANGUAGES],
    responsibilities: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    priority: "Medium",
    openedDate: today(),
    targetCloseDate: "",
  });

  const [form, setForm] = useState<ManualForm>(blankForm);

  const allClients = [
    ...mockClients.map((c) => ({ id: c.id, name: c.name, industry: c.industry })),
    ...extraClients,
  ];
  const selectedClient = allClients.find((c) => c.id === clientId);

  const reset = () => {
    setStep(1);
    setClientId(defaultClientId ?? "");
    setJdMode("manual");
    setPasteText("");
    setUploadName(null);
    setParsing(false);
    setForm(blankForm());
  };

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(reset, 200);
  };

  const addClient = () => {
    const name = newClientName.trim();
    if (!name) return;
    const id = `c-new-${Date.now()}`;
    setExtraClients((prev) => [
      ...prev,
      { id, name, industry: newClientIndustry.trim() || "—" },
    ]);
    setClientId(id);
    setNewClientName("");
    setNewClientIndustry("");
    setAddClientOpen(false);
    toast.success(`${name} added`);
  };

  const runParse = async () => {
    setParsing(true);
    await new Promise((r) => setTimeout(r, 3000));
    setParsing(false);
    onOpenChange(false);
    navigate({ to: "/projects/$id/parse", params: { id: "p1" } });
  };

  const canNext1 = !!clientId;
  const canNext2 =
    jdMode === "manual"
      ? form.jobTitle.trim().length > 0 && !!form.seniority && form.location.trim().length > 0
      : false;

  const createProject = () => {
    toast.success(`${form.jobTitle || "New project"} created`);
    onOpenChange(false);
    navigate({ to: "/projects/$id", params: { id: "p1" } });
  };

  const update = <K extends keyof ManualForm>(key: K, value: ManualForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[720px] w-[720px] p-0 gap-0 sm:max-w-[720px]">
        <DialogHeader className="border-b border-border px-6 py-4 space-y-0">
          <DialogTitle className="text-[18px] font-semibold text-brand-text">
            Create new project
          </DialogTitle>
          <DialogDescription className="text-[13px] text-brand-text-secondary">
            Set up a new executive search mandate in 3 steps.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          {STEP_LABELS.map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    done
                      ? "bg-brand-primary text-white"
                      : active
                        ? "bg-brand-mint/40 text-brand-primary ring-2 ring-brand-primary"
                        : "bg-brand-bg text-brand-text-secondary",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
                <span
                  className={cn(
                    "text-[13px]",
                    active
                      ? "font-medium text-brand-text"
                      : "text-brand-text-secondary",
                  )}
                >
                  {label}
                </span>
                {idx < STEP_LABELS.length && (
                  <div className="mx-2 h-px w-8 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-brand-text">Select client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setAddClientOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add new client
                </button>
              </div>

              {addClientOpen && (
                <div className="rounded-lg border border-border bg-brand-bg/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-brand-text">
                      Add new client
                    </h4>
                    <button
                      onClick={() => setAddClientOpen(false)}
                      className="text-brand-text-secondary hover:text-brand-text"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <Label className="text-xs text-brand-text-secondary">
                      Company name
                    </Label>
                    <Input
                      autoFocus
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Acme Corp"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-brand-text-secondary">
                      Industry
                    </Label>
                    <Input
                      value={newClientIndustry}
                      onChange={(e) => setNewClientIndustry(e.target.value)}
                      placeholder="Manufacturing"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={addClient}
                    disabled={!newClientName.trim()}
                    className="bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    Add client
                  </Button>
                </div>
              )}

              {selectedClient && (
                <div className="rounded-lg border border-brand-mint bg-brand-seafoam/20 p-4">
                  <p className="text-sm font-medium text-brand-text">
                    {selectedClient.name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-secondary">
                    {selectedClient.industry}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              {/* Mode tabs */}
              <div className="mb-4 flex gap-1.5 border-b border-border">
                <ModeTab
                  active={jdMode === "manual"}
                  onClick={() => setJdMode("manual")}
                  icon={PenTool}
                  label="Manual entry"
                />
                <ModeTab
                  active={jdMode === "paste"}
                  onClick={() => setJdMode("paste")}
                  icon={ClipboardPaste}
                  label="Paste JD"
                />
                <ModeTab
                  active={jdMode === "upload"}
                  onClick={() => setJdMode("upload")}
                  icon={FileUp}
                  label="Upload JD"
                />
              </div>

              {jdMode === "manual" && (
                <div className="space-y-6">
                  {/* SECTION: Role basics */}
                  <Section
                    title="Role basics"
                    description="The headline of the role and where it sits."
                  >
                    <Field
                      label="Job title"
                      required
                      value={form.jobTitle}
                      onChange={(v) => update("jobTitle", v)}
                      placeholder="Chief Financial Officer"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField
                        label="Seniority level"
                        required
                        value={form.seniority}
                        onChange={(v) => update("seniority", v)}
                        options={SENIORITIES}
                        placeholder="Select..."
                      />
                      <Field
                        label="Department / function"
                        value={form.department}
                        onChange={(v) => update("department", v)}
                        placeholder="Finance"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Hiring manager"
                        value={form.hiringManager}
                        onChange={(v) => update("hiringManager", v)}
                        placeholder="e.g. Sarah Chen, CEO"
                      />
                      <Field
                        label="Headcount"
                        value={form.headcount}
                        onChange={(v) => update("headcount", v)}
                        type="number"
                        placeholder="1"
                        helper="Number of openings"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Location"
                        required
                        value={form.location}
                        onChange={(v) => update("location", v)}
                        placeholder="Jakarta, Indonesia"
                      />
                      <SelectField
                        label="Work model"
                        value={form.workModel}
                        onChange={(v) => update("workModel", v)}
                        options={WORK_MODELS}
                        placeholder="Select..."
                      />
                    </div>
                  </Section>

                  {/* SECTION: Requirements */}
                  <Section
                    title="Requirements"
                    description="Used by the AI Matching Engine to score candidates."
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <Field
                        label="Min experience (yrs)"
                        value={form.experienceMin}
                        onChange={(v) => update("experienceMin", v)}
                        type="number"
                        placeholder="10"
                      />
                      <Field
                        label="Max experience (yrs)"
                        value={form.experienceMax}
                        onChange={(v) => update("experienceMax", v)}
                        type="number"
                        placeholder="20"
                      />
                      <SelectField
                        label="Education"
                        value={form.education}
                        onChange={(v) => update("education", v)}
                        options={EDUCATION_OPTIONS}
                        placeholder="Any"
                      />
                    </div>
                    <TagInput
                      label="Skills required"
                      value={form.skillsRequired}
                      onChange={(v) => update("skillsRequired", v)}
                      placeholder="Type a skill and press Enter"
                      tone="info"
                    />
                    <TagInput
                      label="Skills nice-to-have"
                      value={form.skillsNice}
                      onChange={(v) => update("skillsNice", v)}
                      placeholder="Type a skill and press Enter"
                      tone="neutral"
                    />
                    <TagInput
                      label="Language requirements"
                      value={form.languages}
                      onChange={(v) => update("languages", v)}
                      placeholder="Add a language and press Enter"
                      tone="neutral"
                      suggestions={DEFAULT_LANGUAGES}
                    />
                    <div>
                      <Label className="text-sm text-brand-text">
                        Key responsibilities
                      </Label>
                      <Textarea
                        rows={4}
                        value={form.responsibilities}
                        onChange={(e) =>
                          update("responsibilities", e.target.value)
                        }
                        placeholder="Lead the finance function..."
                        className="mt-1.5"
                      />
                    </div>
                  </Section>

                  {/* SECTION: Compensation & timeline */}
                  <Section
                    title="Compensation & timeline"
                    description="Budget, urgency, and target dates."
                  >
                    <div className="grid grid-cols-[1fr_1fr_140px] gap-3">
                      <Field
                        label="Salary min"
                        value={form.salaryMin}
                        onChange={(v) => update("salaryMin", v)}
                        placeholder="180000"
                        type="number"
                      />
                      <Field
                        label="Salary max"
                        value={form.salaryMax}
                        onChange={(v) => update("salaryMax", v)}
                        placeholder="250000"
                        type="number"
                      />
                      <SelectField
                        label="Currency"
                        value={form.salaryCurrency}
                        onChange={(v) => update("salaryCurrency", v)}
                        options={CURRENCIES}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-brand-text">Priority</Label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {PRIORITIES.map((p) => {
                          const active = form.priority === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => update("priority", p)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                active
                                  ? p === "Urgent"
                                    ? "border-status-danger bg-status-danger/10 text-status-danger"
                                    : p === "High"
                                      ? "border-status-warning bg-status-warning/15 text-status-warning"
                                      : "border-brand-primary bg-brand-mint/40 text-brand-primary"
                                  : "border-border bg-card text-brand-text-secondary hover:text-brand-text",
                              )}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Opened date"
                        value={form.openedDate}
                        onChange={(v) => update("openedDate", v)}
                        type="date"
                      />
                      <Field
                        label="Target close date"
                        value={form.targetCloseDate}
                        onChange={(v) => update("targetCloseDate", v)}
                        type="date"
                        helper="When this role should ideally be filled"
                      />
                    </div>
                  </Section>
                </div>
              )}

              {jdMode === "paste" && (
                <div className="space-y-3">
                  <Label className="text-sm text-brand-text">Paste job description</Label>
                  <Textarea
                    rows={10}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste the complete JD here..."
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={runParse}
                    disabled={!pasteText.trim() || parsing}
                    className="w-full gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Parsing with Claude Sonnet 4.6...
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

              {jdMode === "upload" && (
                <div className="space-y-3">
                  <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-brand-bg/50 transition hover:border-brand-primary hover:bg-brand-mint/10">
                    <Upload className="h-7 w-7 text-brand-text-secondary" />
                    <p className="mt-2 text-sm font-medium text-brand-text">
                      {uploadName ?? "Click to upload JD"}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-text-secondary">
                      PDF or DOCX · Max 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setUploadName(f.name);
                      }}
                    />
                  </label>
                  <Button
                    onClick={runParse}
                    disabled={!uploadName || parsing}
                    className="w-full gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Parsing with Claude Sonnet 4.6...
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
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-brand-text">Summary</h3>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <SummaryRow label="Client" value={selectedClient?.name ?? "—"} />
                  <SummaryRow label="Job title" value={form.jobTitle || "—"} />
                  <SummaryRow label="Seniority" value={form.seniority || "—"} />
                  <SummaryRow label="Department" value={form.department || "—"} />
                  <SummaryRow label="Hiring manager" value={form.hiringManager || "—"} />
                  <SummaryRow label="Headcount" value={form.headcount || "1"} />
                  <SummaryRow label="Location" value={form.location || "—"} />
                  <SummaryRow label="Work model" value={form.workModel || "—"} />
                  <SummaryRow
                    label="Experience"
                    value={
                      form.experienceMin || form.experienceMax
                        ? `${form.experienceMin || "0"}–${form.experienceMax || "?"} years`
                        : "—"
                    }
                  />
                  <SummaryRow label="Education" value={form.education || "—"} />
                  <SummaryRow
                    label="Required skills"
                    value={form.skillsRequired.length ? form.skillsRequired.join(", ") : "—"}
                  />
                  <SummaryRow
                    label="Nice-to-have skills"
                    value={form.skillsNice.length ? form.skillsNice.join(", ") : "—"}
                  />
                  <SummaryRow
                    label="Languages"
                    value={form.languages.length ? form.languages.join(", ") : "—"}
                  />
                  <SummaryRow
                    label="Salary range"
                    value={
                      form.salaryMin && form.salaryMax
                        ? `${form.salaryCurrency} ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()}`
                        : "—"
                    }
                  />
                  <SummaryRow label="Priority" value={form.priority} />
                  <SummaryRow label="Opened" value={form.openedDate || "—"} />
                  <SummaryRow label="Target close" value={form.targetCloseDate || "—"} />
                </dl>
              </div>
              <p className="text-xs text-brand-text-secondary">
                You'll be able to add candidates, run AI matching, and launch outreach
                after creating the project.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step > 1 ? setStep(step - 1) : handleOpenChange(false))}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 && (
            <Button
              size="sm"
              disabled={step === 1 ? !canNext1 : !canNext2}
              onClick={() => setStep(step + 1)}
              className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {step === 3 && (
            <Button
              size="sm"
              onClick={createProject}
              className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Create project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-primary text-brand-primary"
          : "border-transparent text-brand-text-secondary hover:text-brand-text",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 border-b border-border pb-2">
        <h4 className="text-sm font-semibold text-brand-text">{title}</h4>
        {description && (
          <p className="mt-0.5 text-xs text-brand-text-secondary">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <Label className="text-sm text-brand-text">
        {label}
        {required && <span className="ml-0.5 text-status-danger">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
      {helper && (
        <p className="mt-1 text-[11px] text-brand-text-secondary">{helper}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="text-sm text-brand-text">
        {label}
        {required && <span className="ml-0.5 text-status-danger">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
  tone = "info",
  suggestions,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  tone?: "info" | "neutral";
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (value.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const chipClass =
    tone === "info"
      ? "bg-status-info/10 text-status-info"
      : "bg-brand-bg text-brand-text-secondary";

  const availableSuggestions = (suggestions ?? []).filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <Label className="text-sm text-brand-text">{label}</Label>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
        {value.map((t) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              chipClass,
            )}
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="rounded-full hover:bg-black/10"
              aria-label={`Remove ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && add(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[140px] bg-transparent py-0.5 text-sm outline-none placeholder:text-brand-text-secondary"
        />
      </div>
      {availableSuggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-brand-text-secondary">Suggested:</span>
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary"
            >
              <Plus className="h-2.5 w-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-xs text-brand-text-secondary">{label}</dt>
      <dd className="text-right text-sm text-brand-text">{value}</dd>
    </div>
  );
}
