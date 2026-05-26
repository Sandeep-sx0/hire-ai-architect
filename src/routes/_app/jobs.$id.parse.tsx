import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Check,
  Download,
  FileText,
  GripVertical,
  MapPin,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getJob, jobs } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/jobs/$id/parse")({
  head: () => ({ meta: [{ title: "Review JD Parse — Syndie Recruit" }] }),
  component: ParseReview,
});

type Confidence = "high" | "medium" | "low";

const FIELD_CONFIDENCE: Record<string, Confidence> = {
  jobTitle: "high",
  seniority: "high",
  department: "high",
  skillsRequired: "high",
  skillsNice: "high",
  experience: "high",
  education: "high",
  location: "high",
  workModel: "high",
  salary: "medium",
  responsibilities: "high",
  languages: "high",
};

function ParseReview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const job = getJob(id) ?? jobs[0];

  const [jobTitle, setJobTitle] = useState(job.jobTitle);
  const [seniority, setSeniority] = useState(job.seniorityLevel);
  const [department, setDepartment] = useState(job.department);
  const [skillsRequired, setSkillsRequired] = useState<string[]>(job.skillsRequired);
  const [skillsNice, setSkillsNice] = useState<string[]>(job.skillsNiceToHave);
  const [expMin, setExpMin] = useState(job.experienceMin);
  const [expMax, setExpMax] = useState(job.experienceMax);
  const [education, setEducation] = useState(job.education);
  const [location, setLocation] = useState(job.location);
  const [workModel, setWorkModel] = useState(job.workModel);
  const [salaryMin, setSalaryMin] = useState(String(job.salaryMin));
  const [salaryMax, setSalaryMax] = useState(String(job.salaryMax));
  const [currency, setCurrency] = useState(job.salaryCurrency);
  const [responsibilities, setResponsibilities] = useState<string[]>(job.responsibilities);
  const [languages, setLanguages] = useState<string[]>(job.languageRequirements);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const highCount = Object.values(FIELD_CONFIDENCE).filter((c) => c === "high").length;
  const total = Object.keys(FIELD_CONFIDENCE).length;

  return (
    <div className="pb-32">
      <div className="mb-2 flex items-center gap-1 text-sm text-brand-text-secondary">
        <Link to="/projects" className="hover:underline">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/jobs/$id" params={{ id: job.id }} className="hover:underline">
          {job.jobTitle}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>JD parse review</span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">Review parsed brief</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[45fr_55fr]">
        {/* Left — Original JD */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Original JD
            </div>
            <span className="text-xs text-brand-text-secondary">
              Uploaded: CFO_JD_Indorama.pdf
            </span>
          </div>
          <div className="max-h-[700px] overflow-y-auto bg-brand-bg/40 px-5 py-4">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.6] text-brand-text">
              {job.rawJdText}
            </pre>
          </div>
          <div className="border-t border-border px-5 py-3">
            <button className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline">
              <Download className="h-3 w-3" />
              Download original
            </button>
          </div>
        </div>

        {/* Right — Extracted Fields */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-status-ai" />
                Extracted brief
              </div>
              <span className="rounded-full bg-status-ai/15 px-2 py-0.5 text-[11px] font-medium text-status-ai">
                Claude Sonnet 4.6 · 3.2s
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-brand-text-secondary">
                {highCount} of {total} fields extracted with high confidence
              </span>
              <div className="ml-2 flex h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="bg-status-success"
                  style={{ width: `${(highCount / total) * 100}%` }}
                />
                <div
                  className="bg-status-warning"
                  style={{
                    width: `${
                      (Object.values(FIELD_CONFIDENCE).filter((c) => c === "medium").length / total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 px-5 py-5">
            {[
              {
                key: "jobTitle",
                label: "Job title",
                el: <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />,
              },
              {
                key: "seniority",
                label: "Seniority level",
                el: (
                  <Select value={seniority} onValueChange={(v) => setSeniority(v as typeof seniority)}>
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
                ),
              },
              {
                key: "department",
                label: "Department",
                el: <Input value={department} onChange={(e) => setDepartment(e.target.value)} />,
              },
              {
                key: "skillsRequired",
                label: "Skills required",
                el: <Tags values={skillsRequired} onChange={setSkillsRequired} color="info" />,
              },
              {
                key: "skillsNice",
                label: "Skills nice-to-have",
                el: <Tags values={skillsNice} onChange={setSkillsNice} color="neutral" />,
              },
              {
                key: "experience",
                label: "Experience",
                el: (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expMin}
                      onChange={(e) => setExpMin(parseInt(e.target.value, 10))}
                      className="w-24"
                    />
                    <span className="text-brand-text-secondary text-sm">to</span>
                    <Input
                      type="number"
                      value={expMax}
                      onChange={(e) => setExpMax(parseInt(e.target.value, 10))}
                      className="w-24"
                    />
                    <span className="text-brand-text-secondary text-sm">years</span>
                  </div>
                ),
              },
              {
                key: "education",
                label: "Education",
                el: <Input value={education} onChange={(e) => setEducation(e.target.value)} />,
              },
              {
                key: "location",
                label: "Location",
                el: (
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                ),
              },
              {
                key: "workModel",
                label: "Work model",
                el: (
                  <div className="flex gap-4 pt-1">
                    {(["onsite", "hybrid", "remote"] as const).map((m) => (
                      <label key={m} className="flex items-center gap-1.5 text-sm capitalize">
                        <input
                          type="radio"
                          checked={workModel === m}
                          onChange={() => setWorkModel(m)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                ),
              },
              {
                key: "salary",
                label: "Salary range",
                el: (
                  <div className="flex items-center gap-2">
                    <Input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                    <span className="text-brand-text-secondary text-sm">to</span>
                    <Input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                    <Select value={currency} onValueChange={setCurrency}>
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
                ),
              },
              {
                key: "responsibilities",
                label: "Responsibilities",
                el: (
                  <RespList
                    items={responsibilities}
                    onChange={setResponsibilities}
                  />
                ),
              },
              {
                key: "languages",
                label: "Language requirements",
                el: <Tags values={languages} onChange={setLanguages} color="info" />,
              },
            ].map((f, i) => (
              <FieldRow
                key={f.key}
                label={f.label}
                confidence={FIELD_CONFIDENCE[f.key]}
                delay={i * 50}
                mounted={mounted}
              >
                {f.el}
              </FieldRow>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 px-8 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Re-parsing... done")}
          >
            <RefreshCw className="h-4 w-4" />
            Re-parse
          </Button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/jobs/$id", params: { id: job.id } })}
              className="text-sm text-brand-text-secondary hover:text-brand-text"
            >
              Discard
            </button>
            <Button
              className="gap-2 bg-status-success text-white hover:bg-status-success/90"
              onClick={() => {
                toast.success("Job brief saved");
                navigate({ to: "/jobs/$id", params: { id: job.id } });
              }}
            >
              <Check className="h-4 w-4" />
              Approve & save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  confidence,
  children,
  delay,
  mounted,
}: {
  label: string;
  confidence: Confidence;
  children: React.ReactNode;
  delay: number;
  mounted: boolean;
}) {
  return (
    <div
      className={cn(
        "border-l-2 pl-3 transition-all duration-500",
        confidence === "high" && "border-l-brand-primary/50",
        confidence === "medium" && "border-l-status-warning/60",
        confidence === "low" && "border-l-status-danger/60",
        mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            confidence === "high" && "bg-status-success",
            confidence === "medium" && "bg-status-warning",
            confidence === "low" && "bg-status-danger",
          )}
        />
        {label}
      </Label>
      {children}
    </div>
  );
}

function Tags({
  values,
  onChange,
  color,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  color: "info" | "neutral";
}) {
  const [draft, setDraft] = useState("");
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
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...values, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="Type and press Enter..."
          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function RespList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-brand-text-secondary" />
          <Input
            value={it}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-brand-text-secondary hover:text-status-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="text-sm text-brand-primary hover:underline"
      >
        + Add responsibility
      </button>
    </div>
  );
}
