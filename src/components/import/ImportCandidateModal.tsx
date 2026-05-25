import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  ChevronRight,
  ClipboardPaste,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  FileUp,
  HelpCircle,
  Inbox,
  Linkedin,
  Loader2,
  PenTool,
  PlugZap,
  Save,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { jobs as allJobs, projects as allProjects, clients as allClients } from "@/lib/mock-data";
import {
  CandidateReviewForm,
  blankCandidate,
  SourceChip,
  type ParsedCandidate,
} from "./CandidateReviewForm";
import {
  DuplicateDetectionDialog,
  type DuplicateMatch,
  type DedupAction,
} from "./DuplicateDetectionDialog";

type TabId =
  | "cv"
  | "linkedin"
  | "text"
  | "manual"
  | "csv"
  | "extension"
  | "inbound";

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cv", label: "Upload CV", icon: FileUp },
  { id: "linkedin", label: "LinkedIn URL", icon: Linkedin },
  { id: "text", label: "Paste text", icon: ClipboardPaste },
  { id: "manual", label: "Manual", icon: PenTool },
  { id: "csv", label: "CSV import", icon: FileSpreadsheet },
  { id: "extension", label: "Chrome extension", icon: PlugZap },
  { id: "inbound", label: "Inbound", icon: Inbox },
];

const STAGE_OPTIONS = [
  "applied",
  "screening",
  "shortlisted",
  "submitted_to_client",
  "interview",
] as const;

const openJobs = allJobs.filter((j) => j.status === "open" || j.status === "interviewing").slice(0, 8);

// ---------- Shared link-to-job ----------
export interface LinkToJob {
  jobId?: string;
  stage?: string;
}

