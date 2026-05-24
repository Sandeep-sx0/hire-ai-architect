import { jobs as allJobs, clients, projects, type Job } from "./mock-data";

export type ChannelId =
  | "careers_page"
  | "linkedin_jobs"
  | "indeed"
  | "seek"
  | "jobstreet"
  | "jobsdb";

export type ConnectionState =
  | "connected"
  | "not_connected"
  | "pending_partner"
  | "error";

export interface ChannelConfig {
  id: ChannelId;
  name: string;
  blurb: string;
  initial: string;
  accent: string;
  /** Type of integration — drives the connect-form copy in /settings/distribution. */
  integration:
    | "owned" // Norvex careers page — always on
    | "api_key" // standard API/feed
    | "advertiser_account" // requires advertiser/customer ID
    | "partner_gated"; // LinkedIn / Indeed — needs partner program approval
  /** Whether programmatic posting needs a partner-program approval (truthful gating). */
  partnerGated?: boolean;
}

export const CHANNELS: ChannelConfig[] = [
  {
    id: "careers_page",
    name: "Norvex Careers Page",
    blurb: "Your own white-labelled public job board (norvex-careers.example).",
    initial: "Nx",
    accent: "bg-brand-primary",
    integration: "owned",
  },
  {
    id: "linkedin_jobs",
    name: "LinkedIn Jobs",
    blurb: "Largest professional network — strong for mid-to-senior across APAC.",
    initial: "in",
    accent: "bg-[#0A66C2]",
    integration: "partner_gated",
    partnerGated: true,
  },
  {
    id: "indeed",
    name: "Indeed",
    blurb: "High-volume global aggregator — broad funnel, light targeting.",
    initial: "id",
    accent: "bg-[#2164F3]",
    integration: "partner_gated",
    partnerGated: true,
  },
  {
    id: "jobstreet",
    name: "JobStreet",
    blurb: "Leading SE-Asia board — strong volume in ID, MY, SG.",
    initial: "JS",
    accent: "bg-[#D11F2C]",
    integration: "advertiser_account",
  },
  {
    id: "seek",
    name: "Seek",
    blurb: "Dominant in AU/NZ, growing presence across SE-Asia.",
    initial: "Sk",
    accent: "bg-[#0D3880]",
    integration: "advertiser_account",
  },
  {
    id: "jobsdb",
    name: "JobsDB",
    blurb: "Hong Kong / Thailand specialist — solid mid-market reach.",
    initial: "JD",
    accent: "bg-[#522D80]",
    integration: "api_key",
  },
];

