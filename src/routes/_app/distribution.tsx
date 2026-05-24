import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Filter,
  RefreshCw,
  Share2,
  Plug,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  postings,
  CHANNELS,
  getChannel,
  channelConnections,
  statusTone,
  daysUntil,
  jobForPosting,
  clientNameForJob,
  type ChannelId,
  type PostingStatus,
} from "@/lib/distribution";

export const Route = createFileRoute("/_app/distribution")({
  head: () => ({ meta: [{ title: "Distribution — HireSmart" }] }),
  component: DistributionDashboard,
});

const STATUS_OPTIONS: PostingStatus[] = ["live", "pending", "expired", "error", "draft"];

function DistributionDashboard() {
  const [channelFilter, setChannelFilter] = useState<ChannelId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PostingStatus | "all">("all");
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const recruiters = useMemo(
    () => Array.from(new Set(postings.map((p) => p.recruiter))).sort(),
    [],
  );
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    postings.forEach((p) => {
      const j = jobForPosting(p);
      if (j) set.add(clientNameForJob(j));
    });
    return Array.from(set).sort();
  }, []);

  const filtered = postings.filter((p) => {
    const job = jobForPosting(p);
    if (!job) return false;
    if (channelFilter !== "all" && p.channel !== channelFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (recruiterFilter !== "all" && p.recruiter !== recruiterFilter) return false;
    if (clientFilter !== "all" && clientNameForJob(job) !== clientFilter) return false;
    if (expiringOnly) {
      const d = daysUntil(p.expiresAt);
      if (d === null || d < 0 || d > 7 || p.status !== "live") return false;
    }
    if (search) {
      const hay = `${job.jobTitle} ${job.jobCode} ${clientNameForJob(job)}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Summary stats (across ALL postings, not the filtered view)
  const liveCount = postings.filter((p) => p.status === "live").length;
  const monthApplicants = postings.reduce((s, p) => s + p.applicants, 0);
  const expiringThisWeek = postings.filter((p) => {
    const d = daysUntil(p.expiresAt);
    return d !== null && d >= 0 && d <= 7 && p.status === "live";
  }).length;
  const connectedChannels = Object.values(channelConnections).filter(
    (c) => c.state === "connected",
  ).length;

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.includes(p.id));
  const toggleAll = () =>
    setSelected(allChecked ? [] : filtered.map((p) => p.id));

  const clearFilters = () => {
    setChannelFilter("all");
    setStatusFilter("all");
    setRecruiterFilter("all");
    setClientFilter("all");
    setExpiringOnly(false);
    setSearch("");
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-brand-text">
            <Share2 className="h-6 w-6 text-brand-primary" /> Distribution
          </h1>
          <p className="mt-1 text-sm text-brand-text-secondary">
            Every live and recent posting across all jobs and channels. Stay ahead of expiring
            postings before they lapse.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/settings/distribution">
            <Plug className="h-4 w-4" /> Manage channels
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Live postings" value={liveCount} />
        <StatCard label="Applicants this month" value={monthApplicants} />
        <StatCard
          label="Expiring this week"
          value={expiringThisWeek}
          tone={expiringThisWeek > 0 ? "warn" : undefined}
          action={
            expiringThisWeek > 0 ? (
              <button
                onClick={() => setExpiringOnly(true)}
                className="text-[11px] font-medium text-status-warning hover:underline"
              >
                Show all →
              </button>
            ) : undefined
          }
        />
        <StatCard
          label="Channels connected"
          value={`${connectedChannels} / ${CHANNELS.length}`}
        />
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <Filter className="h-4 w-4 text-brand-text-secondary" />
        <Input
          placeholder="Search job, client, or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-60"
        />
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelId | "all")}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Channel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {CHANNELS.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PostingStatus | "all")}>
          <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Recruiter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All recruiters</SelectItem>
            {recruiters.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clientsList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-brand-bg/50 px-2.5 py-1.5 text-xs text-brand-text">
          <Checkbox checked={expiringOnly} onCheckedChange={(v) => setExpiringOnly(!!v)} />
          Expiring in 7 days only
        </label>
        {(channelFilter !== "all" || statusFilter !== "all" || recruiterFilter !== "all" || clientFilter !== "all" || expiringOnly || search) && (
          <Button variant="ghost" size="sm" className="gap-1 text-brand-text-secondary" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-brand-primary/40 bg-brand-mint/15 px-4 py-2 text-sm">
          <div className="text-brand-text">
            <span className="font-semibold">{selected.length}</span> posting{selected.length === 1 ? "" : "s"} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                toast.success(`Re-posted ${selected.length} posting${selected.length === 1 ? "" : "s"}`);
                setSelected([]);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-post selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-status-danger"
              onClick={() => {
                toast.success(`Closed ${selected.length} posting${selected.length === 1 ? "" : "s"}`);
                setSelected([]);
              }}
            >
              Close selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-brand-text-secondary">
              <tr>
                <th className="w-10 px-3 py-3">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </th>
                <th className="px-3 py-3 text-left font-semibold">Job</th>
                <th className="px-3 py-3 text-left font-semibold">Client</th>
                <th className="px-3 py-3 text-left font-semibold">Channel</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Posted</th>
                <th className="px-3 py-3 text-left font-semibold">Expires</th>
                <th className="px-3 py-3 text-left font-semibold">Applicants</th>
                <th className="px-3 py-3 text-left font-semibold">Recruiter</th>
                <th className="px-3 py-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const job = jobForPosting(p)!;
                const ch = getChannel(p.channel);
                const tone = statusTone(p.status);
                const expiryDays = daysUntil(p.expiresAt);
                const expiringSoon =
                  expiryDays !== null && expiryDays >= 0 && expiryDays <= 7 && p.status === "live";
                const checked = selected.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-t border-border align-middle hover:bg-brand-bg/40",
                      expiringSoon && "bg-status-warning/5",
                      checked && "bg-brand-mint/15",
                    )}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          setSelected((s) =>
                            s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id],
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to="/jobs/$id"
                        params={{ id: job.id }}
                        search={{ tab: "distribution" }}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        {job.jobTitle}
                      </Link>
                      <div className="text-[11px] text-brand-text-secondary">{job.jobCode}</div>
                    </td>
                    <td className="px-3 py-3 text-brand-text-secondary">{clientNameForJob(job)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white", ch.accent)}>
                          {ch.initial}
                        </div>
                        <span className="text-brand-text">{ch.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", tone.className)}>
                        {tone.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-brand-text-secondary">{p.postedAt ?? "—"}</td>
                    <td className={cn("px-3 py-3", expiringSoon ? "font-medium text-status-warning" : "text-brand-text-secondary")}>
                      {p.expiresAt ?? "—"}
                      {expiringSoon && (
                        <div className="inline-flex items-center gap-1 ml-2 text-[11px]">
                          <AlertTriangle className="h-3 w-3" /> in {expiryDays}d
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-brand-text">{p.applicants}</td>
                    <td className="px-3 py-3 text-brand-text-secondary">{p.recruiter}</td>
                    <td className="px-3 py-3 text-right">
                      {p.externalUrl && p.status === "live" ? (
                        <Button asChild variant="ghost" size="sm" className="gap-1">
                          <a href={p.externalUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </a>
                        </Button>
                      ) : p.status === "expired" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => toast.success(`Re-posted to ${ch.name}`)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Re-post
                        </Button>
                      ) : p.status === "error" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-status-danger"
                          onClick={() => toast(`Retrying ${ch.name}…`)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Retry
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-sm text-brand-text-secondary">
                    No postings match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  action,
}: {
  label: string;
  value: number | string;
  tone?: "warn" | "danger";
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</div>
        {action}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "warn" ? "text-status-warning" : tone === "danger" ? "text-status-danger" : "text-brand-text",
        )}
      >
        {value}
      </div>
    </div>
  );
}
