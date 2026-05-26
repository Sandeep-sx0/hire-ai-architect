import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Linkedin,
  MailOpen,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, StatusBadge, DataTable } from "@/components/shared";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { campaigns, projects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/outreach/$id")({
  head: () => ({ meta: [{ title: "Campaign — Syndie Recruit" }] }),
  component: CampaignDetail,
});

type ProspectStatus = "pending" | "sent" | "replied" | "completed" | "paused" | "stopped";

interface Prospect {
  id: string;
  name: string;
  score: number;
  step: number;
  status: ProspectStatus;
  lastAction: string;
}

const INITIAL_PROSPECTS: Prospect[] = [
  { id: "p1", name: "Rajeev Menon", score: 92, step: 3, status: "replied", lastAction: "2d ago" },
  { id: "p2", name: "Hiroshi Yamamoto", score: 87, step: 2, status: "sent", lastAction: "1d ago" },
  { id: "p3", name: "Mei Wong", score: 74, step: 3, status: "replied", lastAction: "3d ago" },
  { id: "p4", name: "Siti Nurhaliza", score: 88, step: 1, status: "sent", lastAction: "5h ago" },
  { id: "p5", name: "James Tan Wei Ming", score: 85, step: 2, status: "completed", lastAction: "1w ago" },
  { id: "p6", name: "Lakshmi Iyer", score: 90, step: 1, status: "pending", lastAction: "—" },
  { id: "p7", name: "Arjun Krishnamurthy", score: 81, step: 2, status: "sent", lastAction: "4h ago" },
  { id: "p8", name: "Priscilla Lim", score: 83, step: 3, status: "completed", lastAction: "6d ago" },
];

type StepChannel = "linkedin_connection" | "linkedin_message";
type StepMode = "automated" | "manual";

interface SequenceStep {
  step: number;
  channel: StepChannel;
  mode: StepMode;
  label: string;
  waitDays: number; // wait BEFORE this step (0 = day 0)
  body: string;
}

const SEQUENCE: SequenceStep[] = [
  {
    step: 1,
    channel: "linkedin_connection",
    mode: "manual",
    label: "LinkedIn Connection",
    waitDays: 0,
    body: "Hi {{first_name}}, I'm working on a confidential CFO mandate with a leading petrochemical group in Bangkok. Your background at {{company}} caught my eye — happy to share more if you're open?",
  },
  {
    step: 2,
    channel: "linkedin_message",
    mode: "automated",
    label: "LinkedIn Message",
    waitDays: 3,
    body: "Hi {{first_name}} — circling back on my note. The mandate is a Group CFO role reporting to the CEO, with significant M&A activity across SEA. Worth a 20-min confidential chat?",
  },
  {
    step: 3,
    channel: "linkedin_message",
    mode: "automated",
    label: "LinkedIn Message",
    waitDays: 5,
    body: "Last one from me, {{first_name}}. Closing the shortlist next week — let me know if you'd like to learn more, otherwise I'll close the loop here.",
  },
];

const CHANNEL_META: Record<StepChannel, { label: string; Icon: typeof Linkedin; iconClass: string }> = {
  linkedin_connection: { label: "LinkedIn Connection", Icon: UserPlus, iconClass: "text-[#0a66c2]" },
  linkedin_message: { label: "LinkedIn Message", Icon: Linkedin, iconClass: "text-[#0a66c2]" },
};

// ---------- Activity events ----------
type EventType =
  | "enrolled"
  | "connection_sent"
  | "wait"
  | "message_sent"
  | "replied"
  | "paused"
  | "skipped"
  | "approval_pending";

interface ActivityEvent {
  id: string;
  type: EventType;
  prospectId?: string;
  prospectName?: string;
  actor: "Amarsh Singh" | "Priya Patel" | "system";
  text: string;
  time: string;
  step?: number;
}

