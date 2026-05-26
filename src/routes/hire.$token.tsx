import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  Plus,
  MessageCircle,
  Users,
  Calendar,
  Check,
  Lock,
  Mail,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hire/$token")({
  head: () => ({
    meta: [
      { title: "Employer Portal — Syndie Recruit" },
      {
        name: "description",
        content:
          "Submit new hiring briefs and track the status of your active executive searches with Syndie Recruit.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EmployerPortal,
});

// ───────────────────────── Data ─────────────────────────

type ClientRecord = {
  token: string;
  name: string;
  whatsapp: string;
  emailContact: string;
};

const CLIENTS: Record<string, ClientRecord> = {
  "indorama-portal-2026": {
    token: "indorama-portal-2026",
    name: "Indorama Ventures",
    whatsapp: "https://wa.me/628194421035",
    emailContact: "hello@syndierecruit.com",
  },
  demo: {
    token: "demo",
    name: "Indorama Ventures",
    whatsapp: "https://wa.me/628194421035",
    emailContact: "hello@syndierecruit.com",
  },
};

const STAGES = ["Received", "Sourcing", "Shortlisted", "Interview", "Placement"] as const;
type Stage = (typeof STAGES)[number];

type ProjectStatus = {
  id: string;
  title: string;
  submitted: string;
  currentStage: Stage;
  shortlistLabel: string;
  lastUpdated: string;
  note?: string;
  completed?: "placed" | "closed";
  completedDate?: string;
};

const ACTIVE_PROJECTS: ProjectStatus[] = [
  {
    id: "p1",
    title: "Chief Financial Officer",
    submitted: "March 12, 2026",
    currentStage: "Shortlisted",
    shortlistLabel: "5 candidates",
    lastUpdated: "2 days ago",
    note: "We've identified a strong shortlist of 5 candidates with CFO experience in manufacturing and petrochemical sectors. Preparing candidate briefs for your review.",
  },
  {
    id: "p2",
    title: "VP Operations — Southeast Asia",
    submitted: "February 28, 2026",
    currentStage: "Sourcing",
    shortlistLabel: "12 candidates being evaluated",
    lastUpdated: "1 week ago",
    note: "Sourcing is in full swing across Indonesia, Thailand, and Malaysia. Initial pool of 12 candidates is being evaluated against your criteria.",
  },
  {
    id: "p3",
    title: "Plant Manager — Cikarang",
    submitted: "March 5, 2026",
    currentStage: "Interview",
    shortlistLabel: "2 candidates in final round",
    lastUpdated: "Yesterday",
    note: "Two finalists are progressing through the interview process. Reference checks underway.",
  },
];

const PAST_PROJECTS: ProjectStatus[] = [
  {
    id: "pp1",
    title: "Head of Digital Transformation",
    submitted: "August 10, 2025",
    currentStage: "Placement",
    shortlistLabel: "Placed",
    lastUpdated: "Nov 2025",
    completed: "placed",
    completedDate: "November 2025",
  },
  {
    id: "pp2",
    title: "Regional Sales Director",
    submitted: "June 2, 2025",
    currentStage: "Shortlisted",
    shortlistLabel: "Closed without placement",
    lastUpdated: "Sep 2025",
    completed: "closed",
    completedDate: "September 2025",
  },
];

// ───────────────────────── Component ─────────────────────────

function EmployerPortal() {
  const { token } = Route.useParams();
  const client = CLIENTS[token];

  if (!client) {
    return (
      <PublicLayout portalLabel="Employer Portal">
        <InvalidTokenState />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout clientName={client.name} portalLabel="Employer Portal">
      <PortalContent client={client} />
    </PublicLayout>
  );
}

function PortalContent({ client }: { client: ClientRecord }) {
  const formRef = useRef<HTMLDivElement>(null);
  const [pastOpen, setPastOpen] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Welcome */}
      <section className="bg-brand-seafoam/10">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center md:px-6">
          <h1 className="text-[26px] font-semibold leading-tight text-brand-text">
            Welcome, {client.name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-brand-text-secondary">
            Submit new hiring briefs and track your active searches with Syndie Recruit.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Submit a new role
            </button>
            <a
              href={client.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-primary/30 bg-white px-6 py-3 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-seafoam/20 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Contact your recruiter
            </a>
          </div>
        </div>
      </section>

      {/* Active projects */}
      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-[20px] font-semibold text-brand-text">Your active searches</h2>
          <span className="rounded-full bg-brand-seafoam/40 px-2.5 py-0.5 text-[12px] font-medium text-brand-primary">
            {ACTIVE_PROJECTS.length} active
          </span>
        </div>

        <div className="space-y-4">
          {ACTIVE_PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* Past searches */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setPastOpen((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-text"
          >
            {pastOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Past searches ({PAST_PROJECTS.length})
          </button>
          {pastOpen && (
            <div className="mt-4 space-y-4">
              {PAST_PROJECTS.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submission form */}
      <section ref={formRef} className="mx-auto max-w-3xl px-4 pb-16 md:px-6">
        <div className="mb-5">
          <h2 className="text-[20px] font-semibold text-brand-text">Submit a new role</h2>
          <p className="mt-1 text-[14px] text-brand-text-secondary">
            Tell us about the position you need to fill. Our team will review and begin sourcing within 48 hours.
          </p>
        </div>
        <SubmissionForm client={client} />
      </section>
    </div>
  );
}

// ───────────────────────── Project card ─────────────────────────

function ProjectCard({ project }: { project: ProjectStatus }) {
  const [expanded, setExpanded] = useState(false);
  const currentIdx = STAGES.indexOf(project.currentStage);
  const isCompleted = Boolean(project.completed);

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[18px] font-semibold text-brand-text">{project.title}</h3>
          <p className="mt-0.5 text-[13px] text-brand-text-secondary">
            Submitted: {project.submitted}
          </p>
        </div>
        {isCompleted && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium",
              project.completed === "placed"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {project.completed === "placed" ? "Placed ✓" : "Closed"}
            {project.completedDate ? ` · ${project.completedDate}` : ""}
          </span>
        )}
      </header>

      <div className="mt-5">
        <ProgressIndicator currentIdx={isCompleted && project.completed === "placed" ? STAGES.length - 1 : currentIdx} allCompleted={isCompleted && project.completed === "placed"} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-brand-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Shortlist: {project.shortlistLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Last updated: {project.lastUpdated}
        </span>
      </div>

      {project.note && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[13px] font-medium text-brand-primary hover:underline"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
          {expanded && (
            <p className="mt-3 rounded-lg bg-brand-seafoam/15 p-4 text-[13px] leading-relaxed text-brand-text">
              {project.note}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function ProgressIndicator({ currentIdx, allCompleted }: { currentIdx: number; allCompleted: boolean }) {
  return (
    <div>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const isDone = allCompleted || i < currentIdx;
          const isCurrent = !allCompleted && i === currentIdx;
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-3 w-3 items-center justify-center rounded-full md:h-3 md:w-3",
                    isDone && "bg-green-500",
                    isCurrent && "bg-brand-primary ring-4 ring-brand-mint/40",
                    !isDone && !isCurrent && "bg-gray-200",
                  )}
                >
                  {isDone && <Check className="h-2 w-2 text-white" strokeWidth={3.5} />}
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isDone ? "bg-green-500" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex">
        {STAGES.map((stage, i) => {
          const isDone = allCompleted || i < currentIdx;
          const isCurrent = !allCompleted && i === currentIdx;
          return (
            <div key={stage} className="flex flex-1 last:flex-none">
              <span
                className={cn(
                  "-ml-2 mt-0.5 text-[11px] md:text-[12px]",
                  isCurrent && "font-semibold text-brand-text",
                  isDone && !isCurrent && "text-brand-text-secondary",
                  !isDone && !isCurrent && "text-gray-400",
                )}
                style={{ minWidth: 60 }}
              >
                {stage}
              </span>
              {i < STAGES.length - 1 && <div className="flex-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── Submission form ─────────────────────────

type JDMode = "write" | "upload";

function SubmissionForm({ client }: { client: ClientRecord }) {
  const [jdMode, setJdMode] = useState<JDMode>("write");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [workModel, setWorkModel] = useState("On-site");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [urgency, setUrgency] = useState("Standard (8–12 weeks)");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const canSubmit = useMemo(() => {
    const jdOk = jdMode === "write" ? jdText.trim().length > 0 : Boolean(jdFile);
    return (
      title.trim() &&
      seniority &&
      location.trim() &&
      jdOk &&
      name.trim() &&
      /.+@.+\..+/.test(email)
    );
  }, [jdMode, jdText, jdFile, title, seniority, location, name, email]);

  const reset = () => {
    setTitle("");
    setSeniority("");
    setDepartment("");
    setLocation("");
    setWorkModel("On-site");
    setJdText("");
    setJdFile(null);
    setUrgency("Standard (8–12 weeks)");
    setSalary("");
    setNotes("");
    setName("");
    setEmail("");
    setPhone("");
    setJdMode("write");
    setSubmitted(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // Simulate submission (would call createServerFn in production)
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(title.trim());
  };

  if (submitted) {
    return (
      <SuccessState
        title={submitted}
        whatsapp={client.whatsapp}
        emailContact={client.emailContact}
        onReset={reset}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      noValidate
    >
      {/* Role basics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Job title" required className="md:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chief Financial Officer"
            maxLength={120}
            disabled={submitting}
          />
        </Field>

        <Field label="Seniority level" required>
          <Select
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
            disabled={submitting}
          >
            <option value="">Select…</option>
            <option>C-Suite</option>
            <option>VP</option>
            <option>Director</option>
            <option>Manager</option>
            <option>Senior</option>
          </Select>
        </Field>

        <Field label="Department">
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Finance, Operations, Technology"
            maxLength={80}
            disabled={submitting}
          />
        </Field>

        <Field label="Location" required>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Jakarta, Indonesia"
            maxLength={120}
            disabled={submitting}
          />
        </Field>

        <Field label="Work model">
          <Select
            value={workModel}
            onChange={(e) => setWorkModel(e.target.value)}
            disabled={submitting}
          >
            <option>On-site</option>
            <option>Hybrid</option>
            <option>Remote</option>
          </Select>
        </Field>
      </div>

      {/* JD section */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <Field label="Job description" required>
          <div className="mb-3 inline-flex rounded-full bg-gray-100 p-1">
            <PillTab active={jdMode === "write"} onClick={() => setJdMode("write")}>
              Write
            </PillTab>
            <PillTab active={jdMode === "upload"} onClick={() => setJdMode("upload")}>
              Upload file
            </PillTab>
          </div>
          {jdMode === "write" ? (
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={8}
              maxLength={5000}
              disabled={submitting}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="block w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mint/30 disabled:bg-gray-50"
            />
          ) : (
            <FileDrop file={jdFile} onFile={setJdFile} disabled={submitting} />
          )}
        </Field>
      </div>

      {/* Logistics */}
      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 md:grid-cols-2">
        <Field label="Urgency">
          <Select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            disabled={submitting}
          >
            <option>Standard (8–12 weeks)</option>
            <option>Urgent (4–6 weeks)</option>
            <option>Critical (ASAP)</option>
          </Select>
        </Field>

        <Field label="Salary range">
          <Input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g., $180K–$250K USD"
            maxLength={120}
            disabled={submitting}
          />
          <p className="mt-2 inline-flex items-start gap-1.5 text-[12px] text-brand-text-secondary">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            Salary information is kept strictly confidential and is not shared with candidates.
          </p>
        </Field>

        <Field label="Additional notes" className="md:col-span-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={2000}
            disabled={submitting}
            placeholder="Any other details — team size, reporting structure, specific requirements..."
            className="block w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mint/30 disabled:bg-gray-50"
          />
        </Field>
      </div>

      {/* Contact */}
      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 md:grid-cols-2">
        <Field label="Your name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            maxLength={120}
            disabled={submitting}
          />
        </Field>
        <Field label="Your email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@company.com"
            maxLength={160}
            disabled={submitting}
          />
        </Field>
        <Field label="Your phone" className="md:col-span-2">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 ..."
            maxLength={40}
            disabled={submitting}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className={cn(
          "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-base font-medium text-white transition-opacity",
          (!canSubmit || submitting) && "cursor-not-allowed opacity-50",
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit role brief"
        )}
      </button>
    </form>
  );
}

function SuccessState({
  title,
  whatsapp,
  emailContact,
  onReset,
}: {
  title: string;
  whatsapp: string;
  emailContact: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="mt-4 text-[20px] font-semibold text-brand-text">
        Role submitted successfully
      </h3>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-brand-text-secondary">
        <span className="font-medium text-brand-text">{title}</span> has been submitted to
        the Syndie Recruit team. Here's what happens next:
      </p>

      <ol className="mx-auto mt-6 max-w-md space-y-2.5 text-left text-[14px] text-brand-text">
        {[
          "Our team reviews your brief (within 24 hours)",
          "We begin sourcing candidates from our database",
          "AI matching identifies the strongest candidates",
          "You'll receive a shortlist for your review",
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-seafoam/40 text-[12px] font-semibold text-brand-primary">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[13px] text-brand-text-secondary">
        Your dedicated recruiter will be in touch shortly. Questions? Reach us anytime:
      </p>

      <div className="mt-3 flex flex-col items-center justify-center gap-2 text-[13px] sm:flex-row sm:gap-5">
        <a
          href={`mailto:${emailContact}`}
          className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          {emailContact}
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp: +62 819 4421 0355
        </a>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex items-center justify-center rounded-xl border border-brand-primary/30 bg-white px-6 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-seafoam/20"
      >
        Submit another role
      </button>
    </div>
  );
}

// ───────────────────────── Form primitives ─────────────────────────

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[14px] font-medium text-brand-text">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "block h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mint/30 disabled:bg-gray-50",
        props.className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "block h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mint/30 disabled:bg-gray-50",
        props.className,
      )}
    />
  );
}

function PillTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
        active ? "bg-white text-brand-primary shadow-sm" : "text-brand-text-secondary",
      )}
    >
      {children}
    </button>
  );
}

function FileDrop({
  file,
  onFile,
  disabled,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-white px-4 py-8 text-center transition-colors hover:border-brand-primary/40 hover:bg-brand-seafoam/10 disabled:opacity-50"
      >
        {file ? (
          <>
            <FileText className="h-6 w-6 text-brand-primary" />
            <span className="text-sm font-medium text-brand-text">{file.name}</span>
            <span className="text-[12px] text-brand-text-secondary">
              {(file.size / 1024).toFixed(0)} KB · click to replace
            </span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-brand-text-secondary" />
            <span className="text-sm font-medium text-brand-text">
              Upload a job description document
            </span>
            <span className="text-[12px] text-brand-text-secondary">
              PDF or DOCX — our AI will extract the key details automatically
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ───────────────────────── Invalid token ─────────────────────────

function InvalidTokenState() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 md:px-6">
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
        <Lock className="mx-auto h-12 w-12 text-brand-text-secondary" />
        <h1 className="mt-4 text-[20px] font-semibold text-brand-text">
          Portal unavailable
        </h1>
        <p className="mx-auto mt-2 text-[14px] leading-relaxed text-brand-text-secondary">
          This portal link is no longer active. It may have been updated by your recruitment
          partner.
        </p>
        <p className="mt-5 text-[13px] text-brand-text-secondary">
          Please contact Syndie Recruit for a new portal link:
        </p>
        <div className="mt-3 flex flex-col items-center justify-center gap-2 text-[13px] sm:flex-row sm:gap-5">
          <a
            href="mailto:hello@syndierecruit.com"
            className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            hello@syndierecruit.com
          </a>
          <a
            href="https://wa.me/628194421035"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp: +62 819 4421 0355
          </a>
        </div>
      </div>
    </div>
  );
}
