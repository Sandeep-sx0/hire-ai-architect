import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Building,
  Award,
  Clock,
  Briefcase,
  Users,
  Globe,
  Calendar,
  ChevronRight,
  MessageCircle,
  Upload,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PUBLIC_JOBS, postedLabel, type PublicJob } from "@/lib/public-jobs";

interface JobDetail extends PublicJob {
  reportsTo: string;
  department: string;
  languages: string;
  workModelDetail: string;
  about: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  offers: string[];
  requiredSkills: string[];
  postedDateLabel: string;
}

const DEFAULT_JOB_ID = "cfo-indorama";

const CFO_DETAIL: JobDetail = {
  ...PUBLIC_JOBS.find((j) => j.id === DEFAULT_JOB_ID)!,
  reportsTo: "Chief Executive Officer",
  department: "Finance & Accounting",
  languages: "English, Bahasa Indonesia",
  workModelDetail: "Hybrid (3 days office)",
  postedDateLabel: "March 14, 2026",
  about:
    "Indorama Ventures Public Company Limited is one of the world's leading petrochemical companies, with operations across 35 countries. The Indonesia operations span 4 business units covering polyester, fibers, packaging, and specialty chemicals, employing over 6,000 people across 12 manufacturing sites.",
  overview:
    "We are seeking an experienced Chief Financial Officer to lead the financial strategy and operations for our Indonesia business. The CFO will be a key member of the Indonesia leadership team, reporting directly to the CEO and presenting quarterly to the Group Board of Directors in Bangkok.",
  responsibilities: [
    "Lead the finance function across 4 business units with a team of 50+ professionals",
    "Oversee financial planning, budgeting, forecasting, and variance analysis",
    "Drive M&A evaluation and post-merger integration for regional acquisitions",
    "Ensure compliance with IFRS, Indonesian tax regulations, and OJK requirements",
    "Present quarterly financial reports to the Board of Directors",
    "Manage banking relationships and optimize working capital across 12 entities",
    "Partner with the CEO on the 5-year strategic growth plan for Indonesia operations",
  ],
  requirements: [
    "15–20 years of progressive finance experience in multinational environments",
    "At least 5 years in a CFO or Group Finance Director role",
    "MBA or professional accounting qualification (CPA, CA, ACCA)",
    "Strong experience with IFRS/GAAP, M&A transactions, and treasury management",
    "Track record of managing large finance teams (30+ people)",
    "Experience in manufacturing, petrochemicals, or heavy industry preferred",
    "Fluent English required; Bahasa Indonesia is a strong advantage",
  ],
  offers: [
    "Competitive base salary",
    "Annual performance bonus of 20–30%",
    "Company car and driver",
    "Comprehensive health insurance for family",
    "Annual flight allowance for home country travel",
    "Relocation support if applicable",
  ],
  requiredSkills: [
    "Financial Planning",
    "IFRS",
    "M&A",
    "Treasury Management",
    "Board Reporting",
    "Team Leadership",
  ],
};