const EVENTS: ActivityEvent[] = [
  { id: "e1", type: "replied", prospectId: "p1", prospectName: "Rajeev Menon", actor: "system", text: "Rajeev Menon replied — sequence stopped automatically", time: "2d ago" },
  { id: "e2", type: "message_sent", prospectId: "p2", prospectName: "Hiroshi Yamamoto", actor: "Amarsh Singh", text: "LinkedIn message sent to Hiroshi Yamamoto (Step 2)", time: "1d ago", step: 2 },
  { id: "e3", type: "approval_pending", prospectId: "p6", prospectName: "Lakshmi Iyer", actor: "system", text: "Step 1 pending your approval for Lakshmi Iyer", time: "8h ago", step: 1 },
  { id: "e4", type: "connection_sent", prospectId: "p4", prospectName: "Siti Nurhaliza", actor: "Amarsh Singh", text: "Connection request sent to Siti Nurhaliza", time: "5h ago", step: 1 },
  { id: "e5", type: "message_sent", prospectId: "p7", prospectName: "Arjun Krishnamurthy", actor: "Amarsh Singh", text: "LinkedIn message sent to Arjun Krishnamurthy (Step 2)", time: "4h ago", step: 2 },
  { id: "e6", type: "wait", prospectId: "p2", prospectName: "Hiroshi Yamamoto", actor: "system", text: "Waited 3 business days for response from Hiroshi Yamamoto", time: "1d ago" },
  { id: "e7", type: "replied", prospectId: "p3", prospectName: "Mei Wong", actor: "system", text: "Mei Wong replied — sequence stopped", time: "3d ago" },
  { id: "e8", type: "message_sent", prospectId: "p5", prospectName: "James Tan Wei Ming", actor: "Amarsh Singh", text: "LinkedIn message sent to James Tan Wei Ming (Step 3)", time: "1w ago", step: 3 },
  { id: "e9", type: "skipped", prospectName: "Daniel Ho", actor: "system", text: "Skipped Daniel Ho — no LinkedIn profile on file", time: "3d ago" },
  { id: "e10", type: "enrolled", prospectId: "p7", prospectName: "Arjun Krishnamurthy", actor: "Priya Patel", text: "Priya Patel enrolled Arjun Krishnamurthy", time: "3d ago" },
  { id: "e11", type: "enrolled", prospectId: "p6", prospectName: "Lakshmi Iyer", actor: "Amarsh Singh", text: "Amarsh Singh enrolled Lakshmi Iyer", time: "9h ago" },
  { id: "e12", type: "connection_sent", prospectId: "p7", prospectName: "Arjun Krishnamurthy", actor: "Amarsh Singh", text: "Connection request sent to Arjun Krishnamurthy", time: "2d ago", step: 1 },
  { id: "e13", type: "paused", actor: "Amarsh Singh", text: "Sequence paused by Amarsh Singh (resumed 1h later)", time: "2d ago" },
  { id: "e14", type: "skipped", prospectName: "Mark Tanaka", actor: "system", text: "Skipped Mark Tanaka — no LinkedIn profile on file", time: "5d ago" },
  { id: "e15", type: "enrolled", prospectId: "p1", prospectName: "Rajeev Menon", actor: "Amarsh Singh", text: "Amarsh Singh enrolled Rajeev Menon", time: "1w ago" },
];

const EVENT_META: Record<EventType, { Icon: typeof Send; tone: string; label: string }> = {
  enrolled: { Icon: UserPlus, tone: "text-brand-primary", label: "Enrolled" },
  connection_sent: { Icon: Send, tone: "text-[#0a66c2]", label: "Connection sent" },
  wait: { Icon: Clock, tone: "text-brand-text-secondary", label: "Wait" },
  message_sent: { Icon: MessageSquare, tone: "text-[#0a66c2]", label: "Message sent" },
  replied: { Icon: CheckCircle2, tone: "text-status-success", label: "Replied" },
  paused: { Icon: Pause, tone: "text-status-warning", label: "Paused" },
  skipped: { Icon: AlertTriangle, tone: "text-status-warning", label: "Skipped" },
  approval_pending: { Icon: ShieldAlert, tone: "text-brand-primary", label: "Approval" },
};

function statusToBadge(s: ProspectStatus) {
  switch (s) {
    case "pending": return { status: "draft" as const, label: "Pending" };
    case "sent": return { status: "in_progress" as const, label: "Sent" };
    case "replied": return { status: "replied" as const, label: "Replied" };
    case "completed": return { status: "completed" as const, label: "Completed" };
    case "paused": return { status: "draft" as const, label: "Paused" };
    case "stopped": return { status: "completed" as const, label: "Stopped" };
  }
}