function LinkToJobPanel({
  value,
  onChange,
}: {
  value: LinkToJob;
  onChange: (v: LinkToJob) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-brand-bg/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="h-3.5 w-3.5 text-brand-primary" />
        <Label className="text-[12px] font-medium text-brand-text">
          Link to a job (optional)
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={value.jobId}
          onValueChange={(v) => onChange({ ...value, jobId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="No job — add to database only" />
          </SelectTrigger>
          <SelectContent>
            {openJobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.title} — {j.clientName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.stage}
          onValueChange={(v) => onChange({ ...value, stage: v })}
          disabled={!value.jobId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Starting stage…" />
          </SelectTrigger>
          <SelectContent>
            {STAGE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ---------- Modal shell ----------
export interface ImportCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCandidateModal({ open, onOpenChange }: ImportCandidateModalProps) {
  const [tab, setTab] = useState<TabId>("cv");

  // Reset tab when modal closes/reopens
  useEffect(() => {
    if (!open) setTab("cv");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1040px] w-[1040px] p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col sm:max-w-[1040px] [&>button]:top-5 [&>button]:right-5">
        <DialogHeader className="border-b border-gray-100 px-6 py-4 space-y-0">
          <DialogTitle className="text-[18px] font-semibold text-brand-text">
            Add Candidate
          </DialogTitle>
          <DialogDescription className="text-[13px] text-brand-text-secondary">
            Seven ways to bring a candidate into your database. Every AI extraction is reviewable
            before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-6 py-3">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-card">
          {tab === "cv" && <CvUploadTab onDone={() => onOpenChange(false)} />}
          {tab === "linkedin" && <LinkedInTab onDone={() => onOpenChange(false)} />}
          {tab === "text" && <PasteTextTab onDone={() => onOpenChange(false)} />}
          {tab === "manual" && <ManualTab onDone={() => onOpenChange(false)} />}
          {tab === "csv" && <CsvTab onDone={() => onOpenChange(false)} />}
          {tab === "extension" && <ExtensionTab />}
          {tab === "inbound" && <InboundTab />}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 bg-brand-bg/30">
          <a className="flex items-center gap-1 text-xs text-brand-primary hover:underline cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            Importing tips & best practices
          </a>
          <Button variant="ghost" onClick={() => onOpenChange(false)} size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================
// Tab 1 — Upload CV (with bulk review)
// ===========================================================
type FileStatus = "ready" | "invalid" | "parsing" | "parsed" | "failed";

interface QueuedFile {
  id: string;
  name: string;
  size: string;
  ext: string;
  status: FileStatus;
  candidate?: ParsedCandidate;
  duplicateRule?: "linkedin" | "email" | "fuzzy_name_company";
}

const seedFiles: QueuedFile[] = [
  { id: "f1", name: "Rina_Wijaya_CV_2026.pdf", size: "2.4 MB", ext: "pdf", status: "ready" },
  { id: "f2", name: "Budi_Santoso_Resume.docx", size: "1.1 MB", ext: "docx", status: "ready" },
  { id: "f3", name: "James_Chen_CV.pdf", size: "3.2 MB", ext: "pdf", status: "ready" },
  { id: "f4", name: "corrupt_file.xyz", size: "800 KB", ext: "xyz", status: "invalid" },
];

const mockParsedByName: Record<string, ParsedCandidate> = {
  Rina_Wijaya_CV_2026: {
    ...blankCandidate(),
    full_name: "Rina Wijaya",
    email: "rina.wijaya@telkom.co.id",
    phone: "+62 812 3456 7890",
    whatsapp: "+62 812 3456 7890",
    linkedin_url: "https://linkedin.com/in/rina-wijaya-cfo",
    current_title: "Chief Financial Officer",
    current_company: "PT Telkom Indonesia",
    location: "Jakarta, Indonesia",
    summary:
      "Seasoned CFO with 18 years of experience in corporate finance, treasury and strategic planning across Indonesia's telecommunications sector.",
    skills: ["Treasury", "M&A", "IFRS", "Bond Issuance", "FP&A", "Investor Relations", "Strategic Planning", "Risk", "Compliance"],
    total_experience_years: 18,
    seniority_level: "C-Suite",
    education: [
      { degree: "MBA, Finance", school: "INSEAD", year: "2008" },
      { degree: "BSc Accounting", school: "Universitas Indonesia", year: "2003" },
    ],
    work_history: [
      { title: "CFO", company: "PT Telkom Indonesia", period: "2020 – Present" },
      { title: "VP Finance", company: "Indosat Ooredoo", period: "2015 – 2020" },
      { title: "Finance Director", company: "XL Axiata", period: "2010 – 2015" },
    ],
    certifications: ["CFA", "CPA Indonesia"],
    languages: ["English (fluent)", "Bahasa (native)", "Mandarin (conversational)"],
    salary_expectation: "$220K – $260K USD",
    notice_period: "3 months",
    willing_to_relocate: false,
    source: "CV Upload",
    ai_extracted: true,
  },
  Budi_Santoso_Resume: {
    ...blankCandidate(),
    full_name: "Budi Santoso",
    email: "budi.santoso@astra.co.id",
    phone: "+62 811 9876 5432",
    linkedin_url: "https://linkedin.com/in/budi-santoso-finance",
    current_title: "VP Finance",
    current_company: "Astra International",
    location: "Jakarta, Indonesia",
    summary:
      "Strategic finance leader with deep experience scaling controllership across Southeast Asia conglomerates.",
    skills: ["Controllership", "Tax", "SAP", "Audit", "FP&A", "M&A"],
    total_experience_years: 14,
    seniority_level: "VP",
    education: [{ degree: "BSc Finance", school: "Universitas Gadjah Mada", year: "2008" }],
    work_history: [
      { title: "VP Finance", company: "Astra International", period: "2021 – Present" },
      { title: "Senior Finance Manager", company: "Unilever Indonesia", period: "2015 – 2021" },
    ],
    certifications: ["CPA"],
    languages: ["English (fluent)", "Bahasa (native)"],
    salary_expectation: "$150K – $180K USD",
    notice_period: "2 months",
    willing_to_relocate: true,
    source: "CV Upload",
    ai_extracted: true,
  },
  James_Chen_CV: {
    ...blankCandidate(),
    full_name: "James Chen",
    email: "james.chen@wilmar.com",
    phone: "+65 9123 4567",
    linkedin_url: "https://linkedin.com/in/james-chen-finance",
    current_title: "Finance Director",
    current_company: "Wilmar International",
    location: "Singapore",
    summary: "Regional finance director covering APAC commodities with a focus on hedging strategy.",
    skills: ["Commodities", "Hedging", "Treasury", "FX", "Risk Management"],
    total_experience_years: 16,
    seniority_level: "Director",
    education: [{ degree: "MBA", school: "NUS Business School", year: "2012" }],
    work_history: [
      { title: "Finance Director", company: "Wilmar International", period: "2019 – Present" },
      { title: "Senior Finance Manager", company: "Olam International", period: "2013 – 2019" },
    ],
    certifications: ["FRM"],
    languages: ["English (native)", "Mandarin (fluent)"],
    salary_expectation: "S$ 280K – 320K",
    notice_period: "3 months",
    willing_to_relocate: true,
    source: "CV Upload",
    ai_extracted: true,
  },
};

function parsedFor(name: string): ParsedCandidate {
  const key = name.replace(/\.(pdf|docx|txt)$/i, "");
  return mockParsedByName[key] ?? {
    ...blankCandidate(),
    full_name: key.replace(/_/g, " "),
    summary: "Resume parsed but limited structured data extracted. Review and complete manually.",
    source: "CV Upload",
    ai_extracted: true,
  };
}

function CvUploadTab({ onDone }: { onDone: () => void }) {
  const [files, setFiles] = useState<QueuedFile[]>(seedFiles);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<"queue" | "parsing" | "review">("queue");
  const [progress, setProgress] = useState(0);
  const [linkJob, setLinkJob] = useState<LinkToJob>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [dup, setDup] = useState<DuplicateMatch | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED = ["pdf", "docx", "txt"];
  const valid = files.filter((f) => f.status !== "invalid");

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const queued: QueuedFile[] = arr.map((file, i) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const sizeMb = file.size / (1024 * 1024);
      const size =
        sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      return {
        id: `u-${Date.now()}-${i}`,
        name: file.name,
        size,
        ext,
        status: ALLOWED.includes(ext) ? "ready" : "invalid",
      };
    });
    setFiles((prev) => [...prev, ...queued]);
  };

  const handleParse = async () => {
    setPhase("parsing");
    setProgress(0);
    const target = files.filter((f) => f.status === "ready");
    for (let i = 0; i < target.length; i++) {
      const t = target[i];
      setFiles((prev) => prev.map((f) => (f.id === t.id ? { ...f, status: "parsing" } : f)));
      await new Promise((r) => setTimeout(r, 700));
      const candidate = parsedFor(t.name);
      const dupRule =
        candidate.linkedin_url.includes("rina-wijaya") ? "linkedin" : undefined;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === t.id
            ? { ...f, status: "parsed", candidate, duplicateRule: dupRule }
            : f,
        ),
      );
      setProgress(Math.round(((i + 1) / target.length) * 100));
    }
    setPhase("review");
  };

  const updateCandidate = (idx: number, next: ParsedCandidate) =>
    setFiles((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, candidate: next } : f)),
    );

  const parsed = files.filter((f) => f.status === "parsed");

  const handleConfirm = () => {
    const active = parsed[activeIdx];
    if (active?.duplicateRule) {
      setDup({
        rule: active.duplicateRule,
        confidence: 0.96,
        existing: {
          ...blankCandidate(),
          id: "c1",
          added: "2 weeks ago",
          full_name: "Rina Wijaya",
          email: "rina@telkom.co.id",
          phone: "+62 812 3456 0000",
          linkedin_url: "https://linkedin.com/in/rina-wijaya-cfo",
          current_title: "CFO",
          current_company: "PT Telkom Indonesia",
          location: "Jakarta",
          seniority_level: "C-Suite",
          total_experience_years: 17,
          source: "LinkedIn",
        },
        incoming: active.candidate!,
      });
      return;
    }
    finalize();
  };

  const finalize = () => {
    const count = parsed.length;
    toast.success(
      `${count} ${count === 1 ? "candidate" : "candidates"} added${linkJob.jobId ? " and linked to job" : ""}`,
      { description: count === 1 ? "Open the candidate or match to a job." : undefined },
    );
    onDone();
  };

  // ---- Phases ----
  if (phase === "review" && parsed.length > 0) {
    const active = parsed[activeIdx];
    return (
      <>
        <ReviewHeader
          title={`Review ${parsed.length} ${parsed.length === 1 ? "candidate" : "candidates"}`}
          subtitle="AI extracted these fields from the uploaded CVs. Edit, then confirm."
          onBack={() => setPhase("queue")}
        />
        <div className="grid grid-cols-[280px_1fr] gap-5 mt-5">
          {/* List of parsed candidates */}
          <div className="space-y-1">
            {parsed.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 transition",
                  i === activeIdx
                    ? "border-brand-primary bg-brand-seafoam/20"
                    : "border-gray-100 hover:bg-brand-bg/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-brand-text truncate">
                    {p.candidate?.full_name || p.name}
                  </p>
                  {p.duplicateRule && (
                    <span title="Possible duplicate">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-brand-text-secondary truncate">
                  {p.candidate?.current_title} · {p.candidate?.current_company}
                </p>
                <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{p.name}</p>
              </button>
            ))}
          </div>

          {/* Split review pane */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-4 min-w-0">
            <CvPreviewPane file={active} />
            <div className="min-w-0">
              {active.duplicateRule && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs text-amber-900">
                    <span className="font-medium">Possible duplicate</span> — matched on{" "}
                    {active.duplicateRule === "linkedin"
                      ? "LinkedIn URL"
                      : active.duplicateRule === "email"
                        ? "email"
                        : "name + company"}
                    .
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleConfirm()}
                  >
                    Resolve
                  </Button>
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <SourceChip source={active.candidate?.source} />
                <Badge variant="outline" className="text-[11px]">
                  <Sparkles className="h-3 w-3 mr-1 text-status-ai" />
                  AI extracted · review every field
                </Badge>
              </div>
              <CandidateReviewForm
                value={active.candidate!}
                aiFilled
                onChange={(c) => updateCandidate(files.indexOf(active), c)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <LinkToJobPanel value={linkJob} onChange={setLinkJob} />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setPhase("queue")}>
              Back
            </Button>
            <Button
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={handleConfirm}
            >
              <Save className="h-4 w-4" />
              Confirm & add {parsed.length}
            </Button>
          </div>
        </div>

        <DuplicateDetectionDialog
          open={!!dup}
          match={dup}
          onOpenChange={(o) => !o && setDup(null)}
          onResolve={(a: DedupAction) => {
            setDup(null);
            if (a === "skip") return;
            finalize();
          }}
        />
      </>
    );
  }

  if (phase === "parsing") {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint/30">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
        <p className="mt-4 text-sm font-medium text-brand-text">
          Parsing {valid.length} {valid.length === 1 ? "CV" : "CVs"} with AI…
        </p>
        <p className="text-xs text-brand-text-secondary mt-1">
          Extracting name, contact, experience, skills, education, and more.
        </p>
        <div className="mx-auto mt-5 h-1.5 w-[320px] overflow-hidden rounded-full bg-brand-bg">
          <div
            className="h-full bg-brand-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-brand-text-secondary">{progress}%</p>
      </div>
    );
  }

  // queue phase
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
          "flex h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
          dragOver
            ? "border-brand-primary bg-brand-mint/10"
            : "border-gray-300 bg-brand-bg/50",
        )}
      >
        <Upload
          className={cn(
            "h-9 w-9",
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
        <p className="mt-1.5 text-[11px] text-brand-text-secondary">
          PDF, DOCX, or TXT · Single or bulk up to 50 files · 10 MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
              {valid.length} of {files.length} files ready
            </p>
            <button
              onClick={() => setFiles([])}
              className="text-[11px] text-brand-text-secondary hover:text-status-danger"
            >
              Clear all
            </button>
          </div>
          <div className="rounded-lg border border-gray-100 max-h-[180px] overflow-y-auto">
            {files.map((f) => (
              <FileRow
                key={f.id}
                file={f}
                onRemove={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
              />
            ))}
          </div>
        </div>
      )}

      <Button
        className="mt-5 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={valid.length === 0}
        onClick={handleParse}
      >
        <Sparkles className="h-4 w-4" />
        Parse {valid.length} {valid.length === 1 ? "CV" : "CVs"} with AI
      </Button>
    </div>
  );
}

function CvPreviewPane({ file }: { file: QueuedFile }) {
  const Icon = file.ext === "docx" ? FileType : FileText;
  return (
    <div className="rounded-lg border border-gray-100 bg-brand-bg/40 min-h-[480px] flex flex-col">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 bg-card rounded-t-lg">
        <Icon className="h-3.5 w-3.5 text-brand-text-secondary" />
        <p className="text-[12px] font-medium text-brand-text truncate">{file.name}</p>
        <span className="text-[10px] text-brand-text-secondary ml-auto">{file.size}</span>
      </div>
      <div className="flex-1 p-4 text-[11px] leading-relaxed text-brand-text-secondary font-mono overflow-y-auto whitespace-pre-wrap">
        {file.candidate?.full_name?.toUpperCase()}
        {"\n"}
        {file.candidate?.current_title}
        {"\n\n"}
        Contact: {file.candidate?.email} · {file.candidate?.phone}
        {"\n"}
        LinkedIn: {file.candidate?.linkedin_url}
        {"\n"}
        Location: {file.candidate?.location}
        {"\n\n"}
        PROFESSIONAL SUMMARY{"\n"}
        {file.candidate?.summary}
        {"\n\n"}
        EXPERIENCE{"\n"}
        {file.candidate?.work_history
          .map((w) => `• ${w.title} — ${w.company} (${w.period})`)
          .join("\n")}
        {"\n\n"}
        EDUCATION{"\n"}
        {file.candidate?.education
          .map((e) => `• ${e.degree}, ${e.school}${e.year ? ` (${e.year})` : ""}`)
          .join("\n")}
        {"\n\n"}
        SKILLS{"\n"}
        {file.candidate?.skills.join(" · ")}
      </div>
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
  const map: Record<FileStatus, { icon: typeof CheckCircle; text: string; tone: string }> = {
    ready: { icon: CheckCircle, text: "Ready", tone: "text-status-success" },
    invalid: { icon: XCircle, text: "Invalid", tone: "text-status-danger" },
    parsing: { icon: Loader2, text: "Parsing…", tone: "text-status-warning" },
    parsed: { icon: CheckCircle, text: "Parsed", tone: "text-status-success" },
    failed: { icon: XCircle, text: "Failed", tone: "text-status-danger" },
  };
  const c = map[status];
  const Icon = c.icon;
  return (
    <span className={cn("flex items-center gap-1 text-xs", c.tone)}>
      <Icon className={cn("h-3.5 w-3.5", status === "parsing" && "animate-spin")} />
      {c.text}
    </span>
  );
}

function ReviewHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-brand-text-secondary hover:text-brand-primary mb-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <h3 className="text-[15px] font-semibold text-brand-text">{title}</h3>
        <p className="text-[12px] text-brand-text-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

// ===========================================================
// Tab 2 — LinkedIn URL (with enriched review)
// ===========================================================
function LinkedInTab({ onDone }: { onDone: () => void }) {
  const [urls, setUrls] = useState(
    "https://linkedin.com/in/rina-wijaya-cfo\nhttps://linkedin.com/in/budi-santoso-finance",
  );
  const [phase, setPhase] = useState<"input" | "enriching" | "review" | "error">("input");
  const [enriched, setEnriched] = useState<ParsedCandidate[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [linkJob, setLinkJob] = useState<LinkToJob>({});
  const [dup, setDup] = useState<DuplicateMatch | null>(null);
  const validRegex = /linkedin\.com\/in\//;

  const lines = useMemo(() => urls.split("\n").map((l) => l.trim()).filter(Boolean), [urls]);
  const valid = lines.filter((l) => validRegex.test(l));

  const handleEnrich = async () => {
    setPhase("enriching");
    await new Promise((r) => setTimeout(r, 1500));
    const out: ParsedCandidate[] = valid.map((u) => {
      if (u.includes("rina-wijaya")) {
        return { ...mockParsedByName.Rina_Wijaya_CV_2026, source: "LinkedIn", linkedin_url: u };
      }
      if (u.includes("budi-santoso")) {
        return { ...mockParsedByName.Budi_Santoso_Resume, source: "LinkedIn", linkedin_url: u };
      }
      return {
        ...blankCandidate(),
        linkedin_url: u,
        full_name: "LinkedIn profile",
        source: "LinkedIn",
        ai_extracted: true,
      };
    });
    setEnriched(out);
    setPhase("review");
  };

  if (phase === "review") {
    const active = enriched[activeIdx];
    return (
      <>
        <ReviewHeader
          title={`Review ${enriched.length} enriched ${enriched.length === 1 ? "profile" : "profiles"}`}
          subtitle="Enriched via Proxycurl. Verify every field before saving."
          onBack={() => setPhase("input")}
        />
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-status-info/10 px-2.5 py-1 text-[11px] text-status-info">
          <Sparkles className="h-3 w-3" />
          Enriched via Proxycurl · ~$0.01 per profile
        </div>
        <div className="grid grid-cols-[260px_1fr] gap-5 mt-5">
          <div className="space-y-1">
            {enriched.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5",
                  i === activeIdx
                    ? "border-brand-primary bg-brand-seafoam/20"
                    : "border-gray-100 hover:bg-brand-bg/60",
                )}
              >
                <p className="text-sm font-medium text-brand-text truncate">
                  {c.full_name || "Unnamed"}
                </p>
                <p className="text-[11px] text-brand-text-secondary truncate">
                  {c.current_title} · {c.current_company}
                </p>
                <p className="text-[10px] text-brand-primary truncate mt-0.5 font-mono">
                  {c.linkedin_url.replace("https://", "")}
                </p>
              </button>
            ))}
          </div>
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <SourceChip source="LinkedIn" />
              <Badge variant="outline" className="text-[11px]">
                <Sparkles className="h-3 w-3 mr-1 text-status-ai" />
                AI enriched · review every field
              </Badge>
            </div>
            <CandidateReviewForm
              value={active}
              aiFilled
              onChange={(c) =>
                setEnriched((prev) => prev.map((x, i) => (i === activeIdx ? c : x)))
              }
            />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <LinkToJobPanel value={linkJob} onChange={setLinkJob} />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setPhase("input")}>
              Back
            </Button>
            <Button
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => {
                const a = enriched[activeIdx];
                if (a.linkedin_url.includes("rina-wijaya")) {
                  setDup({
                    rule: "linkedin",
                    confidence: 1,
                    existing: {
                      ...blankCandidate(),
                      id: "c1",
                      added: "2 weeks ago",
                      full_name: "Rina Wijaya",
                      email: "rina@telkom.co.id",
                      linkedin_url: a.linkedin_url,
                      current_title: "CFO",
                      current_company: "PT Telkom Indonesia",
                      location: "Jakarta",
                      seniority_level: "C-Suite",
                      source: "CV Upload",
                    },
                    incoming: a,
                  });
                  return;
                }
                toast.success(`${enriched.length} candidates enriched and added`);
                onDone();
              }}
            >
              <Save className="h-4 w-4" />
              Confirm & add {enriched.length}
            </Button>
          </div>
        </div>
        <DuplicateDetectionDialog
          open={!!dup}
          match={dup}
          onOpenChange={(o) => !o && setDup(null)}
          onResolve={() => {
            setDup(null);
            toast.success("Resolved — candidates added");
            onDone();
          }}
        />
      </>
    );
  }

  if (phase === "enriching") {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint/30">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
        <p className="mt-4 text-sm font-medium text-brand-text">
          Enriching {valid.length} profiles via Proxycurl…
        </p>
        <p className="text-xs text-brand-text-secondary mt-1">
          Fetching headline, experience, education, skills, and contact info.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-[13px] text-brand-text-secondary mb-1.5">
        LinkedIn profile URLs (one per line)
      </Label>
      <Textarea
        rows={5}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"https://linkedin.com/in/example-profile"}
        className="font-mono text-sm"
      />
      <p className="mt-1.5 text-xs text-brand-text-secondary">
        Paste up to 10 URLs. Each profile is enriched via Proxycurl (~$0.01 per profile).
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
                {!ok && <span className="text-status-danger">Not a valid LinkedIn URL</span>}
              </div>
            );
          })}
        </div>
      )}

      <Button
        className="mt-5 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={valid.length === 0}
        onClick={handleEnrich}
      >
        <Sparkles className="h-4 w-4" />
        Enrich {valid.length} {valid.length === 1 ? "profile" : "profiles"}
      </Button>
    </div>
  );
}