export function getChannel(id: ChannelId): ChannelConfig {
  const c = CHANNELS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown channel ${id}`);
  return c;
}

/** Workspace-level connection state per channel (mock). */
export const channelConnections: Record<
  ChannelId,
  { state: ConnectionState; account?: string; lastChecked?: string; note?: string }
> = {
  careers_page: { state: "connected", account: "norvex-careers.example", lastChecked: "5 min ago" },
  jobstreet: { state: "connected", account: "Advertiser #JS-3318 · Norvex SG", lastChecked: "1 h ago" },
  seek: { state: "connected", account: "Advertiser #SK-99213 · Norvex AU", lastChecked: "1 h ago" },
  jobsdb: { state: "error", account: "API key · Norvex HK", lastChecked: "3 h ago", note: "Token expired" },
  linkedin_jobs: { state: "pending_partner", note: "Registered 14 May — typical review 2–4 weeks" },
  indeed: { state: "not_connected" },
};

export type PostingStatus =
  | "live"
  | "draft"
  | "pending"
  | "expired"
  | "error"
  | "not_posted";

export interface Posting {
  id: string;
  jobId: string;
  channel: ChannelId;
  status: PostingStatus;
  postedAt?: string; // ISO date
  expiresAt?: string; // ISO date
  applicants: number;
  lastSyncedAt?: string;
  externalUrl?: string;
  errorMessage?: string;
  recruiter: string;
}

const today = new Date("2026-05-24");
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

/** Deterministic mock postings — varied states per job. */
export const postings: Posting[] = [
  // j1
  { id: "p1", jobId: "j1", channel: "careers_page", status: "live", postedAt: iso(-22), applicants: 18, lastSyncedAt: "2 min ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  { id: "p2", jobId: "j1", channel: "jobstreet", status: "live", postedAt: iso(-21), expiresAt: iso(8), applicants: 41, lastSyncedAt: "15 min ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  { id: "p3", jobId: "j1", channel: "seek", status: "expired", postedAt: iso(-51), expiresAt: iso(-3), applicants: 12, lastSyncedAt: "1 d ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  { id: "p4", jobId: "j1", channel: "linkedin_jobs", status: "pending", applicants: 0, recruiter: "Daniel Chandra" },
  // j2
  { id: "p5", jobId: "j2", channel: "careers_page", status: "live", postedAt: iso(-9), applicants: 7, lastSyncedAt: "1 min ago", externalUrl: "#", recruiter: "Sari Wibowo" },
  { id: "p6", jobId: "j2", channel: "jobstreet", status: "live", postedAt: iso(-9), expiresAt: iso(21), applicants: 23, lastSyncedAt: "20 min ago", externalUrl: "#", recruiter: "Sari Wibowo" },
  { id: "p7", jobId: "j2", channel: "jobsdb", status: "error", postedAt: iso(-9), applicants: 0, lastSyncedAt: "3 h ago", errorMessage: "Token expired — reconnect JobsDB in Settings → Distribution.", recruiter: "Sari Wibowo" },
  // j3
  { id: "p8", jobId: "j3", channel: "careers_page", status: "draft", applicants: 0, recruiter: "Adi Pratama" },
  // j4
  { id: "p9", jobId: "j4", channel: "careers_page", status: "live", postedAt: iso(-30), applicants: 4, lastSyncedAt: "10 min ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  { id: "p10", jobId: "j4", channel: "seek", status: "live", postedAt: iso(-30), expiresAt: iso(5), applicants: 19, lastSyncedAt: "1 h ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  { id: "p11", jobId: "j4", channel: "jobstreet", status: "live", postedAt: iso(-30), expiresAt: iso(6), applicants: 28, lastSyncedAt: "1 h ago", externalUrl: "#", recruiter: "Daniel Chandra" },
  // j5
  { id: "p12", jobId: "j5", channel: "careers_page", status: "live", postedAt: iso(-12), applicants: 9, lastSyncedAt: "5 min ago", externalUrl: "#", recruiter: "Sari Wibowo" },
  { id: "p13", jobId: "j5", channel: "jobstreet", status: "live", postedAt: iso(-12), expiresAt: iso(18), applicants: 14, lastSyncedAt: "30 min ago", externalUrl: "#", recruiter: "Sari Wibowo" },
  // j6
  { id: "p14", jobId: "j6", channel: "careers_page", status: "live", postedAt: iso(-5), applicants: 3, lastSyncedAt: "5 min ago", externalUrl: "#", recruiter: "Adi Pratama" },
  { id: "p15", jobId: "j6", channel: "seek", status: "live", postedAt: iso(-5), expiresAt: iso(25), applicants: 6, lastSyncedAt: "1 h ago", externalUrl: "#", recruiter: "Adi Pratama" },
];

export function postingsForJob(jobId: string): Posting[] {
  return postings.filter((p) => p.jobId === jobId);
}

export function jobForPosting(p: Posting): Job | undefined {
  return allJobs.find((j) => j.id === p.jobId);
}

export function clientNameForJob(job: Job): string {
  const proj = projects.find((pr) => pr.id === job.projectId);
  if (!proj) return "—";
  const c = clients.find((cl) => cl.id === proj.clientId);
  return c?.name ?? "—";
}

export function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null;
  const target = new Date(dateIso);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function statusTone(status: PostingStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "live":
      return { label: "Live", className: "bg-status-success/15 text-status-success" };
    case "draft":
      return { label: "Draft", className: "bg-status-neutral/15 text-status-neutral" };
    case "pending":
      return { label: "Pending", className: "bg-status-warning/15 text-status-warning" };
    case "expired":
      return { label: "Expired", className: "bg-status-danger/15 text-status-danger" };
    case "error":
      return { label: "Error", className: "bg-status-danger/20 text-status-danger" };
    case "not_posted":
      return { label: "Not posted", className: "bg-muted text-brand-text-secondary" };
  }
}

export function connectionTone(state: ConnectionState): { label: string; className: string } {
  switch (state) {
    case "connected":
      return { label: "Connected", className: "bg-status-success/15 text-status-success" };
    case "not_connected":
      return { label: "Not connected", className: "bg-muted text-brand-text-secondary" };
    case "pending_partner":
      return { label: "Awaiting partner access", className: "bg-status-warning/15 text-status-warning" };
    case "error":
      return { label: "Reconnect required", className: "bg-status-danger/15 text-status-danger" };
  }
}
