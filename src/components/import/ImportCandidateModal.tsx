import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ClipboardPaste,
  FileSpreadsheet,
  FileText,
  FileType,
  FileUp,
  HelpCircle,
  Linkedin,
  Loader2,
  PenTool,
  Sparkles,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TabId = "cv" | "linkedin" | "text" | "manual" | "csv";

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cv", label: "Upload CV", icon: FileUp },
  { id: "linkedin", label: "LinkedIn URL", icon: Linkedin },
  { id: "text", label: "Paste text", icon: ClipboardPaste },
  { id: "manual", label: "Manual entry", icon: PenTool },
  { id: "csv", label: "CSV import", icon: FileSpreadsheet },
];

const projects = [
  "CFO — Indorama Ventures",
  "VP Finance — OYO Hotels",
  "Head of Strategy — Astra",
  "CTO — Tokopedia",
];

export interface ImportCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCandidateModal({ open, onOpenChange }: ImportCandidateModalProps) {
  const [tab, setTab] = useState<TabId>("cv");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[720px] w-[720px] p-0 gap-0 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col sm:max-w-[720px] [&>button]:top-5 [&>button]:right-5"
      >
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 px-6 py-4 space-y-0">
          <DialogTitle className="text-[18px] font-semibold text-brand-text">
            Import candidates
          </DialogTitle>
          <DialogDescription className="text-[13px] text-brand-text-secondary">
            Add candidates to your database from any source.
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-6 py-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                  active
                    ? "bg-brand-primary text-white"
                    : "bg-brand-bg text-brand-text-secondary hover:bg-brand-seafoam/30",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "cv" && <CvUploadTab />}
          {tab === "linkedin" && <LinkedInTab />}
          {tab === "text" && <PasteTextTab />}
          {tab === "manual" && <ManualTab />}
          {tab === "csv" && <CsvTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <a className="flex items-center gap-1 text-xs text-brand-primary hover:underline cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            Need help importing?
          </a>
          <Button variant="ghost" onClick={() => onOpenChange(false)} size="sm">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Shared ----------
function ProjectLink() {
  return (
    <div className="mt-4">
      <Label className="text-[13px] text-brand-text-secondary mb-1.5">
        Link to project (optional)
      </Label>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a project..." />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DedupWarning() {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        Potential duplicate found
      </div>
      <p className="mt-1 text-xs text-amber-800">Matched on: LinkedIn URL</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <DedupCard label="Importing" name="Rina Wijaya" />
        <DedupCard label="Existing" name="Rina Wijaya" existing />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline">Import as new</Button>
        <Button size="sm" variant="outline">Merge with existing</Button>
        <Button size="sm" variant="ghost">Skip</Button>
      </div>
    </div>
  );
}

function DedupCard({ label, name, existing }: { label: string; name: string; existing?: boolean }) {
  return (
    <div className="rounded-md border border-amber-200 bg-card p-3 text-xs">
      <p className="font-medium text-brand-text-secondary uppercase tracking-wide text-[10px] mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-brand-text">{name}</p>
      <p className="text-brand-text-secondary">CFO, PT Telkom Indonesia</p>
      <p className="text-brand-text-secondary">
        {existing ? "rina.wijaya@telkom.co.id" : "rina@telkom.co.id"}
      </p>
      <p className="mt-1 text-brand-text-secondary">
        Source: {existing ? "LinkedIn" : "CV Upload"}
      </p>
      <p className="text-brand-text-secondary">
        Added: {existing ? "2 weeks ago" : "Just now"}
      </p>
    </div>
  );
}

// ---------- Tab 1: CV Upload ----------
type FileStatus = "ready" | "invalid" | "parsing" | "parsed";

interface QueuedFile {
  name: string;
  size: string;
  ext: string;
  status: FileStatus;
}

const initialFiles: QueuedFile[] = [
  { name: "Rina_Wijaya_CV_2026.pdf", size: "2.4 MB", ext: "pdf", status: "ready" },
  { name: "Budi_Santoso_Resume.docx", size: "1.1 MB", ext: "docx", status: "ready" },
  { name: "James_Chen_CV.pdf", size: "3.2 MB", ext: "pdf", status: "ready" },
  { name: "corrupt_file.xyz", size: "800 KB", ext: "xyz", status: "invalid" },
];

function CvUploadTab() {
  const [files, setFiles] = useState<QueuedFile[]>(initialFiles);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = files.filter((f) => f.status !== "invalid").length;

  const ALLOWED_EXT = ["pdf", "docx", "txt"];

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const queued: QueuedFile[] = arr.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const sizeMb = file.size / (1024 * 1024);
      const size =
        sizeMb >= 1
          ? `${sizeMb.toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      return {
        name: file.name,
        size,
        ext,
        status: ALLOWED_EXT.includes(ext) ? "ready" : "invalid",
      };
    });
    setFiles((prev) => [...prev, ...queued]);
  };

  const handleUpload = async () => {
    setProcessing(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "invalid") continue;
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "parsing" } : f)),
      );
      await new Promise((r) => setTimeout(r, 1500));
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "parsed" } : f)),
      );
    }
    setProcessing(false);
    setDone(true);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
          dragOver
            ? "border-brand-primary bg-brand-mint/10"
            : "border-gray-300 bg-brand-bg/50",
        )}
      >
        <Upload
          className={cn(
            "h-8 w-8",
            dragOver ? "text-brand-primary" : "text-brand-text-secondary",
          )}
        />
        <p className="mt-2 text-sm font-medium text-brand-text">
          Drag and drop CV files here
        </p>
        <p className="text-xs text-brand-text-secondary">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          Browse files
        </button>
        <p className="mt-1 text-xs text-brand-text-secondary">
          PDF, DOCX, or TXT · Max 50 files · 10MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          {done && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-status-success/10 px-3 py-2 text-sm text-status-success">
              <CheckCircle className="h-4 w-4" />
              {validCount} candidates imported successfully
              <a className="ml-auto text-xs font-medium hover:underline cursor-pointer">
                View candidates →
              </a>
            </div>
          )}
          {processing && (
            <p className="mb-2 text-xs text-brand-text-secondary">
              Processing {files.filter((f) => f.status === "parsed").length} of {validCount} files...
            </p>
          )}
          <div className="rounded-lg border border-gray-100">
            {files.map((f, i) => (
              <FileRow
                key={`${f.name}-${i}`}
                file={f}
                onRemove={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        </div>
      )}

      <ProjectLink />

      <Button
        className="mt-4 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={validCount === 0 || processing || done}
        onClick={handleUpload}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Upload & parse ${validCount} files`
        )}
      </Button>
    </div>
  );
}

