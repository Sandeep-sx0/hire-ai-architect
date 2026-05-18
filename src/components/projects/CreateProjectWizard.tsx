import { useState } from "react";
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

interface ManualForm {
  jobTitle: string;
  seniority: string;
  location: string;
  workModel: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  responsibilities: string;
}

const SENIORITIES = ["C-Suite", "VP", "Director", "Manager", "Senior", "Mid"];
const WORK_MODELS = ["On-site", "Hybrid", "Remote"];

const STEP_LABELS = ["Client", "Job description", "Confirm"];

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

  const [form, setForm] = useState<ManualForm>({
    jobTitle: "",
    seniority: "",
    location: "",
    workModel: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    responsibilities: "",
  });

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
    setForm({
      jobTitle: "",
      seniority: "",
      location: "",
      workModel: "",
      experience: "",
      salaryMin: "",
      salaryMax: "",
      responsibilities: "",
    });
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
    // Navigate to parse review page (uses existing mock project)
    navigate({ to: "/projects/$id/parse", params: { id: "p1" } });
  };

  const canNext1 = !!clientId;
  const canNext2 =
    jdMode === "manual"
      ? form.jobTitle.trim().length > 0 && form.seniority && form.location
      : false;

  const createProject = () => {
    toast.success(`${form.jobTitle || "New project"} created`);
    onOpenChange(false);
    navigate({ to: "/projects/$id", params: { id: "p1" } });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[640px] w-[640px] p-0 gap-0 sm:max-w-[640px]">
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
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
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
                <div className="space-y-4">
                  <Field
                    label="Job title"
                    value={form.jobTitle}
                    onChange={(v) => setForm((f) => ({ ...f, jobTitle: v }))}
                    placeholder="Chief Financial Officer"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label="Seniority level"
                      value={form.seniority}
                      onChange={(v) => setForm((f) => ({ ...f, seniority: v }))}
                      options={SENIORITIES}
                      placeholder="Select..."
                    />
                    <SelectField
                      label="Work model"
                      value={form.workModel}
                      onChange={(v) => setForm((f) => ({ ...f, workModel: v }))}
                      options={WORK_MODELS}
                      placeholder="Select..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Location"
                      value={form.location}
                      onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                      placeholder="Jakarta, Indonesia"
                    />
                    <Field
                      label="Min. experience (years)"
                      value={form.experience}
                      onChange={(v) => setForm((f) => ({ ...f, experience: v }))}
                      placeholder="15"
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Salary min (USD)"
                      value={form.salaryMin}
                      onChange={(v) => setForm((f) => ({ ...f, salaryMin: v }))}
                      placeholder="180000"
                      type="number"
                    />
                    <Field
                      label="Salary max (USD)"
                      value={form.salaryMax}
                      onChange={(v) => setForm((f) => ({ ...f, salaryMax: v }))}
                      placeholder="250000"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-brand-text">
                      Key responsibilities
                    </Label>
                    <Textarea
                      rows={4}
                      value={form.responsibilities}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, responsibilities: e.target.value }))
                      }
                      placeholder="Lead the finance function..."
                      className="mt-1.5"
                    />
                  </div>
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
                  <SummaryRow label="Location" value={form.location || "—"} />
                  <SummaryRow label="Work model" value={form.workModel || "—"} />
                  <SummaryRow
                    label="Experience"
                    value={form.experience ? `${form.experience}+ years` : "—"}
                  />
                  <SummaryRow
                    label="Salary range"
                    value={
                      form.salaryMin && form.salaryMax
                        ? `$${form.salaryMin} – $${form.salaryMax} USD`
                        : "—"
                    }
                  />
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-sm text-brand-text">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-sm text-brand-text">{label}</Label>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-xs text-brand-text-secondary">{label}</dt>
      <dd className="text-sm text-brand-text">{value}</dd>
    </div>
  );
}
