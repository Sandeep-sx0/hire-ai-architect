import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Archive,
  GitBranch,
  Mail,
  MessageCircle,
  Linkedin,
  MoreHorizontal,
  Paperclip,
  Pause,
  PenLine,
  Phone,
  Play,
  Plus,
  ShieldAlert,
  Sparkles,
  ListPlus,
  Trash2,
  Users,
  X,
  Eye,
  CircleSlash,
  CheckCircle2,
  AlertCircle,
  History,
  Send,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusBadge, EmptyState } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  campaigns,
  projects,
  jobs as allJobs,
  clients as allClients,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/campaigns/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Campaign ${params.id} — Norvex` }],
  }),
  component: CampaignDetailPage,
  notFoundComponent: () => <CampaignNotFound />,
  errorComponent: () => <CampaignNotFound />,
});

// ─────────────────────────────────────────────────────────
// Types & mock data
// ─────────────────────────────────────────────────────────
type Channel = "linkedin_connect" | "linkedin_message" | "email" | "whatsapp" | "task" | "call";

interface SequenceStep {
  id: string;
  channel: Channel;
  title: string;
  waitAfterDays: number; // for connector above this step
  subject?: string;
  body: string;
  attachments?: string[];
  signature?: string;
  threadedReply?: boolean;
  branchCondition?: string; // e.g. "if connection accepted"
  branchKind?: "if_accepted" | "if_no_reply" | "if_no_channel";
}

type RecipientStatus =
  | "pending_approval"
  | "sent"
  | "delivered"
  | "accepted"
  | "replied"
  | "bounced"
  | "stopped_on_reply"
  | "excluded_dnc"
  | "missing_channel";

interface Recipient {
  id: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  matchScore: number;
  currentStep: number;
  currentChannel: Channel;
  status: RecipientStatus;
  missingChannel?: "linkedin" | "whatsapp";
  nextActionAt?: string;
  nextActionChannel?: Channel;
  enrolledBy?: string;
  enrolledAt?: string;
}

interface TimelineEvent {
  at: string;
  channel?: Channel;
  text: string;
  author?: string;
  systemNote?: boolean;
  toneRed?: boolean;
}

const channelMeta: Record<
  Channel,
  { label: string; Icon: typeof Mail; bg: string; chip: string; dot: string }
> = {
  linkedin_connect: {
    label: "LinkedIn connect",
    Icon: Linkedin,
    bg: "bg-[#0a66c2]",
    chip: "bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20",
    dot: "bg-[#0a66c2]",
  },
  linkedin_message: {
    label: "LinkedIn message",
    Icon: Linkedin,
    bg: "bg-[#0a66c2]",
    chip: "bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20",
    dot: "bg-[#0a66c2]",
  },
  email: {
    label: "Email",
    Icon: Mail,
    bg: "bg-brand-primary",
    chip: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    dot: "bg-brand-primary",
  },
  whatsapp: {
    label: "WhatsApp",
    Icon: MessageCircle,
    bg: "bg-[#25D366]",
    chip: "bg-[#25D366]/15 text-[#128C7E] border-[#25D366]/30",
    dot: "bg-[#25D366]",
  },
  task: {
    label: "General task",
    Icon: ListPlus,
    bg: "bg-slate-600",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-600",
  },
  call: {
    label: "Phone call",
    Icon: Phone,
    bg: "bg-amber-600",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-600",
  },
};

const recipientStatusMeta: Record<
  RecipientStatus,
  { label: string; cls: string }
> = {
  pending_approval: {
    label: "Pending approval",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  sent: { label: "Sent", cls: "bg-status-info/15 text-status-info border-status-info/20" },
  delivered: {
    label: "Delivered",
    cls: "bg-status-info/15 text-status-info border-status-info/20",
  },
  accepted: {
    label: "Accepted",
    cls: "bg-status-success/15 text-status-success border-status-success/30",
  },
  replied: {
    label: "Replied",
    cls: "bg-status-success/15 text-status-success border-status-success/30",
  },
  bounced: {
    label: "Bounced",
    cls: "bg-status-danger/15 text-status-danger border-status-danger/30",
  },
  stopped_on_reply: {
    label: "Stopped on reply",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  excluded_dnc: {
    label: "Do not contact",
    cls: "bg-status-danger/15 text-status-danger border-status-danger/30",
  },
  missing_channel: {
    label: "Missing channel",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
};

const DEFAULT_SEQUENCE: SequenceStep[] = [
  {
    id: "s1",
    channel: "linkedin_connect",
    title: "Connection request",
    waitAfterDays: 0,
    body:
      "Hi {Recipient > First Name} — I lead exec finance search for SEA. {AI > opener} Would love to connect.",
  },
  {
    id: "s2",
    channel: "linkedin_message",
    title: "Intro message",
    waitAfterDays: 2,
    branchCondition: "if connection accepted",
    branchKind: "if_accepted",
    body:
      "Thanks for connecting, {Recipient > First Name}. {AI > why-fit} — open to a confidential conversation?",
  },
  {
    id: "s2b",
    channel: "email",
    title: "Intro email (no LinkedIn)",
    waitAfterDays: 2,
    branchCondition: "if no LinkedIn channel",
    branchKind: "if_no_channel",
    subject: "Confidential — CFO opportunity at {Recipient > Company}",
    body:
      "Hi {Recipient > First Name},\n\n{AI > opener}\n\n{AI > why-fit}\n\nFind {Candidate > First Name}'s CV attached for context.\n\nBest,\nDewi",
    attachments: ["Rina_Wijaya_CV_2026.pdf"],
    signature: "Dewi — Norvex Solutions",
    threadedReply: false,
  },
  {
    id: "s3",
    channel: "whatsapp",
    title: "WhatsApp nudge",
    waitAfterDays: 3,
    branchCondition: "if WhatsApp available, no reply after 2d",
    branchKind: "if_no_reply",
    body:
      "Hi {Recipient > First Name}, this is Dewi from Norvex. Following up on my note — happy to share more on the role when you have 10 min.",
  },
  {
    id: "s4",
    channel: "email",
    title: "Follow-up email",
    waitAfterDays: 4,
    branchKind: "if_no_reply",
    branchCondition: "if no reply after 4d",
    subject: "Re: Confidential — CFO opportunity",
    body:
      "Hi {Recipient > First Name}, bumping this in case it slipped. {AI > why-fit}.\n\nWorth a quick chat?",
    signature: "Dewi — Norvex Solutions",
    threadedReply: true,
  },
];

const SAMPLE_RECIPIENTS: Recipient[] = [
  {
    id: "r1",
    name: "Rina Wijaya",
    title: "CFO",
    company: "PT Telkom Indonesia",
    initials: "RW",
    matchScore: 94,
    currentStep: 2,
    currentChannel: "linkedin_message",
    status: "replied",
    nextActionAt: "—",
    nextActionChannel: undefined,
    enrolledBy: "Dewi",
    enrolledAt: "May 14, 2026",
  },
  {
    id: "r2",
    name: "Budi Santoso",
    title: "VP Finance",
    company: "Astra International",
    initials: "BS",
    matchScore: 88,
    currentStep: 2,
    currentChannel: "linkedin_message",
    status: "pending_approval",
    nextActionAt: "Today, 10:30 AM",
    nextActionChannel: "linkedin_message",
    enrolledBy: "Dewi",
    enrolledAt: "May 14, 2026",
  },
  {
    id: "r3",
    name: "James Chen",
    title: "Finance Director",
    company: "Wilmar International",
    initials: "JC",
    matchScore: 86,
    currentStep: 3,
    currentChannel: "whatsapp",
    status: "missing_channel",
    missingChannel: "whatsapp",
    nextActionAt: "Tomorrow, 9:00 AM",
    nextActionChannel: "email",
    enrolledBy: "Dewi",
    enrolledAt: "May 14, 2026",
  },
  {
    id: "r4",
    name: "Sari Indriani",
    title: "Group CFO",
    company: "Indofood",
    initials: "SI",
    matchScore: 91,
    currentStep: 1,
    currentChannel: "linkedin_connect",
    status: "accepted",
    nextActionAt: "May 21, 11:00 AM",
    nextActionChannel: "linkedin_message",
    enrolledBy: "Dewi",
    enrolledAt: "May 15, 2026",
  },
  {
    id: "r5",
    name: "Andre Halim",
    title: "Finance Director",
    company: "Gojek",
    initials: "AH",
    matchScore: 82,
    currentStep: 4,
    currentChannel: "email",
    status: "sent",
    nextActionAt: "May 22, 2:00 PM",
    nextActionChannel: "email",
    enrolledBy: "Dewi",
    enrolledAt: "May 12, 2026",
  },
  {
    id: "r6",
    name: "Maria Pangestu",
    title: "Head of Finance",
    company: "Bukalapak",
    initials: "MP",
    matchScore: 79,
    currentStep: 0,
    currentChannel: "linkedin_connect",
    status: "excluded_dnc",
    enrolledBy: "Dewi",
    enrolledAt: "May 14, 2026",
  },
  {
    id: "r7",
    name: "Kenji Tanaka",
    title: "CFO Asia",
    company: "Mizuho Indonesia",
    initials: "KT",
    matchScore: 84,
    currentStep: 2,
    currentChannel: "email",
    status: "bounced",
    enrolledBy: "Dewi",
    enrolledAt: "May 13, 2026",
  },
  {
    id: "r8",
    name: "Maya Putri",
    title: "VP Finance",
    company: "Tokopedia",
    initials: "MP",
    matchScore: 87,
    currentStep: 3,
    currentChannel: "whatsapp",
    status: "delivered",
    nextActionAt: "May 23, 9:30 AM",
    nextActionChannel: "email",
    enrolledBy: "Dewi",
    enrolledAt: "May 13, 2026",
  },
];

const SAMPLE_TIMELINE: Record<string, TimelineEvent[]> = {
  r1: [
    { at: "May 14, 2026 · 9:02 AM", text: "Enrolled by Dewi", author: "Dewi", channel: undefined },
    { at: "May 14, 2026 · 10:14 AM", channel: "linkedin_connect", text: "Connection request sent (LinkedIn · Dewi)", author: "Dewi" },
    { at: "May 15, 2026 · 4:31 PM", channel: "linkedin_connect", text: "Connection accepted", systemNote: true },
    { at: "May 16, 2026 · 11:00 AM", text: "Waited 2 business days", systemNote: true },
    { at: "May 18, 2026 · 11:08 AM", channel: "linkedin_message", text: "Intro message sent (LinkedIn · Dewi)", author: "Dewi" },
    { at: "May 18, 2026 · 6:42 PM", channel: "linkedin_message", text: "Reply received — sequence stopped on reply", systemNote: true },
  ],
  r3: [
    { at: "May 14, 2026 · 9:04 AM", text: "Enrolled by Dewi", author: "Dewi" },
    { at: "May 14, 2026 · 10:15 AM", channel: "linkedin_connect", text: "Connection request sent (LinkedIn · Dewi)", author: "Dewi" },
    { at: "May 15, 2026 · 2:20 PM", channel: "linkedin_connect", text: "Connection accepted", systemNote: true },
    { at: "May 17, 2026 · 11:08 AM", channel: "linkedin_message", text: "Intro message sent", author: "Dewi" },
    { at: "May 19, 2026 · 9:00 AM", text: "Skipped WhatsApp step — no WhatsApp number on profile", systemNote: true, toneRed: true },
    { at: "May 19, 2026 · 9:01 AM", text: "Routed to Email follow-up branch", systemNote: true },
  ],
};

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
function CampaignDetailPage() {
  const { id } = Route.useParams();
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign) return <CampaignNotFound id={id} />;

  const project = projects.find((p) => p.id === campaign.projectId);
  const client = project ? allClients.find((c) => c.id === project.clientId) : undefined;
  const attachedJob = allJobs.find((j) => j.projectId === campaign.projectId);

  const [name, setName] = useState(campaign.name);
  const [editingName, setEditingName] = useState(false);
  const [status, setStatus] = useState(campaign.status);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-brand-text-secondary">
        {attachedJob && project ? (
          <>
            <Link to="/jobs" className="hover:text-brand-primary">Jobs</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/jobs/$id" params={{ id: attachedJob.id }} className="hover:text-brand-primary">
              {attachedJob.jobTitle}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        ) : null}
        <Link to="/outreach" className="hover:text-brand-primary">Campaigns</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-text">{name}</span>
      </nav>

      {/* Header */}
      <header className="rounded-xl border border-gray-100 bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {editingName ? (
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  className="text-[20px] font-semibold h-9 max-w-[640px]"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group flex items-center gap-2 text-left"
                >
                  <h1 className="text-[20px] font-semibold text-brand-text leading-tight">
                    {name}
                  </h1>
                  <PenLine className="h-3.5 w-3.5 text-brand-text-secondary opacity-0 group-hover:opacity-100 transition" />
                </button>
              )}
              <StatusBadge status={status} />
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[12px] text-brand-text-secondary flex-wrap">
              {attachedJob && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <Link
                    to="/jobs/$id"
                    params={{ id: attachedJob.id }}
                    className="text-brand-primary hover:underline"
                  >
                    {attachedJob.jobTitle}
                  </Link>
                </span>
              )}
              {client && (
                <span>
                  Client: <span className="text-brand-text">{client.name}</span>
                </span>
              )}
              <span>Started {campaign.startedAt}</span>
              <span>Owner: Dewi Anggraini</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === "active" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("paused");
                  toast("Campaign paused");
                }}
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                className="bg-brand-primary text-white hover:bg-brand-primary/90"
                onClick={() => {
                  setStatus("active");
                  toast.success(status === "draft" ? "Campaign started" : "Campaign resumed");
                }}
              >
                <Play className="h-4 w-4" />
                {status === "draft" ? "Start campaign" : "Resume"}
              </Button>
            )}
            <Button variant="outline" onClick={() => toast("Open enrolment drawer")}>
              <Users className="h-4 w-4" />
              Enroll recipients
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast("Campaign duplicated")}>
                  <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Campaign archived")}>
                  <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-status-danger"
                  onClick={() => toast.error("Campaign deleted")}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sending identities strip */}
        <div className="mt-4 flex flex-wrap items-stretch gap-2">
          <IdentityChip
            channel="linkedin_message"
            label="Dewi Anggraini"
            sub="LinkedIn · Unipile"
            extra={<span className="text-[11px] text-brand-text-secondary">Today 7/15</span>}
            badge={<WarmupBadge day={5} />}
          />
          <IdentityChip
            channel="email"
            label="dewi@norvexsolutions.com"
            sub="Gmail · default"
            extra={
              <Badge className="bg-brand-mint/30 text-brand-primary border-transparent text-[10px]">
                default
              </Badge>
            }
          />
          <IdentityChip
            channel="whatsapp"
            label="+62 811 9000 220"
            sub="WhatsApp Business · verified"
          />
          <div className="ml-auto flex items-center gap-2">
            <KillSwitchPopover />
          </div>
        </div>
      </header>

      {/* Safety banner */}
      <SafetyBanner />

      {/* Tabs */}
      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList className="bg-brand-bg p-1 h-10">
          <TabsTrigger value="editor" className="data-[state=active]:bg-card px-4">
            Editor
          </TabsTrigger>
          <TabsTrigger value="recipients" className="data-[state=active]:bg-card px-4">
            Recipients
            <Badge className="ml-2 bg-brand-primary text-white border-transparent text-[10px]">
              {SAMPLE_RECIPIENTS.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-0">
          <EditorTab />
        </TabsContent>
        <TabsContent value="recipients" className="mt-0">
          <RecipientsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Header pieces
// ─────────────────────────────────────────────────────────
function IdentityChip({
  channel,
  label,
  sub,
  extra,
  badge,
}: {
  channel: Channel;
  label: string;
  sub: string;
  extra?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const m = channelMeta[channel];
  const Icon = m.Icon;
  return (
    <button className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-card px-3 py-2 hover:border-brand-primary/40 transition">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", m.bg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="text-[12px] font-medium text-brand-text leading-tight">{label}</p>
        <p className="text-[10.5px] text-brand-text-secondary leading-tight">{sub}</p>
      </div>
      <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
        {extra}
        {badge}
        <ChevronDown className="h-3 w-3 text-brand-text-secondary" />
      </div>
    </button>
  );
}

function WarmupBadge({ day }: { day: number }) {
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
      Warmup day {day}/7
    </Badge>
  );
}

function KillSwitchPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-status-danger border-status-danger/30 hover:bg-status-danger/5">
          <ShieldAlert className="h-4 w-4" />
          Kill switches
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-brand-text">Three-level kill switches</p>
          <p className="text-[11px] text-brand-text-secondary mt-0.5">
            Stop sending at any scope. Nothing goes out automatically.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          <KillRow label="Prospect" desc="Pause any specific recipient" />
          <KillRow label="Campaign" desc="Pause this entire campaign across all channels" />
          <KillRow label="Sending account" desc="Stop all sends from a LinkedIn / mailbox / WhatsApp number" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KillRow({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <p className="text-[13px] font-medium text-brand-text">{label}</p>
        <p className="text-[11px] text-brand-text-secondary">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

function SafetyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-mint/40 bg-brand-mint/10 px-4 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white shrink-0">
        <ShieldAlert className="h-4 w-4" />
      </div>
      <div className="text-[12.5px] text-brand-text leading-relaxed">
        <span className="font-semibold">AI drafts. You approve and send.</span>{" "}
        First 50 sends per channel require manual approval. Stop-on-reply is always on.{" "}
        <span className="text-brand-text-secondary">
          Nothing goes out automatically — on any channel.
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Editor tab
// ─────────────────────────────────────────────────────────
function EditorTab() {
  const [steps, setSteps] = useState<SequenceStep[]>(DEFAULT_SEQUENCE);
  const [startDelay, setStartDelay] = useState(0);
  const [activeStepId, setActiveStepId] = useState<string | null>(steps[1]?.id ?? null);

  const active = steps.find((s) => s.id === activeStepId) ?? steps[0];

  const updateStep = (next: SequenceStep) =>
    setSteps((prev) => prev.map((s) => (s.id === next.id ? next : s)));

  const addStep = (channel: Channel) => {
    const id = `s${Date.now()}`;
    const meta = channelMeta[channel];
    const newStep: SequenceStep = {
      id,
      channel,
      title: meta.label,
      waitAfterDays: 2,
      body: "",
      subject: channel === "email" ? "" : undefined,
    };
    setSteps([...steps, newStep]);
    setActiveStepId(id);
  };

  return (
    <div className="grid grid-cols-[420px_1fr] gap-5">
      {/* LEFT: Sequence visualization */}
      <div className="rounded-xl border border-gray-100 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-brand-text">Sequence</h3>
          <span className="text-[11px] text-brand-text-secondary">
            {steps.length} steps · multi-channel
          </span>
        </div>

        {/* Start trigger */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-brand-bg/40 px-3 py-2 mb-2">
          <Clock className="h-3.5 w-3.5 text-brand-text-secondary" />
          <span className="text-[12px] text-brand-text">Start</span>
          <Input
            type="number"
            value={startDelay}
            onChange={(e) => setStartDelay(Number(e.target.value) || 0)}
            className="h-7 w-14 text-[12px]"
          />
          <span className="text-[12px] text-brand-text-secondary">business days after enrollment</span>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.id}>
              {i > 0 && <WaitConnector step={step} onChange={updateStep} />}
              <StepCard
                step={step}
                index={i + 1}
                active={step.id === active?.id}
                onSelect={() => setActiveStepId(step.id)}
                onRemove={() => {
                  setSteps((prev) => prev.filter((s) => s.id !== step.id));
                  if (active?.id === step.id) setActiveStepId(steps[0]?.id ?? null);
                }}
              />
            </div>
          ))}
        </div>

        <AddStepMenu onAdd={addStep} />
      </div>

      {/* RIGHT: Step editor */}
      <div className="rounded-xl border border-gray-100 bg-card">
        {active ? (
          <StepEditor key={active.id} step={active} onChange={updateStep} />
        ) : (
          <div className="p-10">
            <EmptyState
              icon={Sparkles}
              title="No step selected"
              description="Add a step to start building your sequence."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function WaitConnector({
  step,
  onChange,
}: {
  step: SequenceStep;
  onChange: (s: SequenceStep) => void;
}) {
  return (
    <div className="flex items-center gap-2 pl-6 py-1.5">
      <div className="h-5 w-px bg-gray-200" />
      <div className="flex items-center gap-1.5 text-[11px] text-brand-text-secondary">
        <Clock className="h-3 w-3" />
        Wait
        <Input
          type="number"
          value={step.waitAfterDays}
          onChange={(e) =>
            onChange({ ...step, waitAfterDays: Number(e.target.value) || 0 })
          }
          className="h-6 w-12 text-[11px]"
        />
        business days
        {step.branchCondition && (
          <span className="inline-flex items-center gap-1 ml-2 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            <GitBranch className="h-3 w-3" />
            {step.branchCondition}
          </span>
        )}
      </div>
    </div>
  );
}

function StepCard({
  step,
  index,
  active,
  onSelect,
  onRemove,
}: {
  step: SequenceStep;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const m = channelMeta[step.channel];
  const Icon = m.Icon;
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-lg border px-3 py-2.5 flex items-center gap-3 transition",
        active
          ? "border-brand-primary bg-brand-seafoam/20 shadow-sm"
          : "border-gray-100 hover:border-brand-primary/40 hover:bg-brand-bg/40",
      )}
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white shrink-0", m.bg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-brand-text-secondary">#{index}</span>
          <p className="text-[13px] font-medium text-brand-text truncate">{step.title}</p>
        </div>
        <p className="text-[11px] text-brand-text-secondary truncate">
          {step.channel === "email" && step.subject ? `Subject: ${step.subject}` : step.body.slice(0, 60)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 transition text-brand-text-secondary hover:text-status-danger"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AddStepMenu({ onAdd }: { onAdd: (c: Channel) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2.5 text-[12px] text-brand-primary hover:border-brand-primary hover:bg-brand-mint/10 transition">
          <Plus className="h-4 w-4" />
          Add step to sequence
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
          Choose a channel
        </DropdownMenuLabel>
        {(
          [
            "email",
            "whatsapp",
            "linkedin_message",
            "linkedin_connect",
            "task",
            "call",
          ] as Channel[]
        ).map((c) => {
          const m = channelMeta[c];
          const Icon = m.Icon;
          return (
            <DropdownMenuItem key={c} onClick={() => onAdd(c)} className="gap-2 py-2">
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white", m.bg)}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-[13px]">{m.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────────────────
// Step editor pane
// ─────────────────────────────────────────────────────────
const TOKENS: { group: string; tokens: { token: string; tone: "recipient" | "candidate" | "ai" }[] }[] = [
  {
    group: "Recipient",
    tokens: [
      { token: "{Recipient > First Name}", tone: "recipient" },
      { token: "{Recipient > Last Name}", tone: "recipient" },
      { token: "{Recipient > Company}", tone: "recipient" },
      { token: "{Recipient > Title}", tone: "recipient" },
    ],
  },
  {
    group: "Candidate (when pitching to client)",
    tokens: [
      { token: "{Candidate > First Name}", tone: "candidate" },
      { token: "{Candidate > Last Name}", tone: "candidate" },
    ],
  },
  {
    group: "AI",
    tokens: [
      { token: "{AI > opener}", tone: "ai" },
      { token: "{AI > why-fit}", tone: "ai" },
    ],
  },
];

const TONE_COLORS: Record<string, string> = {
  recipient: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  candidate: "bg-brand-mint/40 text-brand-primary border-brand-mint",
  ai: "bg-status-ai/15 text-status-ai border-status-ai/30",
};

function StepEditor({
  step,
  onChange,
}: {
  step: SequenceStep;
  onChange: (s: SequenceStep) => void;
}) {
  const [tone, setTone] = useState("professional");
  const [preview, setPreview] = useState(0);
  const m = channelMeta[step.channel];
  const Icon = m.Icon;

  const insertToken = (token: string) => {
    onChange({ ...step, body: step.body + (step.body.endsWith(" ") ? "" : " ") + token + " " });
  };

  const handleDraftAI = () => {
    toast.success(`Drafting with Claude Sonnet 4.6 (${tone})…`);
    setTimeout(() => {
      if (step.channel === "email" && !step.subject) {
        onChange({
          ...step,
          subject: "Confidential — CFO opportunity at {Recipient > Company}",
          body:
            "Hi {Recipient > First Name},\n\n{AI > opener}\n\n{AI > why-fit}\n\nOpen to a confidential conversation?\n\nBest,\nDewi",
        });
      } else {
        onChange({
          ...step,
          body:
            "Hi {Recipient > First Name}, {AI > opener} {AI > why-fit} — would love to share more.",
        });
      }
    }, 800);
  };

  const isMessage =
    step.channel === "email" ||
    step.channel === "whatsapp" ||
    step.channel === "linkedin_message" ||
    step.channel === "linkedin_connect";

  if (step.channel === "task" || step.channel === "call") {
    return (
      <ManualStepEditor step={step} onChange={onChange} />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", m.bg)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <Input
              value={step.title}
              onChange={(e) => onChange({ ...step, title: e.target.value })}
              className="h-7 text-[14px] font-semibold border-transparent px-0 -mx-0 focus-visible:border-input"
            />
            <p className="text-[11px] text-brand-text-secondary">{m.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="h-8 w-[140px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleDraftAI}
            className="bg-status-ai text-white hover:bg-status-ai/90 h-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Draft with AI
          </Button>
        </div>
      </div>

      {/* Branch banner */}
      {step.branchCondition && (
        <div className="border-b border-gray-100 px-5 py-2 bg-amber-50/50 flex items-center gap-2 text-[12px] text-amber-800">
          <GitBranch className="h-3.5 w-3.5" />
          Conditional: <span className="font-medium">{step.branchCondition}</span>
        </div>
      )}

      {/* Editor body */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        {step.channel === "email" && (
          <div>
            <label className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
              Subject
            </label>
            <Input
              value={step.subject ?? ""}
              onChange={(e) => onChange({ ...step, subject: e.target.value })}
              placeholder="Subject line…"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
              {step.channel === "linkedin_connect" ? "Connection note" : "Message body"}
            </label>
            <TokenMenu onInsert={insertToken} />
          </div>
          <TokenAwareTextarea
            value={step.body}
            onChange={(v) => onChange({ ...step, body: v })}
            rows={step.channel === "linkedin_connect" ? 4 : 9}
            maxLength={step.channel === "linkedin_connect" ? 300 : undefined}
          />
          {step.channel === "linkedin_connect" && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-brand-text-secondary">
              <span>LinkedIn connection notes are limited to 300 characters.</span>
              <span
                className={cn(
                  step.body.length > 280 && "text-status-danger font-medium",
                )}
              >
                {step.body.length} / 300
              </span>
            </div>
          )}
          {step.channel === "whatsapp" && (
            <p className="mt-1 text-[11px] text-brand-text-secondary">
              WhatsApp Business templates may be required for the first message to a new contact.
            </p>
          )}
        </div>

        {step.channel === "email" && (
          <>
            <div className="rounded-lg border border-gray-100 bg-brand-bg/30 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[12px] text-brand-text">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="font-medium">Attachments</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(step.attachments ?? []).map((a) => (
                  <Badge key={a} variant="outline" className="gap-1">
                    {a}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        onChange({
                          ...step,
                          attachments: step.attachments?.filter((x) => x !== a),
                        })
                      }
                    />
                  </Badge>
                ))}
                <button
                  className="text-[11px] text-brand-primary hover:underline"
                  onClick={() =>
                    onChange({
                      ...step,
                      attachments: [...(step.attachments ?? []), "Candidate_CV.pdf"],
                    })
                  }
                >
                  + Attach candidate CV
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-brand-text-secondary italic">
                Tip: when pitching a candidate to a hiring contact, attach the CV and reference
                "Find {`{Candidate > First Name}`}'s CV attached" in the body.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
                  Signature
                </label>
                <Select
                  value={step.signature ?? "default"}
                  onValueChange={(v) => onChange({ ...step, signature: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Norvex branded — Dewi</SelectItem>
                    <SelectItem value="short">Short text — Dewi</SelectItem>
                    <SelectItem value="none">No signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-[12px] text-brand-text">
                  <Switch
                    checked={step.threadedReply ?? false}
                    onCheckedChange={(v) => onChange({ ...step, threadedReply: v })}
                  />
                  Send as reply to previous thread
                </label>
              </div>
            </div>
          </>
        )}

        {/* Per-recipient preview */}
        {isMessage && (
          <PreviewBlock body={step.body} subject={step.subject} preview={preview} setPreview={setPreview} />
        )}
      </div>
    </div>
  );
}

function ManualStepEditor({
  step,
  onChange,
}: {
  step: SequenceStep;
  onChange: (s: SequenceStep) => void;
}) {
  const m = channelMeta[step.channel];
  const Icon = m.Icon;
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", m.bg)}>
          <Icon className="h-4 w-4" />
        </div>
        <Input
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          className="h-8 max-w-[400px]"
        />
      </div>
      <p className="text-[12px] text-brand-text-secondary mb-3">
        Manual step — no message sent. Recruiter completes the task and marks it done.
      </p>
      <Textarea
        rows={6}
        value={step.body}
        onChange={(e) => onChange({ ...step, body: e.target.value })}
        placeholder={
          step.channel === "call"
            ? "Call script / talking points…"
            : "Task instructions…"
        }
      />
    </div>
  );
}

function TokenMenu({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-[11px]">
          <Sparkles className="h-3 w-3 text-status-ai" />
          Insert variable
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {TOKENS.map((g) => (
          <div key={g.group} className="py-1">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-brand-text-secondary">
              {g.group}
            </DropdownMenuLabel>
            {g.tokens.map((t) => (
              <DropdownMenuItem
                key={t.token}
                onClick={() => onInsert(t.token)}
                className="text-[12px] font-mono py-1.5"
              >
                <span className={cn("inline-block px-1.5 py-0.5 rounded text-[11px] border", TONE_COLORS[t.tone])}>
                  {t.token}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-brand-text-secondary">
          Tip: type <span className="font-mono">{`{`}</span> to open this menu inline.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TokenAwareTextarea({
  value,
  onChange,
  rows,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
  maxLength?: number;
}) {
  return (
    <div className="rounded-md border border-input overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 bg-brand-bg/30 flex flex-wrap gap-1 min-h-[28px]">
        {renderTokensInline(value)}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className="border-0 rounded-none font-mono text-[12px] resize-none focus-visible:ring-0"
        placeholder="Write your message — type { to insert a variable…"
      />
    </div>
  );
}

function renderTokensInline(text: string) {
  // Render colored chips for any {Group > Field} pattern
  const parts: React.ReactNode[] = [];
  const regex = /\{([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      const txt = text.slice(last, m.index);
      if (txt.trim())
        parts.push(
          <span key={`t-${key++}`} className="text-[11px] text-brand-text-secondary">
            {txt.trim().slice(0, 12)}
            {txt.trim().length > 12 ? "…" : ""}
          </span>,
        );
    }
    const inner = m[1];
    const tone = inner.startsWith("AI")
      ? "ai"
      : inner.startsWith("Candidate")
        ? "candidate"
        : "recipient";
    parts.push(
      <span
        key={`tok-${key++}`}
        className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-mono", TONE_COLORS[tone])}
      >
        {`{${inner}}`}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (parts.length === 0)
    return (
      <span className="text-[11px] text-brand-text-secondary italic">
        Variables in your message will appear here as colored chips.
      </span>
    );
  return parts;
}

const previewRecipients = [
  { name: "Rina Wijaya", first: "Rina", company: "PT Telkom Indonesia", title: "CFO" },
  { name: "Budi Santoso", first: "Budi", company: "Astra International", title: "VP Finance" },
  { name: "James Chen", first: "James", company: "Wilmar International", title: "Finance Director" },
];

function PreviewBlock({
  body,
  subject,
  preview,
  setPreview,
}: {
  body: string;
  subject?: string;
  preview: number;
  setPreview: (n: number) => void;
}) {
  const r = previewRecipients[preview % previewRecipients.length];
  const render = (s: string) =>
    s
      .replaceAll("{Recipient > First Name}", r.first)
      .replaceAll("{Recipient > Last Name}", r.name.split(" ")[1] ?? "")
      .replaceAll("{Recipient > Company}", r.company)
      .replaceAll("{Recipient > Title}", r.title)
      .replaceAll("{Candidate > First Name}", "Rina")
      .replaceAll("{Candidate > Last Name}", "Wijaya")
      .replaceAll(
        "{AI > opener}",
        "I saw your recent move into group treasury at " + r.company + " — impressive trajectory.",
      )
      .replaceAll(
        "{AI > why-fit}",
        "Your IFRS + M&A profile maps tightly to a confidential CFO mandate I'm running with a listed SEA conglomerate",
      );

  return (
    <div className="rounded-lg border border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 bg-brand-bg/40">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-brand-text-secondary" />
          <p className="text-[11px] font-medium text-brand-text">
            Preview for {r.name}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPreview(preview - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-brand-text-secondary tabular-nums">
            {(preview % previewRecipients.length) + 1} / {previewRecipients.length}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPreview(preview + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="p-3 text-[12.5px] text-brand-text whitespace-pre-wrap leading-relaxed">
        {subject && (
          <p className="mb-2 pb-2 border-b border-gray-100">
            <span className="text-[10px] uppercase tracking-wide text-brand-text-secondary mr-2">
              Subject
            </span>
            {render(subject)}
          </p>
        )}
        {render(body) || (
          <span className="italic text-brand-text-secondary">Empty message body.</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Recipients tab
// ─────────────────────────────────────────────────────────
function RecipientsTab() {
  const [openTimeline, setOpenTimeline] = useState<Recipient | null>(null);
  const stats = useMemo(() => {
    const total = SAMPLE_RECIPIENTS.length;
    const awaiting = SAMPLE_RECIPIENTS.filter((r) => r.status === "pending_approval").length;
    const sent = SAMPLE_RECIPIENTS.filter((r) =>
      ["sent", "delivered", "accepted", "replied"].includes(r.status),
    ).length;
    const replied = SAMPLE_RECIPIENTS.filter((r) => r.status === "replied").length;
    const completed = SAMPLE_RECIPIENTS.filter((r) =>
      ["replied", "stopped_on_reply", "bounced", "excluded_dnc"].includes(r.status),
    ).length;
    const active = total - completed;
    return { total, awaiting, sent, replied, completed, active };
  }, []);

  const replyRate = stats.sent > 0 ? Math.round((stats.replied / stats.sent) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2">
        <StatCard label="Total enrolled" value={String(stats.total)} />
        <StatCard label="Awaiting approval" value={String(stats.awaiting)} tone="warning" />
        <StatCard label="Sent" value={String(stats.sent)} />
        <StatCard
          label="Replied"
          value={`${stats.replied} · ${replyRate}%`}
          tone="success"
        />
        <StatCard label="Completed" value={String(stats.completed)} tone="muted" />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-brand-bg/40 px-4 py-2">
        <p className="text-[12px] text-brand-text">
          <span className="font-semibold">Total Active 500</span> ·{" "}
          <span className="text-brand-text-secondary">84 Finished / 584 Recipients</span>
        </p>
        <div className="flex items-center gap-2">
          <AccountCapWarning />
          <Button variant="outline" size="sm">
            <Users className="h-3.5 w-3.5" />
            Enroll recipients
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg/60 text-[11px] uppercase tracking-wide text-brand-text-secondary">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Candidate</th>
              <th className="px-3 py-2.5 text-left font-medium">Match</th>
              <th className="px-3 py-2.5 text-left font-medium">Current step</th>
              <th className="px-3 py-2.5 text-left font-medium">Status</th>
              <th className="px-3 py-2.5 text-left font-medium">Next scheduled</th>
              <th className="px-3 py-2.5 text-right font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SAMPLE_RECIPIENTS.map((r) => (
              <RecipientRow
                key={r.id}
                r={r}
                onOpenTimeline={() => setOpenTimeline(r)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <RecipientTimelineSheet
        recipient={openTimeline}
        onClose={() => setOpenTimeline(null)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const toneCls =
    tone === "success"
      ? "text-status-success"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "muted"
          ? "text-brand-text-secondary"
          : "text-brand-text";
  return (
    <div className="rounded-lg border border-gray-100 bg-card px-3 py-2.5">
      <p className="text-[10.5px] uppercase tracking-wide text-brand-text-secondary">
        {label}
      </p>
      <p className={cn("mt-0.5 text-[18px] font-semibold tabular-nums", toneCls)}>
        {value}
      </p>
    </div>
  );
}

function AccountCapWarning() {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-800">
      <AlertCircle className="h-3 w-3" />
      LinkedIn at cap (15/15) — remaining sends roll to tomorrow
    </div>
  );
}

function RecipientRow({
  r,
  onOpenTimeline,
}: {
  r: Recipient;
  onOpenTimeline: () => void;
}) {
  const statusMeta = recipientStatusMeta[r.status];
  const stepMeta = channelMeta[r.currentChannel];
  const StepIcon = stepMeta.Icon;
  const nextMeta = r.nextActionChannel ? channelMeta[r.nextActionChannel] : null;
  const NextIcon = nextMeta?.Icon;

  return (
    <tr className="hover:bg-brand-bg/40">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-seafoam/50 flex items-center justify-center text-[11px] font-semibold text-brand-primary">
            {r.initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-brand-text leading-tight">{r.name}</p>
            <p className="text-[11px] text-brand-text-secondary truncate">
              {r.title} · {r.company}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            r.matchScore >= 90
              ? "bg-status-success/15 text-status-success"
              : r.matchScore >= 80
                ? "bg-brand-mint/40 text-brand-primary"
                : "bg-amber-100 text-amber-800",
          )}
        >
          {r.matchScore}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white", stepMeta.bg)}>
            <StepIcon className="h-3 w-3" />
          </div>
          <span className="text-[12px] text-brand-text">Step {r.currentStep}</span>
          <span className="text-[11px] text-brand-text-secondary">{stepMeta.label}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              statusMeta.cls,
            )}
          >
            {statusMeta.label}
          </span>
          {r.status === "missing_channel" && r.missingChannel && (
            <span className="text-[10.5px] text-amber-700">
              No {r.missingChannel === "linkedin" ? "LinkedIn" : "WhatsApp number"}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        {r.nextActionAt && r.nextActionAt !== "—" ? (
          <div className="flex items-center gap-1.5 text-[12px] text-brand-text">
            {NextIcon && (
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-white",
                  nextMeta!.bg,
                )}
              >
                <NextIcon className="h-2.5 w-2.5" />
              </div>
            )}
            <span>{r.nextActionAt}</span>
          </div>
        ) : (
          <span className="text-[12px] text-brand-text-secondary">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {r.status === "pending_approval" && (
              <DropdownMenuItem onClick={() => toast.success("Jumped to approval queue")}>
                <Send className="h-3.5 w-3.5 mr-2" />
                Approve & send
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onOpenTimeline}>
              <History className="h-3.5 w-3.5 mr-2" />
              View timeline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Opened candidate panel")}>
              <Eye className="h-3.5 w-3.5 mr-2" />
              View candidate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Prospect paused")}>
              <Pause className="h-3.5 w-3.5 mr-2" />
              Pause prospect
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-status-danger"
              onClick={() => toast.error("Removed from campaign")}
            >
              <CircleSlash className="h-3.5 w-3.5 mr-2" />
              Remove from campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────
// Per-recipient timeline drawer
// ─────────────────────────────────────────────────────────
function RecipientTimelineSheet({
  recipient,
  onClose,
}: {
  recipient: Recipient | null;
  onClose: () => void;
}) {
  const events = recipient ? SAMPLE_TIMELINE[recipient.id] ?? buildFallbackTimeline(recipient) : [];

  return (
    <Sheet open={!!recipient} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0">
        {recipient && (
          <>
            <SheetHeader className="border-b border-gray-100 px-5 py-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-seafoam/50 flex items-center justify-center text-[13px] font-semibold text-brand-primary">
                  {recipient.initials}
                </div>
                <div>
                  <SheetTitle className="text-[16px]">{recipient.name}</SheetTitle>
                  <SheetDescription className="text-[12px]">
                    {recipient.title} · {recipient.company}
                  </SheetDescription>
                </div>
              </div>
              <p className="text-[11px] text-brand-text-secondary italic flex items-center gap-1">
                <History className="h-3 w-3" />
                Never lose track of what happened
              </p>
            </SheetHeader>

            <div className="px-5 py-4 overflow-y-auto h-[calc(100vh-140px)]">
              <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                {events.map((e, i) => {
                  const meta = e.channel ? channelMeta[e.channel] : null;
                  const Icon = meta?.Icon ?? (e.systemNote ? AlertCircle : CheckCircle2);
                  return (
                    <li key={i} className="pl-5 relative">
                      <span
                        className={cn(
                          "absolute -left-3 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white",
                          meta ? meta.bg : e.toneRed ? "bg-amber-600" : "bg-slate-400",
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <p className="text-[12.5px] text-brand-text leading-snug">{e.text}</p>
                      <p className="mt-0.5 text-[10.5px] text-brand-text-secondary flex items-center gap-1.5">
                        {meta && (
                          <span
                            className={cn(
                              "inline-block rounded-full border px-1.5 py-0 text-[10px]",
                              meta.chip,
                            )}
                          >
                            {meta.label}
                          </span>
                        )}
                        <span>{e.at}</span>
                        {e.author && <span>· {e.author}</span>}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function buildFallbackTimeline(r: Recipient): TimelineEvent[] {
  return [
    {
      at: `${r.enrolledAt} · 9:00 AM`,
      text: `Enrolled by ${r.enrolledBy}`,
      author: r.enrolledBy,
    },
    ...(r.status === "excluded_dnc"
      ? [
          {
            at: `${r.enrolledAt} · 9:01 AM`,
            text: "Excluded automatically — candidate is marked Do Not Contact",
            systemNote: true,
            toneRed: true,
          } as TimelineEvent,
        ]
      : []),
    ...(r.status === "bounced"
      ? [
          {
            at: `${r.enrolledAt} · 10:14 AM`,
            channel: "email" as Channel,
            text: "Email bounced — invalid mailbox",
            systemNote: true,
            toneRed: true,
          },
        ]
      : []),
  ];
}

// ─────────────────────────────────────────────────────────
// Not found
// ─────────────────────────────────────────────────────────
function CampaignNotFound({ id }: { id?: string }) {
  const navigate = useNavigate();
  return (
    <div className="py-16">
      <EmptyState
        icon={AlertTriangle}
        title="Campaign not found"
        description={
          id
            ? `We couldn't find a campaign with id "${id}". It may have been deleted or archived.`
            : "We couldn't find this campaign."
        }
        action={
          <Button
            onClick={() => navigate({ to: "/outreach" })}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <ArrowRight className="h-4 w-4" />
            Back to campaigns
          </Button>
        }
      />
    </div>
  );
}
