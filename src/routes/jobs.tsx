import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  Building,
  MessageCircle,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  PUBLIC_JOBS,
  postedLabel,
  type JobSeniority,
  type JobWorkModel,
  type PublicJob,
} from "@/lib/public-jobs";

const SENIORITIES: Array<JobSeniority | "All"> = ["All", "C-Suite", "VP", "Director", "Manager"];
const WORK_MODELS: Array<JobWorkModel | "All"> = ["All", "On-site", "Hybrid", "Remote"];
const LOCATIONS = ["All locations", "Jakarta", "Singapore", "Remote"];
const INDUSTRIES = ["All", "Manufacturing", "Hospitality", "Technology", "Consumer Goods", "F&B"];

const jobPostingLd = (j: PublicJob) => ({
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  title: j.title,
  description: `${j.title} at ${j.company}. ${j.experience}. Skills: ${j.skills.join(", ")}.`,
  hiringOrganization: { "@type": "Organization", name: j.company },
  jobLocation: { "@type": "Place", address: j.location },
  employmentType: "FULL_TIME",
  datePosted: j.datePosted,
});

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Open Positions — HireSmart | Executive Recruitment" },
      {
        name: "description",
        content:
          "Browse executive leadership opportunities with leading companies across Southeast Asia. CFO, VP, Director, and C-Suite roles.",
      },
      { property: "og:title", content: "Open Positions — HireSmart" },
      {
        property: "og:description",
        content: "AI-powered recruitment made smart, fast, and human.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/jobs" },
    ],
    links: [{ rel: "canonical", href: "/jobs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org/",
          "@graph": PUBLIC_JOBS.map(jobPostingLd),
        }),
      },
    ],
  }),
  component: JobsPortal,
});

interface FiltersState {
  seniority: (typeof SENIORITIES)[number];
  workModel: (typeof WORK_MODELS)[number];
  location: string;
  industry: string;
}

const DEFAULT_FILTERS: FiltersState = {
  seniority: "All",
  workModel: "All",
  location: "All locations",
  industry: "All",
};

