import { useState } from "react";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ParsedCandidate {
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  linkedin_url: string;
  current_title: string;
  current_company: string;
  location: string;
  summary: string;
  skills: string[];
  total_experience_years: number;
  seniority_level: string;
  education: { degree: string; school: string; year?: string }[];
  work_history: { title: string; company: string; period: string }[];
  certifications: string[];
  languages: string[];
  salary_expectation: string;
  notice_period: string;
  willing_to_relocate: boolean;
  do_not_contact?: boolean;
  tags?: string[];
  source?: string;
  source_ref?: string;
  ai_extracted?: boolean;
}

export const blankCandidate = (): ParsedCandidate => ({
  full_name: "",
  email: "",
  phone: "",
  whatsapp: "",
  linkedin_url: "",
  current_title: "",
  current_company: "",
  location: "",
  summary: "",
  skills: [],
  total_experience_years: 0,
  seniority_level: "",
  education: [],
  work_history: [],
  certifications: [],
  languages: [],
  salary_expectation: "",
  notice_period: "",
  willing_to_relocate: false,
  do_not_contact: false,
  tags: [],
  ai_extracted: false,
});

export function SourceChip({ source }: { source?: string }) {
  if (!source) return null;
  return (
    <Badge className="bg-brand-seafoam/40 text-brand-primary border-brand-seafoam hover:bg-brand-seafoam/40">
      Source: {source}
    </Badge>
  );
}

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="border-t border-gray-100 first:border-t-0 pt-4 first:pt-0">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
          {title}
        </h4>
        {hint && <span className="text-[10px] text-brand-text-secondary">{hint}</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  required,
  aiFilled,
  children,
}: {
  label: string;
  required?: boolean;
  aiFilled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[12px] text-brand-text-secondary mb-1 flex items-center gap-1.5">
        {label}
        {required && <span className="text-status-danger">*</span>}
        {aiFilled && (
          <span title="Extracted by AI — please verify">
            <Sparkles className="h-3 w-3 text-status-ai" />
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

export interface CandidateReviewFormProps {
  value: ParsedCandidate;
  onChange: (next: ParsedCandidate) => void;
  aiFilled?: boolean;
  compact?: boolean;
}

export function CandidateReviewForm({
  value,
  onChange,
  aiFilled,
  compact,
}: CandidateReviewFormProps) {
  const set = <K extends keyof ParsedCandidate>(k: K, v: ParsedCandidate[K]) =>
    onChange({ ...value, [k]: v });

  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !value.skills.includes(s)) set("skills", [...value.skills, s]);
    setSkillInput("");
  };
  const addTag = () => {
    const s = tagInput.trim();
    if (s && !(value.tags ?? []).includes(s)) set("tags", [...(value.tags ?? []), s]);
    setTagInput("");
  };

  return (
    <div className={cn("space-y-5", compact && "text-sm")}>
      <Section title="Contact">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Full name" required aiFilled={aiFilled && !!value.full_name}>
            <Input value={value.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </FieldRow>
          <FieldRow label="Email" aiFilled={aiFilled && !!value.email}>
            <Input type="email" value={value.email} onChange={(e) => set("email", e.target.value)} />
          </FieldRow>
          <FieldRow label="Phone" aiFilled={aiFilled && !!value.phone}>
            <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} />
          </FieldRow>
          <FieldRow label="WhatsApp">
            <Input
              value={value.whatsapp ?? ""}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="Same as phone if applicable"
            />
          </FieldRow>
          <FieldRow label="LinkedIn URL" aiFilled={aiFilled && !!value.linkedin_url}>
            <Input value={value.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
          </FieldRow>
          <FieldRow label="Location" aiFilled={aiFilled && !!value.location}>
            <Input value={value.location} onChange={(e) => set("location", e.target.value)} />
          </FieldRow>
        </div>
      </Section>

      <Section title="Current role">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Title" aiFilled={aiFilled && !!value.current_title}>
            <Input value={value.current_title} onChange={(e) => set("current_title", e.target.value)} />
          </FieldRow>
          <FieldRow label="Company" aiFilled={aiFilled && !!value.current_company}>
            <Input value={value.current_company} onChange={(e) => set("current_company", e.target.value)} />
          </FieldRow>
          <FieldRow label="Seniority" aiFilled={aiFilled && !!value.seniority_level}>
            <Select value={value.seniority_level} onValueChange={(v) => set("seniority_level", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {["C-Suite", "VP", "Director", "Manager", "Senior", "Mid", "Junior"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Total experience (years)" aiFilled={aiFilled && !!value.total_experience_years}>
            <Input
              type="number"
              value={value.total_experience_years || ""}
              onChange={(e) => set("total_experience_years", Number(e.target.value) || 0)}
            />
          </FieldRow>
        </div>
        <FieldRow label="Summary" aiFilled={aiFilled && !!value.summary}>
          <Textarea
            rows={3}
            value={value.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </FieldRow>
      </Section>

      <Section title="Skills & expertise" hint={`${value.skills.length} skills`}>
        <div className="flex flex-wrap gap-1.5 rounded-md border border-input p-2 min-h-[42px]">
          {value.skills.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full bg-brand-seafoam/40 px-2 py-0.5 text-xs text-brand-primary"
            >
              {s}
              <button onClick={() => set("skills", value.skills.filter((x) => x !== s))}>
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
            placeholder="Type and press Enter…"
            className="flex-1 bg-transparent text-sm outline-none min-w-[120px]"
          />
        </div>
      </Section>

      <Section
        title="Work history"
        hint={`${value.work_history.length} positions`}
      >
        <div className="space-y-2">
          {value.work_history.map((w, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_140px_28px] gap-2 items-center">
              <Input
                value={w.title}
                placeholder="Title"
                onChange={(e) =>
                  set(
                    "work_history",
                    value.work_history.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
              <Input
                value={w.company}
                placeholder="Company"
                onChange={(e) =>
                  set(
                    "work_history",
                    value.work_history.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)),
                  )
                }
              />
              <Input
                value={w.period}
                placeholder="2020 – Present"
                onChange={(e) =>
                  set(
                    "work_history",
                    value.work_history.map((x, idx) => (idx === i ? { ...x, period: e.target.value } : x)),
                  )
                }
              />
              <button
                className="text-brand-text-secondary hover:text-status-danger"
                onClick={() =>
                  set(
                    "work_history",
                    value.work_history.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              set("work_history", [...value.work_history, { title: "", company: "", period: "" }])
            }
            className="flex items-center gap-1 text-xs text-brand-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add role
          </button>
        </div>
      </Section>

      <Section title="Education" hint={`${value.education.length} entries`}>
        <div className="space-y-2">
          {value.education.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_100px_28px] gap-2 items-center">
              <Input
                value={e.degree}
                placeholder="Degree"
                onChange={(ev) =>
                  set(
                    "education",
                    value.education.map((x, idx) => (idx === i ? { ...x, degree: ev.target.value } : x)),
                  )
                }
              />
              <Input
                value={e.school}
                placeholder="Institution"
                onChange={(ev) =>
                  set(
                    "education",
                    value.education.map((x, idx) => (idx === i ? { ...x, school: ev.target.value } : x)),
                  )
                }
              />
              <Input
                value={e.year ?? ""}
                placeholder="Year"
                onChange={(ev) =>
                  set(
                    "education",
                    value.education.map((x, idx) => (idx === i ? { ...x, year: ev.target.value } : x)),
                  )
                }
              />
              <button
                className="text-brand-text-secondary hover:text-status-danger"
                onClick={() => set("education", value.education.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => set("education", [...value.education, { degree: "", school: "", year: "" }])}
            className="flex items-center gap-1 text-xs text-brand-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add education
          </button>
        </div>
      </Section>

      <Section title="Certifications & languages">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Certifications (comma-separated)">
            <Input
              value={value.certifications.join(", ")}
              onChange={(e) =>
                set(
                  "certifications",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </FieldRow>
          <FieldRow label="Languages (comma-separated)">
            <Input
              value={value.languages.join(", ")}
              onChange={(e) =>
                set(
                  "languages",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </FieldRow>
        </div>
      </Section>

      <Section title="Preferences">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Salary expectation">
            <Input
              value={value.salary_expectation}
              onChange={(e) => set("salary_expectation", e.target.value)}
              placeholder="e.g., $200K–$250K USD"
            />
          </FieldRow>
          <FieldRow label="Notice period">
            <Select value={value.notice_period} onValueChange={(v) => set("notice_period", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {["Immediate", "1 month", "2 months", "3 months", "6 months", "Not specified"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-brand-text">
            <Checkbox
              checked={value.willing_to_relocate}
              onCheckedChange={(c) => set("willing_to_relocate", !!c)}
            />
            Willing to relocate
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-text">
            <Checkbox
              checked={value.do_not_contact}
              onCheckedChange={(c) => set("do_not_contact", !!c)}
            />
            Do not contact
          </label>
        </div>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-1.5 rounded-md border border-input p-2 min-h-[40px]">
          {(value.tags ?? []).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full bg-brand-bg px-2 py-0.5 text-xs text-brand-text"
            >
              {s}
              <button onClick={() => set("tags", (value.tags ?? []).filter((x) => x !== s))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag…"
            className="flex-1 bg-transparent text-sm outline-none min-w-[120px]"
          />
        </div>
      </Section>
    </div>
  );
}