// ===========================================================
// Tab 3 — Paste Text
// ===========================================================
const sampleResume = `RINA WIJAYA
Chief Financial Officer

Contact: rina.wijaya@telkom.co.id | +62 812 3456 7890
Location: Jakarta, Indonesia
LinkedIn: linkedin.com/in/rina-wijaya-cfo

PROFESSIONAL SUMMARY
Seasoned CFO with 18 years of experience in corporate finance, treasury,
and strategic planning across Indonesia's telecommunications sector.

EXPERIENCE
Chief Financial Officer — PT Telkom Indonesia (2020 – Present)
• Leading 45-person finance team managing $2.1B revenue
• Oversaw $340M bond issuance in 2022`;

function PasteTextTab({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState(sampleResume);
  const [phase, setPhase] = useState<"input" | "parsing" | "review">("input");
  const [candidate, setCandidate] = useState<ParsedCandidate>(blankCandidate());
  const [linkJob, setLinkJob] = useState<LinkToJob>({});

  const handleParse = async () => {
    setPhase("parsing");
    await new Promise((r) => setTimeout(r, 1600));
    setCandidate({
      ...mockParsedByName.Rina_Wijaya_CV_2026,
      source: "Paste",
    });
    setPhase("review");
  };

  if (phase === "review") {
    return (
      <>
        <ReviewHeader
          title="Review extracted candidate"
          subtitle="AI parsed the pasted text. Verify every field before saving."
          onBack={() => setPhase("input")}
        />
        <div className="mt-4 mb-3 flex items-center gap-2">
          <SourceChip source="Paste" />
          <Badge variant="outline" className="text-[11px]">
            <Sparkles className="h-3 w-3 mr-1 text-status-ai" />
            18 fields extracted
          </Badge>
        </div>
        <CandidateReviewForm value={candidate} aiFilled onChange={setCandidate} />
        <div className="mt-5 space-y-3">
          <LinkToJobPanel value={linkJob} onChange={setLinkJob} />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setPhase("input")}>
              Back
            </Button>
            <Button
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => {
                toast.success(`${candidate.full_name || "Candidate"} added`, {
                  description: "View candidate · Match to a job",
                });
                onDone();
              }}
            >
              <Save className="h-4 w-4" />
              Confirm & add
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "parsing") {
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-primary" />
        <p className="mt-3 text-sm font-medium text-brand-text">Parsing resume text with AI…</p>
        <p className="text-xs text-brand-text-secondary mt-1">
          Identifying contact, experience, skills, education, and preferences.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-[13px] text-brand-text-secondary mb-1.5">Resume text</Label>
      <Textarea
        rows={12}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the candidate's resume or CV text here…"
        className="font-mono text-xs"
      />
      <p className="mt-1.5 text-xs text-brand-text-secondary">
        Works best with structured resume text. AI will extract every supported field.
      </p>
      <Button
        className="mt-5 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
        disabled={!text.trim()}
        onClick={handleParse}
      >
        <Sparkles className="h-4 w-4" />
        Parse with AI
      </Button>
    </div>
  );
}