function JobsPortal() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  const activeCount = useMemo(
    () =>
      (filters.seniority !== "All" ? 1 : 0) +
      (filters.workModel !== "All" ? 1 : 0) +
      (filters.location !== "All locations" ? 1 : 0) +
      (filters.industry !== "All" ? 1 : 0),
    [filters],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PUBLIC_JOBS.filter((j) => {
      if (q) {
        const hay = `${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.seniority !== "All" && j.seniority !== filters.seniority) return false;
      if (filters.workModel !== "All" && j.workModel !== filters.workModel) return false;
      if (filters.location !== "All locations") {
        if (filters.location === "Remote") {
          if (j.workModel !== "Remote") return false;
        } else if (j.city !== filters.location) return false;
      }
      if (filters.industry !== "All" && j.industry !== filters.industry) return false;
      return true;
    });
  }, [query, filters]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-seafoam/20 to-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center md:py-20">
          <h1 className="max-w-xl text-[26px] font-bold leading-tight tracking-tight text-brand-text md:text-[32px]">
            Find your next leadership role
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-brand-text-secondary md:text-base">
            Executive opportunities with leading companies across Southeast Asia
          </p>

          <form
            className="mt-8 w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition focus-within:border-brand-primary focus-within:shadow-md md:h-[52px] md:flex-row md:items-center md:p-1.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-secondary" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, company, or skills..."
                  className="h-11 border-0 bg-transparent pl-10 text-[15px] shadow-none focus-visible:ring-0 md:h-10"
                />
              </div>
              <Button
                type="submit"
                className="h-11 rounded-lg bg-brand-primary px-5 text-white hover:bg-brand-primary/90 md:h-10"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-5xl px-6 pt-8">
        {/* Desktop filters */}
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <FilterSelect
            label="Seniority"
            value={filters.seniority}
            options={SENIORITIES}
            onChange={(v) => setFilters((f) => ({ ...f, seniority: v as FiltersState["seniority"] }))}
          />
          <FilterSelect
            label="Location"
            value={filters.location}
            options={LOCATIONS}
            onChange={(v) => setFilters((f) => ({ ...f, location: v }))}
          />
          <FilterSelect
            label="Work model"
            value={filters.workModel}
            options={WORK_MODELS}
            onChange={(v) => setFilters((f) => ({ ...f, workModel: v as FiltersState["workModel"] }))}
          />
          <FilterSelect
            label="Industry"
            value={filters.industry}
            options={INDUSTRIES}
            onChange={(v) => setFilters((f) => ({ ...f, industry: v }))}
          />
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-seafoam/40 px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-seafoam/60"
            >
              {activeCount} filter{activeCount > 1 ? "s" : ""}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Mobile filters */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-6">
                <FilterSelect
                  label="Seniority"
                  value={filters.seniority}
                  options={SENIORITIES}
                  onChange={(v) => setFilters((f) => ({ ...f, seniority: v as FiltersState["seniority"] }))}
                  fullWidth
                />
                <FilterSelect
                  label="Location"
                  value={filters.location}
                  options={LOCATIONS}
                  onChange={(v) => setFilters((f) => ({ ...f, location: v }))}
                  fullWidth
                />
                <FilterSelect
                  label="Work model"
                  value={filters.workModel}
                  options={WORK_MODELS}
                  onChange={(v) => setFilters((f) => ({ ...f, workModel: v as FiltersState["workModel"] }))}
                  fullWidth
                />
                <FilterSelect
                  label="Industry"
                  value={filters.industry}
                  options={INDUSTRIES}
                  onChange={(v) => setFilters((f) => ({ ...f, industry: v }))}
                  fullWidth
                />
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <p className="mt-4 text-sm text-brand-text-secondary">
          Showing {filtered.length} open position{filtered.length === 1 ? "" : "s"}
        </p>
      </section>

      {/* Job grid */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-sm text-brand-text-secondary">
              No roles match your filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 md:max-w-4xl md:mx-auto">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-seafoam/10 px-6 py-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-[22px] font-semibold tracking-tight text-brand-text">
            Don't see the right role?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">
            We work on confidential mandates that aren't publicly listed. Submit your CV
            and our team will reach out when a matching opportunity arises.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button className="h-12 rounded-xl bg-brand-primary px-6 text-white hover:bg-brand-primary/90">
              Submit your CV
            </Button>
            <a
              href="https://wa.me/628194421035"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-primary px-6 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/5"
            >
              <MessageCircle className="h-4 w-4" />
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  fullWidth,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn(fullWidth && "w-full")}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-9 rounded-full border-gray-200 bg-white text-sm",
            fullWidth ? "w-full" : "min-w-[140px]",
          )}
        >
          <SelectValue placeholder={label}>
            <span className="text-brand-text-secondary">{label}:</span>{" "}
            <span className="font-medium text-brand-text">{value}</span>
          </SelectValue>
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

function JobCard({ job }: { job: PublicJob }) {
  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className="group block rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-mint hover:shadow-sm md:p-6"
    >
      <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-brand-text">
        {job.title}
      </h3>
      <p className="mt-1 text-sm font-medium text-brand-primary group-hover:underline">
        {job.company}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-brand-text-secondary">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Building className="h-3.5 w-3.5" />
          {job.workModel}
        </span>
        <span>·</span>
        <span>{job.seniority}</span>
      </div>

      <p className="mt-2 text-[13px] text-brand-text-secondary">
        {job.experience} · {job.function}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full bg-brand-seafoam/30 px-2 py-0.5 text-xs text-brand-primary"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="text-xs text-brand-text-secondary">
          {postedLabel(job.postedDaysAgo)}
        </span>
        <span className="text-sm font-medium text-brand-primary">Apply →</span>
      </div>
    </Link>
  );
}