function FileRow({ file, onRemove }: { file: QueuedFile; onRemove: () => void }) {
  const Icon = file.ext === "docx" ? FileType : FileText;
  const iconBg =
    file.ext === "pdf"
      ? "bg-status-info/15 text-status-info"
      : file.ext === "docx"
        ? "bg-status-ai/15 text-status-ai"
        : "bg-muted text-brand-text-secondary";

  return (
    <div className="group flex h-11 items-center gap-3 border-b border-gray-50 px-3 last:border-0">
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", iconBg)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-brand-text">{file.name}</p>
      </div>
      <span className="text-xs text-brand-text-secondary">{file.size}</span>
      <StatusPill status={file.status} />
      <button
        onClick={onRemove}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5 text-brand-text-secondary hover:text-brand-text" />
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: FileStatus }) {
  if (status === "ready")
    return (
      <span className="flex items-center gap-1 text-xs text-status-success">
        <CheckCircle className="h-3.5 w-3.5" />
        Ready
      </span>
    );
  if (status === "invalid")
    return (
      <span className="flex items-center gap-1 text-xs text-status-danger">
        <XCircle className="h-3.5 w-3.5" />
        Invalid
      </span>
    );
  if (status === "parsing")
    return (
      <span className="flex items-center gap-1 text-xs text-status-warning">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Parsing...
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-status-success">
      <CheckCircle className="h-3.5 w-3.5" />
      Parsed
    </span>
  );
}