// ===========================================================
// Tab 4 — Manual (direct review form, no AI)
// ===========================================================
function ManualTab({ onDone }: { onDone: () => void }) {
  const [candidate, setCandidate] = useState<ParsedCandidate>({
    ...blankCandidate(),
    source: "Manual",
  });
  const [linkJob, setLinkJob] = useState<LinkToJob>({});

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <SourceChip source="Manual" />
        <Badge variant="outline" className="text-[11px]">
          Direct entry · no AI extraction
        </Badge>
      </div>
      <CandidateReviewForm value={candidate} onChange={setCandidate} />
      <div className="mt-5 space-y-3">
        <LinkToJobPanel value={linkJob} onChange={setLinkJob} />
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onDone()}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
            disabled={!candidate.full_name.trim()}
            onClick={() => {
              toast.success(`${candidate.full_name} added`, {
                description: "View candidate · Match to a job",
              });
              onDone();
            }}
          >
            <Save className="h-4 w-4" />
            Add candidate
          </Button>
        </div>
      </div>
    </>
  );
}

// ===========================================================
// Tab 5 — CSV (upload → map → results)
// ===========================================================
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
  { csv: "WhatsApp number", mapped: "WhatsApp", auto: true },
  { csv: "City", mapped: "Location", auto: true },
  { csv: "Years Exp", mapped: "Total experience", auto: true },
  { csv: "Notes", mapped: "— Skip column —", auto: false },
];