function highlightTokens(text: string) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) =>
    p.match(/^\{\{[^}]+\}\}$/) ? (
      <span
        key={i}
        className="rounded bg-brand-mint/50 px-1.5 py-0.5 text-xs font-medium text-brand-primary"
      >
        {p.replace(/[{}]/g, "")}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

function CampaignDetail() {
  const { id } = Route.useParams();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const project = projects.find((p) => p.id === campaign.projectId);

  const [tab, setTab] = useState<"recipients" | "sequence" | "activity" | "settings">("recipients");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [campaignPaused, setCampaignPaused] = useState(false);
  const [campaignStopped, setCampaignStopped] = useState(false);

  // dialogs
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [stopCampaignOpen, setStopCampaignOpen] = useState(false);
  const [stopProspect, setStopProspect] = useState<Prospect | null>(null);
  const [activityProspect, setActivityProspect] = useState<Prospect | null>(null);

  // activity filters
  const [eventProspect, setEventProspect] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");

  const openedPct = campaign.sent ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
  const repliedPct = campaign.sent ? Math.round((campaign.replied / campaign.sent) * 100) : 0;
  const interestedPct = campaign.sent ? Math.round((campaign.interested / campaign.sent) * 100) : 0;

  const activeCount = prospects.filter((p) => p.status === "sent" || p.status === "pending").length;
  const finishedCount = prospects.filter((p) => p.status === "replied" || p.status === "completed").length;

  const effectiveStatus = campaignStopped ? "completed" : campaignPaused ? "draft" : campaign.status;
  const effectiveStatusLabel = campaignStopped ? "Stopped" : campaignPaused ? "Paused" : undefined;

  const columns: DataTableColumn<Prospect>[] = [
    {
      key: "name",
      header: "Recipient",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <Link
          to="/candidates/$id"
          params={{ id: r.id }}
          className="font-medium text-brand-primary hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      accessor: (r) => r.score,
      render: (r) => <span className="tabular-nums font-medium">{r.score}</span>,
    },
    {
      key: "step",
      header: "Current step",
      render: (r) => {
        const s = SEQUENCE.find((x) => x.step === r.step) ?? SEQUENCE[0];
        const { Icon, iconClass } = CHANNEL_META[s.channel];
        return (
          <div className="flex items-center gap-2 text-sm">
            <Icon className={cn("h-3.5 w-3.5", iconClass)} />
            <span className="text-brand-text">Step {r.step} · {s.label}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const b = statusToBadge(r.status);
        return <StatusBadge status={b.status} label={b.label} />;
      },
    },
    {
      key: "lastAction",
      header: "Last action",
      render: (r) => <span className="text-sm text-brand-text-secondary">{r.lastAction}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-10 text-right",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setActivityProspect(r);
              }}
            >
              <Clock className="mr-2 h-4 w-4" /> View activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setProspects((prev) =>
                  prev.map((p) =>
                    p.id === r.id
                      ? { ...p, status: p.status === "paused" ? "sent" : "paused" }
                      : p,
                  ),
                );
                toast.success(
                  r.status === "paused"
                    ? `Resumed sequence for ${r.name}`
                    : `Paused sequence for ${r.name}`,
                );
              }}
            >
              <Pause className="mr-2 h-4 w-4" />
              {r.status === "paused" ? "Resume for this recipient" : "Pause for this recipient"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-status-danger focus:text-status-danger"
              onClick={() => setStopProspect(r)}
            >
              <XCircle className="mr-2 h-4 w-4" /> Stop & remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredProspects =
    statusFilter === "all" ? prospects : prospects.filter((p) => p.status === statusFilter);

  const filteredEvents = useMemo(() => {
    return EVENTS.filter((e) => {
      if (eventProspect !== "all" && e.prospectId !== eventProspect) return false;
      if (eventType !== "all" && e.type !== eventType) return false;
      return true;
    });
  }, [eventProspect, eventType]);

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={
          project
            ? `${project.title} · LinkedIn: Amarsh Singh · Started ${campaign.startedAt}`
            : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={effectiveStatus} label={effectiveStatusLabel} />
            <Button variant="outline" size="sm" onClick={() => setEnrollOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Enroll recipients
            </Button>
            {!campaignStopped && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCampaignPaused((p) => {
                    toast.success(p ? "Campaign resumed" : "Campaign paused");
                    return !p;
                  });
                }}
              >
                {campaignPaused ? (
                  <><Play className="mr-1.5 h-4 w-4" /> Resume</>
                ) : (
                  <><Pause className="mr-1.5 h-4 w-4" /> Pause</>
                )}
              </Button>
            )}
            {!campaignStopped && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setStopCampaignOpen(true)}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Stop campaign
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sent" value={campaign.sent} icon={Send} />
        <StatCard label="Opened" value={`${campaign.opened} (${openedPct}%)`} icon={MailOpen} />
        <StatCard label="Replied" value={`${campaign.replied} (${repliedPct}%)`} icon={MessageSquare} />
        <StatCard label="Interested" value={`${campaign.interested} (${interestedPct}%)`} icon={ThumbsUp} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-brand-bg/40 px-4 py-2.5 text-sm">
        <Users className="h-4 w-4 text-brand-text-secondary" />
        <span className="text-brand-text">
          <strong className="tabular-nums">{activeCount}</strong> active ·{" "}
          <strong className="tabular-nums">{finishedCount}</strong> finished /{" "}
          <strong className="tabular-nums">{prospects.length}</strong> recipients
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-brand-text-secondary">
          <Zap className="h-3.5 w-3.5 text-status-success" />
          Stop-on-reply is always on
        </span>
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {(["recipients", "sequence", "activity", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "border-b-2 border-transparent text-brand-text-secondary hover:text-brand-text",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "recipients" && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-brand-text-secondary">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable<Prospect> columns={columns} data={filteredProspects} />
          </div>
        )}

        {tab === "sequence" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-brand-text-secondary">
                {SEQUENCE.length} steps · LinkedIn-only · Stop-on-reply enforced
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/outreach/new">Edit sequence</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {SEQUENCE.map((s, i) => {
                const { Icon, iconClass } = CHANNEL_META[s.channel];
                return (
                  <div key={s.step}>
                    {i > 0 && (
                      <div className="my-2 flex items-center gap-2 pl-4 text-xs text-brand-text-secondary">
                        <div className="h-6 w-px bg-border" />
                        <Clock className="h-3.5 w-3.5" />
                        Wait {s.waitDays} business {s.waitDays === 1 ? "day" : "days"}
                        <div className="h-6 w-px bg-border" />
                      </div>
                    )}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mint/40 text-sm font-semibold text-brand-primary">
                            {s.step}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", iconClass)} />
                            <h3 className="text-sm font-semibold text-brand-text">{s.label}</h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-0 text-[10px] uppercase tracking-wide",
                                s.mode === "automated"
                                  ? "bg-brand-mint/40 text-brand-primary"
                                  : "bg-amber-100 text-amber-800",
                              )}
                            >
                              {s.mode}
                            </Badge>
                          </div>
                        </div>
                        {i === 0 && (
                          <span className="text-xs text-brand-text-secondary">Day 0</span>
                        )}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap rounded-md bg-brand-bg/60 p-3 text-sm leading-relaxed text-brand-text">
                        {highlightTokens(s.body)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-brand-text-secondary">Recipient:</span>
              <Select value={eventProspect} onValueChange={setEventProspect}>
                <SelectTrigger className="h-9 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All recipients</SelectItem>
                  {prospects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-2 text-sm text-brand-text-secondary">Event:</span>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {(Object.keys(EVENT_META) as EventType[]).map((k) => (
                    <SelectItem key={k} value={k}>{EVENT_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ActivityTimeline events={filteredEvents} />
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <SettingRow label="Tone" value="Professional, warm" />
            <SettingRow label="Send window" value="9:00 AM – 5:00 PM (GMT+7, Bangkok)" />
            <SettingRow label="Daily cap" value="20 messages per account per day" />
            <SettingRow label="Weekend sending" value="Disabled" />
            <SettingRow label="Manual approval" value="Required for step 1" />
            <SettingRow label="Stop on reply" value="Always on (non-negotiable)" icon={Zap} />
            <SettingRow label="AI personalization" value="Enabled (Claude Sonnet 4.6)" icon={Sparkles} />
            <SettingRow label="LinkedIn account" value="Amarsh Singh (warmed up)" icon={Linkedin} />
            <SettingRow label="Started" value={campaign.startedAt} icon={Calendar} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2 text-sm">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-700" />
                <div>
                  <div className="font-medium text-amber-900">Account-level kill switch</div>
                  <div className="text-amber-800">
                    Pause all outreach from the Amarsh Singh LinkedIn account across every campaign.
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Settings → Integrations — coming soon")}
              >
                Manage account
              </Button>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => toast("Edit settings — coming soon")}>
                Edit settings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enroll recipients dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll recipients</DialogTitle>
            <DialogDescription>
              Pick from the shortlist for {project?.title ?? "this project"}. Candidates without a
              LinkedIn profile on file will be skipped automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { id: "x1", name: "Daniel Ho", note: "Score 89 · ⚠ No LinkedIn on file" },
              { id: "x2", name: "Aiko Tanaka", note: "Score 86 · Shortlisted" },
              { id: "x3", name: "Vikram Reddy", note: "Score 84 · Shortlisted" },
              { id: "x4", name: "Sarah Lim", note: "Score 82 · Match >80" },
            ].map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-brand-bg/60"
              >
                <Checkbox defaultChecked={!c.note.includes("⚠")} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-brand-text">{c.name}</div>
                  <div className="text-xs text-brand-text-secondary">{c.note}</div>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setEnrollOpen(false);
                toast.success("3 recipients enrolled");
              }}
            >
              Enroll 3 recipients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop campaign confirm */}
      <AlertDialog open={stopCampaignOpen} onOpenChange={setStopCampaignOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              All in-flight steps will be cancelled. Recipients who already replied are unaffected.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCampaignStopped(true);
                setCampaignPaused(false);
                toast.success("Campaign stopped");
              }}
            >
              Stop campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop prospect confirm */}
      <AlertDialog open={!!stopProspect} onOpenChange={(o) => !o && setStopProspect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {stopProspect?.name} from the sequence?</AlertDialogTitle>
            <AlertDialogDescription>
              No further messages will be sent to this recipient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (stopProspect) {
                  setProspects((prev) =>
                    prev.map((p) =>
                      p.id === stopProspect.id ? { ...p, status: "stopped" } : p,
                    ),
                  );
                  toast.success(`${stopProspect.name} removed from sequence`);
                  setStopProspect(null);
                }
              }}
            >
              Stop & remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Per-prospect activity slide-over */}
      <Sheet open={!!activityProspect} onOpenChange={(o) => !o && setActivityProspect(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{activityProspect?.name}</SheetTitle>
            <SheetDescription>Activity in this campaign</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ActivityTimeline
              events={EVENTS.filter((e) => e.prospectId === activityProspect?.id)}
              compact
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ActivityTimeline({ events, compact }: { events: ActivityEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-brand-text-secondary">
        No activity yet.
      </div>
    );
  }
  return (
    <ol className="relative space-y-3">
      {events.map((e) => {
        const meta = EVENT_META[e.type];
        const Icon = meta.Icon;
        const isSystem = e.actor === "system";
        return (
          <li
            key={e.id}
            className="flex gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-bg",
                meta.tone,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-brand-text">{e.text}</p>
                <span className="shrink-0 text-xs text-brand-text-secondary">{e.time}</span>
              </div>
              {!compact && (
                <div className="mt-1.5 flex items-center gap-2">
                  {isSystem ? (
                    <Badge variant="outline" className="border-0 bg-brand-mint/40 text-[10px] uppercase tracking-wide text-brand-primary">
                      <Sparkles className="mr-1 h-3 w-3" /> Syndie
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-brand-primary text-[10px] text-white">
                          {initials(e.actor)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-brand-text-secondary">{e.actor}</span>
                    </div>
                  )}
                  {e.type === "approval_pending" && (
                    <Link
                      to="/approvals"
                      className="text-xs font-medium text-brand-primary hover:underline"
                    >
                      Review →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function SettingRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <dt className="flex items-center gap-2 text-sm text-brand-text-secondary">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-text">{value}</dd>
    </div>
  );
}