function getJob(id: string): JobDetail {
  if (id === DEFAULT_JOB_ID) return CFO_DETAIL;
  const base = PUBLIC_JOBS.find((j) => j.id === id);
  if (!base) {
    // For prototype, fall back to CFO detail with overridden surface fields
    return { ...CFO_DETAIL };
  }
  return {
    ...CFO_DETAIL,
    ...base,
    department: CFO_DETAIL.department,
    reportsTo: CFO_DETAIL.reportsTo,
    languages: CFO_DETAIL.languages,
    workModelDetail: base.workModel,
    requiredSkills: base.skills,
  };
}

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => {
    const job = getJob(params.id);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData, params }) => {
    const job = loaderData?.job ?? CFO_DETAIL;
    const title = `${job.title} — ${job.company} | HireSmart`;
    const description = `${job.title} at ${job.company} (${job.location}). ${job.experience}. Apply confidentially through HireSmart.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/jobs/${params.id}` },
      ],
      links: [{ rel: "canonical", href: `/jobs/${params.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job.title,
            description,
            hiringOrganization: { "@type": "Organization", name: job.company },
            jobLocation: { "@type": "Place", address: job.location },
            employmentType: "FULL_TIME",
            datePosted: job.datePosted,
          }),
        },
      ],
    };
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const { job } = Route.useLoaderData() as { job: JobDetail };
  const formRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const formEl = formRef.current;
      if (!formEl) return;
      const formTop = formEl.getBoundingClientRect().top;
      // show bar after user scrolls past hero (~280px), hide when form visible
      setShowStickyBar(window.scrollY > 280 && formTop > window.innerHeight - 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-[13px]">
          <Link to="/jobs" className="text-brand-primary hover:underline">
            Open positions
          </Link>
          <ChevronRight className="h-3 w-3 text-brand-text-secondary" />
          <span className="truncate text-brand-text-secondary">{job.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {/* LEFT: description */}
          <div className="md:col-span-2">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-brand-text">
                {job.title}
              </h1>
              <p className="mt-1 text-base font-medium text-brand-primary">{job.company}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-brand-text-secondary">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Building className="h-3.5 w-3.5" />{job.workModel}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5" />{job.seniority}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.experience.replace(" experience", "")}</span>
              </div>
              <p className="mt-2 text-xs text-brand-text-secondary">{postedLabel(job.postedDaysAgo)}</p>
            </header>

            <Section title={`About ${job.company}`}>
              <p>{job.about}</p>
            </Section>

            <Section title="Role overview">
              <p>{job.overview}</p>
            </Section>

            <Section title="Key responsibilities">
              <ol className="space-y-2 pl-6">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="relative pl-2 text-[15px] leading-relaxed text-brand-text">
                    <span className="absolute -left-6 top-0 w-6 text-right text-brand-text-secondary">
                      {i + 1}.
                    </span>
                    {r}
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Requirements">
              <ul className="list-disc space-y-2 pl-5 marker:text-brand-primary">
                {job.requirements.map((r, i) => (
                  <li key={i} className="text-[15px] leading-relaxed text-brand-text">{r}</li>
                ))}
              </ul>
            </Section>

            <Section title="What we offer">
              <ul className="list-disc space-y-2 pl-5 marker:text-brand-primary">
                {job.offers.map((r, i) => (
                  <li key={i} className="text-[15px] leading-relaxed text-brand-text">{r}</li>
                ))}
              </ul>
            </Section>

            {/* Agency attribution */}
            <div className="mt-8 space-y-2 border-t border-gray-100 pt-6 text-[13px] text-brand-text-secondary">
              <p>
                This opportunity is managed by{" "}
                <span className="text-brand-primary"><span className="font-normal">Hire</span><span className="font-semibold">Smart</span></span>
                .
              </p>
              <p>All applications are treated with strict confidentiality.</p>
              <p>
                Questions?{" "}
                <a
                  href="https://wa.me/628194421035"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-primary hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contact us on WhatsApp
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <aside className="md:col-span-1">
            <div className="space-y-4 md:sticky md:top-20">
              <KeyDetailsCard job={job} />

              <div>
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-brand-text-secondary">
                  Required skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-seafoam/30 px-2.5 py-1 text-xs text-brand-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div ref={formRef}>
                <ApplyCard job={job} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] transition-transform duration-200 md:hidden",
          showStickyBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <Button
          onClick={scrollToForm}
          className="h-full w-full rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
        >
          Apply for this role
        </Button>
      </div>
    </PublicLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-[18px] font-semibold text-brand-text">{title}</h2>
      <div className="text-[15px] leading-relaxed text-brand-text">{children}</div>
    </section>
  );
}

function KeyDetailsCard({ job }: { job: JobDetail }) {
  const rows: Array<{ label: string; value: string; Icon: typeof MapPin }> = [
    { label: "Location", value: job.location, Icon: MapPin },
    { label: "Work model", value: job.workModelDetail, Icon: Building },
    { label: "Seniority", value: job.seniority, Icon: Award },
    { label: "Experience", value: job.experience.replace(" experience", ""), Icon: Clock },
    { label: "Department", value: job.department, Icon: Briefcase },
    { label: "Reports to", value: job.reportsTo, Icon: Users },
    { label: "Languages", value: job.languages, Icon: Globe },
    { label: "Posted", value: job.postedDateLabel, Icon: Calendar },
  ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={cn(
            "flex items-start gap-3 py-2.5",
            i < rows.length - 1 && "border-b border-gray-50",
          )}
        >
          <r.Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-text-secondary" />
          <span className="w-[88px] shrink-0 text-xs text-brand-text-secondary">{r.label}</span>
          <span className="flex-1 text-[13px] text-brand-text">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  cv: File | null;
  coverNote: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  linkedin?: string;
  cv?: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  cv: null,
  coverNote: "",
};

function ApplyCard({ job }: { job: JobDetail }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateField = (key: keyof FormState, value: string | File | null): string | undefined => {
    if (key === "name") {
      if (!value || typeof value !== "string" || value.trim().length < 2) return "Please enter your full name";
    }
    if (key === "email") {
      if (!value || typeof value !== "string") return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
    }
    if (key === "linkedin" && typeof value === "string" && value.trim()) {
      if (!value.toLowerCase().includes("linkedin.com")) return "Must be a LinkedIn URL";
    }
    if (key === "cv") {
      if (!(value instanceof File)) return "Please upload your CV";
      const ok = /\.(pdf|docx)$/i.test(value.name);
      if (!ok) return "PDF or DOCX only";
      if (value.size > 10 * 1024 * 1024) return "Max file size is 10MB";
    }
    return undefined;
  };

  const handleBlur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const err = validateField(key, form[key] as never);
    setErrors((e) => ({ ...e, [key]: err }));
  };

  const setFile = (file: File | null) => {
    setForm((f) => ({ ...f, cv: file }));
    setTouched((t) => ({ ...t, cv: true }));
    setErrors((e) => ({ ...e, cv: validateField("cv", file) }));
  };

  const canSubmit = useMemo(() => {
    return (
      !validateField("name", form.name) &&
      !validateField("email", form.email) &&
      !validateField("cv", form.cv) &&
      !validateField("linkedin", form.linkedin) &&
      status !== "submitting"
    );
  }, [form, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      linkedin: validateField("linkedin", form.linkedin),
      cv: validateField("cv", form.cv),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, linkedin: true, cv: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <SuccessCard job={job} email={form.email} />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-brand-primary/20 bg-white">
      <div className="h-1 w-full bg-brand-primary" />
      <form onSubmit={handleSubmit} className="p-5">
        <div className="mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-base font-semibold text-brand-text">Apply for this position</h3>
          <p className="mt-0.5 text-xs text-brand-text-secondary">All fields marked * are required</p>
        </div>

        <div className="space-y-4">
          <Field
            id="name"
            label="Full name"
            required
            error={touched.name ? errors.name : undefined}
          >
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={() => handleBlur("name")}
              placeholder="Your full name"
              disabled={status === "submitting"}
              maxLength={120}
              className={cn(touched.name && errors.name && "border-red-400")}
            />
          </Field>

          <Field
            id="email"
            label="Email"
            required
            error={touched.email ? errors.email : undefined}
          >
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              onBlur={() => handleBlur("email")}
              placeholder="your.email@example.com"
              disabled={status === "submitting"}
              maxLength={200}
              className={cn(touched.email && errors.email && "border-red-400")}
            />
          </Field>

          <Field id="phone" label="Phone">
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+62 812 3456 7890"
              disabled={status === "submitting"}
              maxLength={30}
            />
          </Field>

          <Field
            id="linkedin"
            label="LinkedIn URL"
            error={touched.linkedin ? errors.linkedin : undefined}
          >
            <Input
              id="linkedin"
              type="url"
              value={form.linkedin}
              onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
              onBlur={() => handleBlur("linkedin")}
              placeholder="https://linkedin.com/in/your-profile"
              disabled={status === "submitting"}
              maxLength={200}
              className={cn(touched.linkedin && errors.linkedin && "border-red-400")}
            />
          </Field>

          <Field
            id="cv"
            label="Upload CV"
            required
            error={touched.cv ? errors.cv : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {form.cv ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-brand-seafoam/10 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-brand-text">{form.cv.name}</p>
                  <p className="text-[11px] text-brand-text-secondary">
                    {(form.cv.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-brand-text-secondary hover:bg-white hover:text-brand-text"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setFile(f);
                }}
                className={cn(
                  "flex h-20 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition",
                  isDragOver
                    ? "border-brand-primary bg-brand-seafoam/20"
                    : "border-gray-300 hover:border-brand-primary/50 hover:bg-gray-50",
                )}
              >
                <div className="flex items-center gap-2 text-[13px] text-brand-text">
                  <Upload className="h-4 w-4 text-brand-text-secondary" />
                  Drop your CV here or browse
                </div>
                <p className="mt-0.5 text-[11px] text-brand-text-secondary">PDF or DOCX, max 10MB</p>
              </button>
            )}
          </Field>

          <Field id="coverNote" label="Cover note">
            <Textarea
              id="coverNote"
              value={form.coverNote}
              onChange={(e) => setForm((f) => ({ ...f, coverNote: e.target.value }))}
              rows={4}
              placeholder="Tell us why you're interested in this role... (optional)"
              disabled={status === "submitting"}
              maxLength={2000}
            />
          </Field>
        </div>

        {status === "error" && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Something went wrong. Please try again or contact us on WhatsApp.
          </div>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 h-12 w-full rounded-xl bg-brand-primary text-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit application"
          )}
        </Button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-brand-text-secondary">
          <Lock className="h-3 w-3" />
          Your information is treated with strict confidentiality.
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-[13px] text-brand-text-secondary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SuccessCard({ job, email }: { job: JobDetail; email: string }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-brand-primary/20 bg-white">
      <div className="h-1 w-full bg-brand-primary" />
      <div className="flex flex-col items-center px-5 py-8 text-center animate-in fade-in duration-300">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" strokeWidth={2} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-brand-text">Application submitted</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Thank you for your interest in the <strong className="font-medium text-brand-text">{job.title}</strong> role at {job.company}.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">
          We've sent a confirmation email to{" "}
          <span className="font-medium text-brand-text">{email}</span> with a link to track your application status.
        </p>

        <div className="mt-6 w-full space-y-2">
          <Link
            to="/jobs/track/$token"
            params={{ token: "demo" }}
            className="block w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-medium text-white hover:bg-brand-primary/90"
          >
            Track your application →
          </Link>
          <Link
            to="/jobs"
            className="block w-full rounded-xl border border-brand-primary px-4 py-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/5"
          >
            Browse more positions
          </Link>
        </div>

        <p className="mt-5 text-xs text-brand-text-secondary">
          Or contact us on WhatsApp:{" "}
          <a
            href="https://wa.me/628194421035"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-primary hover:underline"
          >
            +62 819 4421 0355
          </a>
        </p>
      </div>
    </div>
  );
}