const previewRows = [
  { name: "Rina Wijaya", title: "CFO", company: "PT Telkom", email: "rina@telkom.co.id", location: "Jakarta" },
  { name: "Budi Santoso", title: "VP Finance", company: "Astra International", email: "budi@astra.co.id", location: "Jakarta" },
  { name: "James Chen", title: "Finance Director", company: "Wilmar", email: "james@wilmar.com", location: "Singapore" },
];

function CsvTab({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"upload" | "map" | "importing" | "results">("upload");
  const [progress, setProgress] = useState(0);
  const [linkJob, setLinkJob] = useState<LinkToJob>({});

  const startImport = async () => {
    setStep("importing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(i);
    }
    setStep("results");
  };

  if (step === "upload") {
    return (
      <div>
        <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-brand-bg/50">
          <FileSpreadsheet className="h-8 w-8 text-brand-text-secondary" />
          <p className="mt-2 text-sm font-medium text-brand-text">Upload a CSV or TSV file</p>
          <button
            onClick={() => setStep("map")}
            className="mt-1 text-sm font-medium text-brand-primary hover:underline"
          >
            Browse files
          </button>
          <p className="mt-1 text-xs text-brand-text-secondary">
            Max 500 rows · .csv or .tsv format
          </p>
        </div>
        <div className="mt-3 flex justify-center">
          <button className="flex items-center gap-1 text-xs text-brand-primary hover:underline">
            <Download className="h-3 w-3" />
            Download Norvex CSV template
          </button>
        </div>
      </div>
    );
  }

  if (step === "map") {
    return (
      <div>
        <ReviewHeader
          title="Map CSV columns to platform fields"
          subtitle="AI auto-mapped the obvious columns. Adjust any that look wrong, then preview."
          onBack={() => setStep("upload")}
        />

        <div className="mt-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-4 border-b border-gray-100 bg-brand-bg px-4 py-2 text-[11px] uppercase tracking-wide text-brand-text-secondary">
            <span className="min-w-[160px]">CSV column</span>
            <span className="w-4" />
            <span className="flex-1">Platform field</span>
            <span>Sample</span>
          </div>
          {csvColumns.map((c, i) => (
            <div
              key={c.csv}
              className="flex items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-0"
            >
              <span className="font-mono text-sm bg-brand-bg px-2 py-1 rounded text-brand-text min-w-[160px]">
                {c.csv}
              </span>
              <ArrowRight className="h-4 w-4 text-brand-text-secondary" />
              <div className="flex items-center gap-1.5 flex-1">
                <Select defaultValue={c.mapped}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformFields.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {c.auto && (
                  <span
                    title="AI-mapped"
                    className="inline-flex items-center gap-1 text-[10px] text-status-ai"
                  >
                    <Sparkles className="h-3 w-3" />
                    Auto
                  </span>
                )}
              </div>
              <span className="text-[11px] text-brand-text-secondary font-mono truncate max-w-[160px]">
                {i < previewRows.length
                  ? Object.values(previewRows[i])[0] ?? ""
                  : "—"}
              </span>
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
          47 candidates will be imported · 3 rows skipped (missing required fields) · 5 potential
          duplicates flagged for review.
        </p>

        <div className="mt-4 space-y-3">
          <LinkToJobPanel value={linkJob} onChange={setLinkJob} />
          <Button
            className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
            onClick={startImport}
          >
            Import 47 candidates
          </Button>
        </div>
      </div>
    );
  }

  if (step === "importing") {
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-primary" />
        <p className="mt-3 text-sm font-medium text-brand-text">Importing 47 candidates…</p>
        <div className="mx-auto mt-4 h-1.5 w-[320px] overflow-hidden rounded-full bg-brand-bg">
          <div
            className="h-full bg-brand-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // results
  return (
    <div>
      <div className="rounded-lg border border-status-success/30 bg-status-success/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-status-success">
          <CheckCircle className="h-4 w-4" />
          CSV import complete
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <SummaryStat label="Created" value="42" tone="success" />
          <SummaryStat label="Duplicates flagged" value="5" tone="warning" />
          <SummaryStat label="Errors" value="3" tone="danger" />
        </div>
      </div>

      <h4 className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary">
        Rows that need attention
      </h4>
      <div className="rounded-lg border border-gray-100 divide-y divide-gray-50">
        {[
          { row: 12, name: "Rina Wijaya", reason: "Possible duplicate — LinkedIn URL match", tone: "warning" as const },
          { row: 18, name: "Sarah Lee", reason: "Possible duplicate — email match", tone: "warning" as const },
          { row: 23, name: "(blank)", reason: "Missing required field: Full name", tone: "danger" as const },
          { row: 27, name: "Andi P.", reason: "Possible duplicate — fuzzy name + company match", tone: "warning" as const },
          { row: 34, name: "(blank)", reason: "Missing required field: Email", tone: "danger" as const },
        ].map((r) => (
          <div key={r.row} className="flex items-center gap-3 px-4 py-2 text-xs">
            <span className="font-mono text-brand-text-secondary w-12">Row {r.row}</span>
            <span className="text-brand-text font-medium w-32 truncate">{r.name}</span>
            <span
              className={cn(
                "flex items-center gap-1 flex-1",
                r.tone === "warning" ? "text-amber-700" : "text-status-danger",
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {r.reason}
            </span>
            <button className="text-brand-primary hover:underline">Review</button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => setStep("upload")}>
          Import another file
        </Button>
        <Button
          className="bg-brand-primary text-white hover:bg-brand-primary/90"
          onClick={() => {
            toast.success("42 candidates added", {
              description: "5 duplicates and 3 errors are queued for review.",
            });
            onDone();
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-status-success"
      : tone === "warning"
        ? "text-amber-700"
        : "text-status-danger";
  return (
    <div className="rounded-md border border-gray-100 bg-card px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary">{label}</p>
      <p className={cn("text-xl font-semibold mt-0.5", toneClass)}>{value}</p>
    </div>
  );
}

// ===========================================================
// Tab 6 — Chrome Extension
// ===========================================================
function ExtensionTab() {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <div>
        <Badge className="bg-brand-mint/30 text-brand-primary border-brand-mint hover:bg-brand-mint/30">
          One-click sourcing
        </Badge>
        <h3 className="mt-3 text-[17px] font-semibold text-brand-text">
          Save LinkedIn profiles directly from your browser
        </h3>
        <p className="mt-2 text-[13px] text-brand-text-secondary leading-relaxed">
          The Norvex Chrome extension adds a floating <span className="font-medium text-brand-text">Save to Norvex</span> button
          to every LinkedIn profile page. One click captures the profile, enriches it via Proxycurl, runs a
          duplicate check, and lands it in your candidate database — all without leaving LinkedIn.
        </p>

        <ul className="mt-4 space-y-2 text-[13px] text-brand-text">
          {[
            "Works on LinkedIn profile, search results, and Sales Navigator",
            "Auto-extracts headline, experience, education, contact info",
            "Real-time duplicate detection before saving",
            "Optional: link to an open job and pipeline stage from the extension popover",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-status-success mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-2">
          <Button className="bg-brand-primary text-white hover:bg-brand-primary/90">
            <PlugZap className="h-4 w-4" />
            Install Chrome extension
          </Button>
          <Button variant="outline">
            View install guide
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-brand-text-secondary">
          Compatible with Chrome 110+, Edge, Brave, and Arc.
        </p>
      </div>

      {/* Mock preview */}
      <div className="rounded-xl border border-gray-100 bg-brand-bg/50 p-4">
        <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-2">
          In-page preview
        </p>
        <div className="rounded-lg border border-gray-200 bg-card overflow-hidden">
          <div className="bg-[#0a66c2] text-white text-[10px] px-3 py-1.5 font-medium">
            LinkedIn · linkedin.com/in/rina-wijaya-cfo
          </div>
          <div className="p-3 relative">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-brand-mint/40 flex items-center justify-center text-brand-primary font-semibold text-sm">
                RW
              </div>
              <div>
                <p className="text-[12px] font-semibold text-brand-text">Rina Wijaya</p>
                <p className="text-[10px] text-brand-text-secondary">
                  CFO at PT Telkom Indonesia
                </p>
              </div>
            </div>
            {/* Floating extension button */}
            <button className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-[10px] font-medium text-white shadow-lg shadow-brand-primary/30">
              <Sparkles className="h-3 w-3" />
              Save to Norvex
            </button>
          </div>
        </div>

        {/* Toast preview */}
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-status-success/30 bg-card px-3 py-2 shadow-sm">
          <CheckCircle className="h-4 w-4 text-status-success mt-0.5" />
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-brand-text">Saved to Norvex</p>
            <p className="text-[10px] text-brand-text-secondary">
              Rina Wijaya · CFO · enriched, no duplicates found.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// Tab 7 — Inbound
// ===========================================================
const inboundApplicants = [
  {
    name: "Andre Halim",
    role: "VP Finance",
    job: "VP Finance — OYO Hotels",
    via: "candidate portal",
    when: "12 min ago",
  },
  {
    name: "Maria Pangestu",
    role: "Head of Strategy",
    job: "Head of Strategy — Astra International",
    via: "norvexsolutions.com contact form",
    when: "1 hour ago",
  },
  {
    name: "Kenji Tanaka",
    role: "CTO",
    job: "CTO — Tokopedia",
    via: "candidate portal",
    when: "3 hours ago",
  },
  {
    name: "Sari Indriani",
    role: "CFO",
    job: "CFO — Indorama Ventures",
    via: "candidate portal",
    when: "yesterday",
  },
];

function InboundTab() {
  return (
    <div className="grid grid-cols-[1fr_380px] gap-6">
      <div>
        <Badge className="bg-status-info/15 text-status-info border-status-info/30 hover:bg-status-info/15">
          Always-on intake
        </Badge>
        <h3 className="mt-3 text-[17px] font-semibold text-brand-text">
          Candidates apply themselves
        </h3>
        <p className="mt-2 text-[13px] text-brand-text-secondary leading-relaxed">
          Candidates can come to you directly through two always-on channels — both feed straight
          into this database, pre-tagged with their source and the job they applied to.
        </p>

        <div className="mt-4 space-y-3">
          <SourceCard
            title="Candidate portal"
            url="jobs.norvexsolutions.com"
            desc="A white-labelled job board where candidates browse open roles and apply with a resume + structured profile. Each application is automatically linked to the originating job and lands in stage Applied."
          />
          <SourceCard
            title="Website contact form"
            url="norvexsolutions.com"
            desc="The public contact form on the marketing site routes candidate-style enquiries here. Inbound assistants triage these to the right job (or save as unsolicited)."
          />
        </div>

        <p className="mt-4 text-[11px] text-brand-text-secondary">
          Both channels run a duplicate check on submission and tag the candidate with the source.
          Read-only here — this tab is a reference panel.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
            Recent inbound applicants
          </p>
          <Badge variant="outline" className="text-[10px]">
            Live
          </Badge>
        </div>
        <div className="space-y-1.5">
          {inboundApplicants.map((a) => (
            <div
              key={a.name}
              className="flex items-start gap-2 rounded-lg p-2 hover:bg-brand-bg/60 transition"
            >
              <div className="h-8 w-8 rounded-full bg-brand-seafoam/40 flex items-center justify-center text-[11px] font-semibold text-brand-primary">
                {a.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-brand-text truncate">{a.name}</p>
                  <span className="text-[10px] text-brand-text-secondary shrink-0">{a.when}</span>
                </div>
                <p className="text-[11px] text-brand-text-secondary truncate">{a.role}</p>
                <p className="text-[10px] text-brand-primary truncate mt-0.5">→ {a.job}</p>
                <p className="text-[10px] text-brand-text-secondary truncate italic">via {a.via}</p>
              </div>
              <button className="text-[11px] text-brand-primary hover:underline shrink-0 mt-1">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceCard({ title, url, desc }: { title: string; url: string; desc: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-semibold text-brand-text">{title}</p>
        <span className="text-[11px] text-brand-primary font-mono">{url}</span>
      </div>
      <p className="text-[12px] text-brand-text-secondary mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