// ---------- Tab 2: LinkedIn ----------
function LinkedInTab() {
  const [urls, setUrls] = useState(
    "https://linkedin.com/in/rina-wijaya-cfo\nhttps://linkedin.com/in/budi-santoso-finance",
  );
  const lines = useMemo(() => urls.split("\n").filter((l) => l.trim()), [urls]);
  const validRegex = /linkedin\.com\/in\//;
  const valid = lines.filter((l) => validRegex.test(l));

  return (
    <div>
      <Label className="text-[13px] text-brand-text-secondary mb-1.5">
        LinkedIn profile URLs
      </Label>
      <Textarea
        rows={4}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"Paste LinkedIn profile URLs, one per line...\n\nhttps://linkedin.com/in/example-profile"}
        className="font-mono text-sm"
      />
      <p className="mt-1.5 text-xs text-brand-text-secondary">
        Paste up to 10 URLs. Each profile costs ~$0.01 via Proxycurl enrichment.
      </p>

      {lines.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg border border-gray-100 p-2">
          {lines.map((line, i) => {
            const ok = validRegex.test(line);
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                {ok ? (
                  <CheckCircle className="h-3.5 w-3.5 text-status-success" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-status-danger" />
                )}
                <span className="font-mono text-brand-text truncate">{line}</span>
                {!ok && (
                  <span className="text-status-danger">Not a valid LinkedIn URL</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DedupWarning />
      <ProjectLink />

      <Button
        className="mt-4 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={valid.length === 0}
        onClick={() => toast.success(`Enriching ${valid.length} profiles...`)}
      >
        Enrich & import {valid.length} profiles
      </Button>
    </div>
  );
}

// ---------- Tab 3: Paste Text ----------
const sampleResume = `RINA WIJAYA
Chief Financial Officer

Contact: rina.wijaya@telkom.co.id | +62 812 3456 7890
Location: Jakarta, Indonesia
LinkedIn: linkedin.com/in/rina-wijaya-cfo

PROFESSIONAL SUMMARY
Seasoned CFO with 18 years of experience in corporate finance, treasury, and
strategic planning across Indonesia's telecommunications sector...

EXPERIENCE
Chief Financial Officer — PT Telkom Indonesia (2020 – Present)
• Leading 45-person finance team managing $2.1B revenue
• Oversaw $340M bond issuance in 2022`;

function PasteTextTab() {
  const [text, setText] = useState(sampleResume);
  const [state, setState] = useState<"idle" | "parsing" | "done">("idle");

  const handleParse = async () => {
    setState("parsing");
    await new Promise((r) => setTimeout(r, 2000));
    setState("done");
  };

  return (
    <div>
      <Label className="text-[13px] text-brand-text-secondary mb-1.5">Resume text</Label>
      <Textarea
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the candidate's resume or CV text here..."
        className="font-mono text-xs"
      />
      <p className="mt-1.5 text-xs text-brand-text-secondary">
        Works best with structured resume text. AI will extract name, skills, experience, and more.
      </p>

      {state === "done" && (
        <div className="mt-4 rounded-lg border border-status-success/30 bg-status-success/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-status-success">
            <CheckCircle className="h-4 w-4" />
            Candidate parsed: Rina Wijaya, CFO at PT Telkom Indonesia · 18 fields extracted
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-brand-text-secondary">
            <div><span className="text-brand-text font-medium">Name:</span> Rina Wijaya</div>
            <div><span className="text-brand-text font-medium">Title:</span> CFO</div>
            <div><span className="text-brand-text font-medium">Company:</span> PT Telkom Indonesia</div>
            <div><span className="text-brand-text font-medium">Location:</span> Jakarta</div>
            <div><span className="text-brand-text font-medium">Skills:</span> 9 detected</div>
            <div><span className="text-brand-text font-medium">Experience:</span> 18 years</div>
          </div>
          <a className="mt-3 inline-block text-xs font-medium text-brand-primary hover:underline cursor-pointer">
            Edit before saving →
          </a>
        </div>
      )}

      <ProjectLink />

      <Button
        className="mt-4 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={!text.trim() || state !== "idle"}
        onClick={handleParse}
      >
        {state === "parsing" ? (
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
  );
}

// ---------- Tab 4: Manual Entry ----------
function ManualTab() {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  return (
    <div className="space-y-2">
      <SectionLabel>Basic information</SectionLabel>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rina Wijaya" />
        </Field>
        <Field label="Email"><Input type="email" placeholder="rina@example.com" /></Field>
        <Field label="Phone"><Input type="tel" placeholder="+62 812 3456 7890" /></Field>
        <Field label="WhatsApp">
          <Input type="tel" placeholder="Same as phone if applicable" />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-brand-text-secondary">
            <Checkbox /> Same as phone number
          </label>
        </Field>
        <Field label="LinkedIn URL"><Input type="url" placeholder="https://linkedin.com/in/..." /></Field>
        <Field label="Location"><Input placeholder="Jakarta, Indonesia" /></Field>
      </div>

      <SectionLabel>Professional details</SectionLabel>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current title"><Input placeholder="e.g., Chief Financial Officer" /></Field>
        <Field label="Current company"><Input placeholder="e.g., PT Telkom Indonesia" /></Field>
        <Field label="Seniority level">
          <Select>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {["C-Suite", "VP", "Director", "Manager", "Senior", "Mid", "Junior"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Total experience"><Input type="number" placeholder="Years of experience" /></Field>
      </div>
      <Field label="Skills">
        <div className="flex flex-wrap gap-1.5 rounded-md border border-input p-2 min-h-[40px]">
          {skills.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-brand-seafoam/40 px-2 py-0.5 text-xs text-brand-primary">
              {s}
              <button onClick={() => setSkills(skills.filter((x) => x !== s))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type and press Enter..."
            className="flex-1 bg-transparent text-sm outline-none min-w-[120px]"
          />
        </div>
      </Field>

      <SectionLabel>Additional</SectionLabel>
      <Field label="Summary"><Textarea rows={3} placeholder="Brief professional summary..." /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Salary expectation"><Input placeholder="e.g., $200K–$250K USD" /></Field>
        <Field label="Notice period">
          <Select>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {["Immediate", "1 month", "2 months", "3 months", "6 months", "Not specified"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-brand-text">
        <Checkbox /> Willing to relocate
      </label>
      <Field label="Source notes"><Input placeholder="How did you find this candidate?" /></Field>

      <SectionLabel>Attachments</SectionLabel>
      <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-brand-bg/50 p-3 text-sm">
        <Upload className="h-5 w-5 text-brand-text-secondary" />
        <span className="text-brand-text-secondary">Attach a CV file (optional) — PDF, DOCX</span>
        <button className="ml-auto text-xs font-medium text-brand-primary hover:underline">Browse</button>
      </div>

      <ProjectLink />

      <Button
        className="mt-4 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={!name.trim()}
        onClick={() => toast.success("Candidate added")}
      >
        Add candidate
      </Button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-6 mb-3 text-[12px] font-medium uppercase tracking-wide text-brand-text-secondary">
      {children}
    </h4>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[13px] text-brand-text-secondary mb-1.5 block">
        {label} {required && <span className="text-status-danger">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ---------- Tab 5: CSV Import ----------
const platformFields = [
  "Full name",
  "Email",
  "Phone",
  "WhatsApp",
  "LinkedIn URL",
  "Location",
  "Current title",
  "Current company",
  "Seniority level",
  "Total experience",
  "Skills",
  "Summary",
  "Source notes",
  "— Skip column —",
];

const csvColumns = [
  { csv: "Name", mapped: "Full name", auto: true },
  { csv: "Title", mapped: "Current title", auto: true },
  { csv: "Company", mapped: "Current company", auto: true },
  { csv: "Email Address", mapped: "Email", auto: true },
  { csv: "Phone", mapped: "Phone", auto: true },
  { csv: "City", mapped: "Location", auto: true },
  { csv: "Years Exp", mapped: "Total experience", auto: true },
  { csv: "Notes", mapped: "— Skip column —", auto: false },
];

const previewRows = [
  { name: "Rina Wijaya", title: "CFO", company: "PT Telkom", email: "rina@telkom.co.id", location: "Jakarta" },
  { name: "Budi Santoso", title: "VP Finance", company: "Astra International", email: "budi@astra.co.id", location: "Jakarta" },
  { name: "James Chen", title: "Finance Director", company: "Wilmar", email: "james@wilmar.com", location: "Singapore" },
];

function CsvTab() {
  const [step, setStep] = useState<1 | 2>(1);

  if (step === 1) {
    return (
      <div>
        <div className="flex h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-brand-bg/50">
          <FileSpreadsheet className="h-8 w-8 text-brand-text-secondary" />
          <p className="mt-2 text-sm font-medium text-brand-text">Upload a CSV or TSV file</p>
          <button
            onClick={() => setStep(2)}
            className="mt-1 text-sm font-medium text-brand-primary hover:underline"
          >
            Browse files
          </button>
          <p className="mt-1 text-xs text-brand-text-secondary">
            Max 500 rows · .csv or .tsv format
          </p>
        </div>
        <div className="mt-3 text-center">
          <a className="text-xs text-brand-primary hover:underline cursor-pointer">
            Download template
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-brand-text">Map CSV columns to platform fields</h4>
      <div className="rounded-lg border border-gray-100">
        {csvColumns.map((c) => (
          <div key={c.csv} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-0">
            <span className="font-mono text-sm bg-brand-bg px-2 py-1 rounded text-brand-text min-w-[140px]">
              {c.csv}
            </span>
            <ArrowRight className="h-4 w-4 text-brand-text-secondary" />
            <div className="flex items-center gap-1.5 flex-1">
              <Select defaultValue={c.mapped}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformFields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {c.auto && (
                <span title="AI-mapped">
                  <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <h4 className="mt-5 mb-2 text-sm font-medium text-brand-text">Preview (first 3 rows)</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-xs">
          <thead className="bg-brand-bg text-brand-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Full name</th>
              <th className="px-3 py-2 text-left font-medium">Current title</th>
              <th className="px-3 py-2 text-left font-medium">Company</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewRows.map((r) => (
              <tr key={r.name}>
                <td className="px-3 py-2 text-brand-text">{r.name}</td>
                <td className="px-3 py-2 text-brand-text-secondary">{r.title}</td>
                <td className="px-3 py-2 text-brand-text-secondary">{r.company}</td>
                <td className="px-3 py-2 text-brand-text-secondary">{r.email}</td>
                <td className="px-3 py-2 text-brand-text-secondary">{r.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-brand-text-secondary">
        47 candidates will be imported. 3 rows skipped (missing required fields).
      </p>

      <ProjectLink />

      <Button
        className="mt-4 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        onClick={() => toast.success("Importing 47 candidates...")}
      >
        Import 47 candidates
      </Button>
    </div>
  );
}
