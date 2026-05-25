import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Send,
  Clock,
  ExternalLink,
  MoreHorizontal,
  MessageSquare,
  SearchX,
  CheckCircle2,
  Inbox as InboxIcon,
  Linkedin,
  Mail,
  Paperclip,
  CheckCheck,
  ChevronDown,
  Plug,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inbox")({
  head: () => ({ meta: [{ title: "Inbox — HireSmart" }] }),
  component: InboxPage,
});

type Classification =
  | "interested"
  | "not_interested"
  | "needs_review"
  | "out_of_office"
  | "referral"
  | "other";

type Channel = "linkedin" | "email" | "whatsapp";

// WhatsApp icon (lucide doesn't ship one — small inline SVG)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 016.994 2.898 9.825 9.825 0 012.892 6.994c-.003 5.45-4.437 9.884-9.89 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const CHANNEL_META: Record<
  Channel,
  {
    label: string;
    Icon: (props: { className?: string }) => JSX.Element;
    iconBg: string;
    text: string;
    accent: string;
    pill: string;
    border: string;
  }
> = {
  linkedin: {
    label: "LinkedIn",
    Icon: ({ className }) => <Linkedin className={className} />,
    iconBg: "bg-[#0A66C2] text-white",
    text: "text-[#0A66C2]",
    accent: "#0A66C2",
    pill: "bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20",
    border: "border-[#0A66C2]/30",
  },
  email: {
    label: "Email",
    Icon: ({ className }) => <Mail className={className} />,
    iconBg: "bg-brand-primary text-white",
    text: "text-brand-primary",
    accent: "var(--brand-primary)",
    pill: "bg-brand-seafoam/40 text-brand-primary border border-brand-mint/40",
    border: "border-brand-mint/40",
  },
  whatsapp: {
    label: "WhatsApp",
    Icon: ({ className }) => <WhatsAppIcon className={className} />,
    iconBg: "bg-[#25D366] text-white",
    text: "text-[#128C7E]",
    accent: "#25D366",
    pill: "bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30",
    border: "border-[#25D366]/30",
  },
};

interface Message {
  id: string;
  direction: "out" | "in";
  author: string;
  channel: Channel;
  campaignContext?: string;
  timestamp: string;
  body: string;
  subject?: string;
  status?: "Delivered" | "Sent" | "Read" | "Failed";
}

interface Thread {
  id: string;
  candidateId: string;
  candidate: string;
  position: string;
  channel: Channel; // primary/latest channel
  account: string; // user/account that received it (recruiter name)
  accountLabel: string; // mailbox/handle/number that received it
  project: string;
  campaign: string;
  classification: Classification;
  confidence: number;
  unread: boolean;
  time: string;
  preview: string;
  messages: Message[];
  aiDraft: string;
  aiDraftSubject?: string;
}

const CLASSIFICATION_META: Record<
  Classification,
  { label: string; badge: string; dot: string }
> = {
  interested: {
    label: "Interested",
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  not_interested: {
    label: "Not interested",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  needs_review: {
    label: "Needs review",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  out_of_office: {
    label: "Out of office",
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    dot: "bg-blue-400",
  },
  referral: {
    label: "Referral",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    dot: "bg-purple-500",
  },
  other: { label: "Other", badge: "bg-gray-50 text-gray-500", dot: "bg-gray-300" },
};

// Connected sources — shown in header status indicator
const CONNECTED_SOURCES: {
  channel: Channel;
  label: string;
  detail: string;
  synced: string;
  status: "ok" | "warmup" | "warn";
}[] = [
  {
    channel: "linkedin",
    label: "Amarsh Jain",
    detail: "LinkedIn · Premium",
    synced: "2 min ago",
    status: "ok",
  },
  {
    channel: "linkedin",
    label: "Dewi Putri",
    detail: "LinkedIn · Sales Nav",
    synced: "2 min ago",
    status: "ok",
  },
  {
    channel: "email",
    label: "amarsh@norvex.co",
    detail: "Gmail · Workspace",
    synced: "1 min ago",
    status: "ok",
  },
  {
    channel: "email",
    label: "dewi@norvex.co",
    detail: "Microsoft 365",
    synced: "4 min ago",
    status: "warmup",
  },
  {
    channel: "whatsapp",
    label: "+62 811 9000 412",
    detail: "WhatsApp Business · Jakarta",
    synced: "Just now",
    status: "ok",
  },
];

const THREADS_SEED: Thread[] = [
  {
    id: "t1",
    candidateId: "c1",
    candidate: "Rina Wijaya",
    position: "CFO, PT Telkom Indonesia",
    channel: "linkedin",
    account: "Amarsh Jain",
    accountLabel: "Amarsh Jain · LinkedIn",
    project: "CFO — Indorama",
    campaign: "CFO Search — Indorama",
    classification: "interested",
    confidence: 94,
    unread: true,
    time: "2h",
    preview:
      "Thank you for reaching out. I'd definitely be interested in learning more about the opportunity…",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Amarsh Jain",
        channel: "linkedin",
        campaignContext:
          "Campaign: CFO Search — Indorama · Step 1: Connection request",
        timestamp: "Mar 14, 10:23 AM",
        body: "Rina — I'm advising a leading petrochemical company in Jakarta on their CFO appointment. Your track record at Telkom, particularly the scale of the operation and your M&A experience, aligns closely with what they're looking for. Would you be open to a brief, confidential conversation?",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "Rina Wijaya",
        channel: "linkedin",
        timestamp: "Mar 15, 2:47 PM",
        body: "Hi Amarsh, thank you for reaching out. I'd definitely be interested in learning more about the opportunity. Would next Tuesday work for a brief call? I have availability between 10 AM and 2 PM Jakarta time.",
      },
    ],
    aiDraft:
      "Hi Rina, great to hear from you! Tuesday works well for me. How about 11 AM Jakarta time? I'll send a calendar invite with a Zoom link. Looking forward to sharing more about the role and learning about your current thinking.",
  },
  {
    id: "t2",
    candidateId: "c2",
    candidate: "Patrick O'Brien",
    position: "Group Treasurer, BHP",
    channel: "email",
    account: "Amarsh Jain",
    accountLabel: "amarsh@norvex.co",
    project: "CFO — Indorama",
    campaign: "CFO Search — Indorama",
    classification: "needs_review",
    confidence: 62,
    unread: true,
    time: "5h",
    preview:
      "Interesting opportunity but I'm quite settled at BHP. That said, I might know someone who could be a fit…",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Amarsh Jain",
        channel: "email",
        subject: "Confidential — Group CFO mandate, Jakarta",
        campaignContext: "Campaign: CFO Search — Indorama · Step 2: Email follow-up",
        timestamp: "Mar 12, 9:15 AM",
        body: "Patrick,\n\nI'm working with a major petrochemical group in Jakarta looking for a CFO. Given your extensive treasury experience at BHP and your understanding of resource-sector finance, I thought this could be worth a conversation.\n\nOpen to connecting?\n\nAmarsh",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Patrick O'Brien",
        channel: "email",
        subject: "Re: Confidential — Group CFO mandate, Jakarta",
        timestamp: "Mar 14, 4:30 PM",
        body: "Amarsh, thanks for the note. Interesting opportunity but I'm quite settled at BHP. That said, I might know someone who could be a fit — a former colleague who recently left Rio Tinto. Want me to make an introduction?",
      },
    ],
    aiDraft:
      "Patrick,\n\nThanks for being upfront — and an introduction would be incredibly helpful. If your former colleague at Rio Tinto is open to a confidential conversation, I'd welcome the connection. Happy to share more details with them directly.\n\nAppreciate it,\nAmarsh",
    aiDraftSubject: "Re: Confidential — Group CFO mandate, Jakarta",
  },
  {
    id: "t3",
    candidateId: "c3",
    candidate: "Dewi Anggraini",
    position: "VP Corp Finance, Indofood",
    channel: "whatsapp",
    account: "Dewi Putri",
    accountLabel: "+62 811 9000 412 · WhatsApp",
    project: "VP Ops — OYO",
    campaign: "VP Ops SEA — OYO",
    classification: "not_interested",
    confidence: 91,
    unread: true,
    time: "8h",
    preview: "Thanks for thinking of me but I'm not exploring at the moment.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Dewi Putri",
        channel: "whatsapp",
        timestamp: "Mar 13, 11:00 AM",
        body: "Hi Bu Dewi — Dewi Putri here from Norvex. Would you be open to a brief chat about a VP Operations search we're running for a major hospitality group? Happy to share details over a quick call.",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "Dewi Anggraini",
        channel: "whatsapp",
        timestamp: "Mar 14, 1:00 PM",
        body: "Thanks for thinking of me but I'm not exploring at the moment. Best of luck with the search 🙏",
      },
    ],
    aiDraft:
      "Bu Dewi — terima kasih atas reply yang cepat. Akan saya keep in mind kalau ada peluang lain yang lebih relevant di kemudian hari. Semoga sukses selalu 🙏",
  },
  {
    id: "t4",
    candidateId: "c4",
    candidate: "Budi Santoso",
    position: "VP Finance, Astra",
    channel: "whatsapp",
    account: "Amarsh Jain",
    accountLabel: "+62 811 9000 412 · WhatsApp",
    project: "CFO — Indorama",
    campaign: "CFO Search — Indorama",
    classification: "interested",
    confidence: 88,
    unread: true,
    time: "Yesterday",
    preview: "Happy to discuss. What's the timing on the search?",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Amarsh Jain",
        channel: "linkedin",
        timestamp: "Mar 11, 9:30 AM",
        body: "Budi — a confidential CFO search in Jakarta that lines up with your background. Open to a 20-minute conversation?",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "Budi Santoso",
        channel: "linkedin",
        timestamp: "Mar 12, 6:20 PM",
        body: "Sure — easiest to chat on WhatsApp. My number is +62 812 3344 7788.",
      },
      {
        id: "m3",
        direction: "out",
        author: "Amarsh Jain",
        channel: "whatsapp",
        timestamp: "Mar 12, 8:10 PM",
        body: "Pak Budi — Amarsh dari Norvex. Following up from LinkedIn. When works for a 20-min call this week?",
        status: "Read",
      },
      {
        id: "m4",
        direction: "in",
        author: "Budi Santoso",
        channel: "whatsapp",
        timestamp: "Mar 13, 3:00 PM",
        body: "Happy to discuss. What's the timing on the search?",
      },
    ],
    aiDraft:
      "Pak Budi — terima kasih. The client is moving quickly — first-round interviews kick off in two weeks. Apakah Thursday atau Friday sore bisa untuk 20-min call? Saya share context lengkap di call.",
  },
  {
    id: "t5",
    candidateId: "c5",
    candidate: "Sarah Mitchell",
    position: "Regional Finance, Unilever",
    channel: "email",
    account: "Dewi Putri",
    accountLabel: "dewi@norvex.co",
    project: "VP Ops — OYO",
    campaign: "VP Ops SEA — OYO",
    classification: "out_of_office",
    confidence: 99,
    unread: true,
    time: "Yesterday",
    preview: "I'm out of the office until Mar 22. For urgent matters please contact…",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Dewi Putri",
        channel: "email",
        subject: "Regional ops leadership — confidential",
        timestamp: "Mar 13, 10:00 AM",
        body: "Sarah — would you be open to a confidential conversation about a regional ops role for a fast-scaling hospitality group?\n\nBest,\nDewi",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Sarah Mitchell",
        channel: "email",
        subject: "Automatic reply: Regional ops leadership — confidential",
        timestamp: "Mar 13, 10:01 AM",
        body: "I'm out of the office until Mar 22. For urgent matters please contact my assistant, James Liu (james.liu@unilever.com).\n\nThis is an automated response.",
      },
    ],
    aiDraft:
      "Sarah — no rush at all. I'll reach back out after the 22nd. Enjoy the time away.\n\nBest,\nDewi",
    aiDraftSubject: "Re: Regional ops leadership — confidential",
  },
  {
    id: "t6",
    candidateId: "c6",
    candidate: "Amara Osei",
    position: "CFO, Fonterra SEA",
    channel: "linkedin",
    account: "Amarsh Jain",
    accountLabel: "Amarsh Jain · LinkedIn",
    project: "CFO — Indorama",
    campaign: "CFO Search — Indorama",
    classification: "interested",
    confidence: 90,
    unread: false,
    time: "2 days ago",
    preview: "Yes, please share more details.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Amarsh Jain",
        channel: "linkedin",
        timestamp: "Mar 10",
        body: "Amara — CFO search in Jakarta. Worth a chat?",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "Amara Osei",
        channel: "linkedin",
        timestamp: "Mar 13",
        body: "Yes, please share more details.",
      },
    ],
    aiDraft:
      "Amara — wonderful. Sending a brief over now with the role outline and compensation band. Let me know a few times that work for an intro call next week.",
  },
  {
    id: "t7",
    candidateId: "c7",
    candidate: "Priya Nair",
    position: "Group CFO, Tata Motors",
    channel: "email",
    account: "Amarsh Jain",
    accountLabel: "amarsh@norvex.co",
    project: "CFO — Indorama",
    campaign: "CFO Search — Indorama",
    classification: "not_interested",
    confidence: 95,
    unread: false,
    time: "2 days ago",
    preview: "Not exploring right now, thank you.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Amarsh Jain",
        channel: "email",
        subject: "Group CFO — Jakarta",
        timestamp: "Mar 10",
        body: "Priya — would value a confidential conversation about a CFO search.\n\nAmarsh",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Priya Nair",
        channel: "email",
        subject: "Re: Group CFO — Jakarta",
        timestamp: "Mar 13",
        body: "Not exploring right now, thank you.",
      },
    ],
    aiDraft:
      "Priya — understood, thanks for the quick reply. I'll stay in touch.\n\nAmarsh",
    aiDraftSubject: "Re: Group CFO — Jakarta",
  },
  {
    id: "t8",
    candidateId: "c8",
    candidate: "James Chen",
    position: "Finance Director, Wilmar",
    channel: "linkedin",
    account: "Dewi Putri",
    accountLabel: "Dewi Putri · LinkedIn",
    project: "Country Dir — KNS",
    campaign: "Country Director — KNS",
    classification: "not_interested",
    confidence: 89,
    unread: false,
    time: "3 days ago",
    preview: "Not the right time.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Dewi Putri",
        channel: "linkedin",
        timestamp: "Mar 8",
        body: "James — open to a chat about a country director role?",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "James Chen",
        channel: "linkedin",
        timestamp: "Mar 12",
        body: "Not the right time.",
      },
    ],
    aiDraft:
      "James — understood. I'll keep you posted if something more aligned comes up.",
  },
  {
    id: "t9",
    candidateId: "c9",
    candidate: "Rahul Kapoor",
    position: "Head of Strategy, McKinsey",
    channel: "email",
    account: "Dewi Putri",
    accountLabel: "dewi@norvex.co",
    project: "VP Ops — OYO",
    campaign: "VP Ops SEA — OYO",
    classification: "referral",
    confidence: 86,
    unread: false,
    time: "4 days ago",
    preview: "Not for me but happy to introduce a colleague who's looking.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Dewi Putri",
        channel: "email",
        subject: "VP Ops — fast-scaling hospitality group",
        timestamp: "Mar 7",
        body: "Rahul — VP Ops role for a fast-scaling hospitality group. Worth a conversation?\n\nDewi",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Rahul Kapoor",
        channel: "email",
        subject: "Re: VP Ops — fast-scaling hospitality group",
        timestamp: "Mar 11",
        body: "Not for me but happy to introduce a colleague who's looking. Want me to make the intro?",
      },
    ],
    aiDraft:
      "Rahul, that would be hugely appreciated — please go ahead with the introduction. I'll take great care of them.\n\nDewi",
    aiDraftSubject: "Re: VP Ops — fast-scaling hospitality group",
  },
  {
    id: "t10",
    candidateId: "c10",
    candidate: "Ananya Sharma",
    position: "Head of FP&A, Grab",
    channel: "whatsapp",
    account: "Dewi Putri",
    accountLabel: "+62 811 9000 412 · WhatsApp",
    project: "Country Dir — KNS",
    campaign: "Country Director — KNS",
    classification: "not_interested",
    confidence: 92,
    unread: false,
    time: "1 week ago",
    preview: "Thanks but no thanks.",
    messages: [
      {
        id: "m1",
        direction: "out",
        author: "Dewi Putri",
        channel: "whatsapp",
        timestamp: "Mar 4",
        body: "Ananya — open to a chat about a country director role?",
        status: "Read",
      },
      {
        id: "m2",
        direction: "in",
        author: "Ananya Sharma",
        channel: "whatsapp",
        timestamp: "Mar 8",
        body: "Thanks but no thanks.",
      },
    ],
    aiDraft: "Ananya — appreciated. I'll stay in touch.",
  },
];

type FilterKey =
  | "all"
  | "unread"
  | Classification
  | `channel:${Channel}`;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "interested", label: "Interested" },
  { key: "needs_review", label: "Needs review" },
  { key: "channel:linkedin", label: "LinkedIn" },
  { key: "channel:email", label: "Email" },
  { key: "channel:whatsapp", label: "WhatsApp" },
  { key: "not_interested", label: "Not interested" },
  { key: "out_of_office", label: "Out of office" },
  { key: "referral", label: "Referral" },
];

// LinkedIn InMail soft limit (mock)
const LINKEDIN_CHAR_LIMIT = 1900;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function InboxPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>(THREADS_SEED);
  const [accountFilter, setAccountFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(THREADS_SEED[0].id);
  const [draft, setDraft] = useState<string>(THREADS_SEED[0].aiDraft);
  const [draftSubject, setDraftSubject] = useState<string>(
    THREADS_SEED[0].aiDraftSubject ?? "",
  );
  const [replyChannel, setReplyChannel] = useState<Channel>(
    THREADS_SEED[0].channel,
  );
  const [draftDiscarded, setDraftDiscarded] = useState(false);
  const [justSentAt, setJustSentAt] = useState<{
    time: string;
    channel: Channel;
  } | null>(null);
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allAccounts = useMemo(
    () => Array.from(new Set(threads.map((t) => t.account))),
    [threads],
  );
  const allCampaigns = useMemo(
    () => Array.from(new Set(threads.map((t) => t.campaign))),
    [threads],
  );

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (accountFilter !== "all" && t.account !== accountFilter) return false;
      if (campaignFilter !== "all" && t.campaign !== campaignFilter) return false;
      if (filter === "all") return true;
      if (filter === "unread") return t.unread;
      if (filter.startsWith("channel:")) {
        return t.channel === (filter.split(":")[1] as Channel);
      }
      return t.classification === filter;
    });
  }, [threads, filter, accountFilter, campaignFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: threads.length, unread: 0 };
    threads.forEach((t) => {
      if (t.unread) c.unread = (c.unread ?? 0) + 1;
      c[t.classification] = (c[t.classification] ?? 0) + 1;
      const ck = `channel:${t.channel}`;
      c[ck] = (c[ck] ?? 0) + 1;
    });
    return c;
  }, [threads]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, unread: false } : t)),
    );
    const t = THREADS_SEED.find((x) => x.id === selectedId);
    setDraft(t?.aiDraft ?? "");
    setDraftSubject(t?.aiDraftSubject ?? "");
    setReplyChannel(t?.channel ?? "email");
    setDraftDiscarded(false);
    setJustSentAt(null);
  }, [selectedId]);

  useEffect(() => {
    if (threadScrollRef.current) {
      threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
    }
  }, [selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (!inField && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const idx = filtered.findIndex((t) => t.id === selectedId);
        const next =
          e.key === "ArrowDown"
            ? Math.min(filtered.length - 1, idx + 1)
            : Math.max(0, idx - 1);
        if (filtered[next]) setSelectedId(filtered[next].id);
      }
      if (!inField && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId, draft, replyChannel]);

  const handleSend = () => {
    if (!selected || !draft.trim()) return;
    toast.success(
      `Reply sent to ${selected.candidate} via ${CHANNEL_META[replyChannel].label}`,
    );
    const now = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setJustSentAt({ time: now, channel: replyChannel });
    setDraft("");
    setTimeout(() => setJustSentAt(null), 3500);
  };

  const overrideClassification = (c: Classification) => {
    if (!selected) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selected.id ? { ...t, classification: c } : t)),
    );
    toast.success("Classification updated");
  };

  const unreadCount = counts.unread ?? 0;
  const sourceCount = CONNECTED_SOURCES.length;

  if (threads.length === 0) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] flex-col">
        <PageHeader title="Inbox" subtitle="0 messages" />
        <EmptyState
          icon={InboxIcon}
          title="Your inbox is empty"
          description="Messages will appear here when candidates reply to your outreach campaigns across LinkedIn, Email, and WhatsApp."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <PageHeader
        title="Inbox"
        subtitle={`${unreadCount} unread ${unreadCount === 1 ? "reply" : "replies"} across ${sourceCount} connected sources`}
        actions={
          <>
            <SourcesIndicator sources={CONNECTED_SOURCES} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setThreads((prev) => prev.map((t) => ({ ...t, unread: false })));
                toast.success("All marked as read");
              }}
            >
              Mark all read
            </Button>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {allAccounts.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                {allCampaigns.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key] ?? 0;
          const channelKey = f.key.startsWith("channel:")
            ? (f.key.split(":")[1] as Channel)
            : null;
          const dot =
            f.key === "interested"
              ? "bg-green-500"
              : f.key === "needs_review"
                ? "bg-amber-500"
                : f.key === "unread"
                  ? "bg-blue-500"
                  : null;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-brand-primary text-white"
                  : "bg-brand-bg text-brand-text-secondary hover:bg-brand-seafoam/30",
              )}
            >
              {channelKey ? (
                <ChannelGlyph channel={channelKey} active={active} size="sm" />
              ) : dot && !active ? (
                <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
              ) : null}
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-card text-brand-text-secondary",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {/* LEFT */}
        <div className="flex w-[400px] flex-shrink-0 flex-col border-r border-border max-lg:w-[340px] max-md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] text-brand-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              All sources synced · 2 min ago
            </span>
            <button className="inline-flex items-center gap-1 hover:text-brand-text">
              <RefreshCw className="h-3 w-3" />
              Sync now
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <SearchX className="mb-3 h-10 w-10 text-brand-text-secondary/60" />
                <p className="text-sm font-medium text-brand-text">
                  No messages match this filter
                </p>
                <p className="mt-1 text-xs text-brand-text-secondary">
                  Try a different filter or check All messages
                </p>
              </div>
            ) : (
              filtered.map((t) => (
                <ThreadListItem
                  key={t.id}
                  thread={t}
                  selected={t.id === selectedId}
                  onSelect={() => setSelectedId(t.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!selected ? (
            <EmptyRight />
          ) : (
            <>
              <ConversationHeader
                thread={selected}
                onOverride={overrideClassification}
                onView={() =>
                  navigate({
                    to: "/candidates/$id",
                    params: { id: selected.candidateId },
                  })
                }
              />
              <div ref={threadScrollRef} className="flex-1 overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-4">
                  {selected.messages.map((m, idx) => {
                    const prev = idx > 0 ? selected.messages[idx - 1] : null;
                    const channelSwitched = prev && prev.channel !== m.channel;
                    return (
                      <div key={m.id} className="flex flex-col gap-2">
                        {channelSwitched && (
                          <div className="flex items-center gap-2 py-1 text-[11px] text-brand-text-secondary">
                            <div className="h-px flex-1 bg-border" />
                            <span className="inline-flex items-center gap-1">
                              Conversation continued on{" "}
                              <ChannelGlyph channel={m.channel} size="sm" />
                              <strong className="font-medium text-brand-text">
                                {CHANNEL_META[m.channel].label}
                              </strong>
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                        )}
                        <MessageCard
                          msg={m}
                          classification={
                            m.direction === "in" ? selected.classification : null
                          }
                          confidence={selected.confidence}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <ReplyComposer
                thread={selected}
                draft={draft}
                setDraft={setDraft}
                draftSubject={draftSubject}
                setDraftSubject={setDraftSubject}
                replyChannel={replyChannel}
                setReplyChannel={setReplyChannel}
                discarded={draftDiscarded}
                onRegenerate={() => {
                  setDraft(selected.aiDraft);
                  setDraftSubject(selected.aiDraftSubject ?? "");
                  setDraftDiscarded(false);
                  toast.success("New draft generated");
                }}
                onDiscard={() => {
                  setDraft("");
                  setDraftDiscarded(true);
                }}
                onSend={handleSend}
                justSentAt={justSentAt}
                textareaRef={textareaRef}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------ Sources indicator ------------ */

function SourcesIndicator({
  sources,
}: {
  sources: typeof CONNECTED_SOURCES;
}) {
  const channels: Channel[] = ["linkedin", "email", "whatsapp"];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-brand-mint/40 bg-brand-seafoam/30 hover:bg-brand-seafoam/40"
        >
          <span className="flex -space-x-1.5">
            {channels.map((c) => (
              <span
                key={c}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-card",
                  CHANNEL_META[c].iconBg,
                )}
              >
                <ChannelGlyph channel={c} mono size="xs" />
              </span>
            ))}
          </span>
          <span className="text-xs font-medium text-brand-text">
            {sources.length} sources connected
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-brand-text-secondary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
            <Plug className="h-3.5 w-3.5 text-brand-primary" />
            Connected sources
          </div>
          <p className="mt-0.5 text-[11px] text-brand-text-secondary">
            All replies on LinkedIn, Email & WhatsApp aggregate here.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {sources.map((s, i) => {
            const meta = CHANNEL_META[s.channel];
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-seafoam/20"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full",
                    meta.iconBg,
                  )}
                >
                  <ChannelGlyph channel={s.channel} mono size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-brand-text">{s.label}</div>
                  <div className="truncate text-[11px] text-brand-text-secondary">
                    {s.detail} · synced {s.synced}
                  </div>
                </div>
                {s.status === "ok" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Live
                  </span>
                )}
                {s.status === "warmup" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
                    Warmup
                  </span>
                )}
                {s.status === "warn" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-red-200">
                    Attn
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-border px-4 py-2 text-[11px] text-brand-text-secondary">
          No auto-replies on any channel — recruiter always sends manually.
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------ Channel glyph ------------ */

function ChannelGlyph({
  channel,
  size = "md",
  active = false,
  mono = false,
}: {
  channel: Channel;
  size?: "xs" | "sm" | "md";
  active?: boolean;
  mono?: boolean;
}) {
  const meta = CHANNEL_META[channel];
  const sz =
    size === "xs" ? "h-3 w-3" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const Icon = meta.Icon;
  if (mono) return <Icon className={cn(sz, "text-white")} />;
  return <Icon className={cn(sz, active ? "text-white" : meta.text)} />;
}

/* ------------ List item ------------ */

function ThreadListItem({
  thread,
  selected,
  onSelect,
}: {
  thread: Thread;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = CLASSIFICATION_META[thread.classification];
  const chMeta = CHANNEL_META[thread.channel];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "block w-full border-b border-border px-4 py-3 text-left transition-colors",
        selected
          ? "border-l-4 border-l-brand-primary bg-brand-seafoam/20"
          : thread.unread
            ? "bg-card hover:bg-brand-seafoam/10"
            : "bg-brand-bg/50 hover:bg-brand-seafoam/10",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
            thread.unread ? "bg-blue-500" : "bg-transparent",
          )}
        />
        {/* avatar with channel glyph badge */}
        <div className="relative flex-shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-medium text-brand-primary">
            {initials(thread.candidate)}
          </span>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-card",
              chMeta.iconBg,
            )}
            title={chMeta.label}
          >
            <ChannelGlyph channel={thread.channel} mono size="xs" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm text-brand-text",
                thread.unread ? "font-medium" : "font-normal",
              )}
            >
              {thread.candidate}
            </span>
            <span className="flex-shrink-0 text-[11px] text-brand-text-secondary">
              {thread.time}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[12px] text-brand-text-secondary">
            {thread.position}
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] text-brand-text-secondary">
            {thread.preview}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                meta.badge,
              )}
            >
              {meta.label}
            </span>
            <span className="rounded-md bg-brand-bg px-2 py-0.5 text-[11px] text-brand-text-secondary">
              {thread.project}
            </span>
            <span
              className="truncate text-[10.5px] text-brand-text-secondary"
              title={thread.accountLabel}
            >
              · {thread.accountLabel}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ------------ Conversation header ------------ */

function ConversationHeader({
  thread,
  onOverride,
  onView,
}: {
  thread: Thread;
  onOverride: (c: Classification) => void;
  onView: () => void;
}) {
  const lowConfidence = thread.confidence < 70;
  const chMeta = CHANNEL_META[thread.channel];
  return (
    <div className="border-b border-border px-6 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-seafoam text-sm font-medium text-brand-primary">
              {initials(thread.candidate)}
            </span>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-card",
                chMeta.iconBg,
              )}
            >
              <ChannelGlyph channel={thread.channel} mono size="sm" />
            </span>
          </div>
          <button onClick={onView} className="text-left hover:underline">
            <div className="text-base font-medium text-brand-text">
              {thread.candidate}
            </div>
            <div className="text-[13px] text-brand-text-secondary">
              {thread.position}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-text-secondary">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                  chMeta.pill,
                )}
              >
                <ChannelGlyph channel={thread.channel} size="xs" />
                {chMeta.label}
              </span>
              <span>· received on {thread.accountLabel}</span>
              <span>·</span>
              <span className="rounded-md bg-brand-bg px-1.5 py-0.5">
                {thread.project}
              </span>
              <span className="rounded-md bg-brand-bg px-1.5 py-0.5">
                {thread.campaign}
              </span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={thread.classification}
            onValueChange={(v) => onOverride(v as Classification)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CLASSIFICATION_META) as Classification[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CLASSIFICATION_META[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={onView} title="View profile">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thread actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => toast.success("Opens pipeline stage picker")}
              >
                Move to pipeline…
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success("Marked as not interested")}
              >
                Mark not interested
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success("Create candidate from referral")}
              >
                Create candidate (referral)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Snoozed for 1 day")}>
                Snooze 1 day
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-status-danger"
                onClick={() => toast.success("Flagged as Do Not Contact")}
              >
                Flag as DNC
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 text-[12px]",
          lowConfidence ? "text-amber-600" : "text-brand-text-secondary",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {lowConfidence
          ? `Low confidence (${thread.confidence}%) — please verify`
          : `Classified as: ${CLASSIFICATION_META[thread.classification].label} (${thread.confidence}% confidence) · Claude Haiku 4.5`}
      </div>
    </div>
  );
}

/* ------------ Message card ------------ */

function MessageCard({
  msg,
  classification,
  confidence,
}: {
  msg: Message;
  classification: Classification | null;
  confidence: number;
}) {
  const isIn = msg.direction === "in";
  const chMeta = CHANNEL_META[msg.channel];
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        isIn
          ? cn("border border-l-4 bg-brand-seafoam/10", chMeta.border)
          : "border border-border bg-card",
      )}
      style={isIn ? { borderLeftColor: chMeta.accent } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-brand-text-secondary">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium",
            isIn ? "bg-brand-seafoam text-brand-primary" : "bg-brand-bg text-brand-text",
          )}
        >
          {initials(msg.author)}
        </span>
        <span className="font-medium text-brand-text">{msg.author}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            chMeta.pill,
          )}
        >
          <ChannelGlyph channel={msg.channel} size="xs" />
          {chMeta.label}
        </span>
        <span>· {msg.timestamp}</span>
      </div>
      {msg.campaignContext && (
        <div className="mt-1 text-[11px] text-brand-text-secondary">
          {msg.campaignContext}
        </div>
      )}
      {msg.subject && (
        <div className="mt-2 text-[13px] font-medium text-brand-text">
          {msg.subject}
        </div>
      )}
      <div className="my-3 h-px bg-border" />
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
        {msg.body}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {msg.status && (
          <span className="inline-flex items-center gap-1 text-[11px] text-brand-text-secondary">
            {msg.status === "Read" ? (
              <CheckCheck className="h-3 w-3 text-[#0A66C2]" />
            ) : (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            )}
            {msg.status}
          </span>
        )}
        {isIn && classification && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
              CLASSIFICATION_META[classification].badge,
            )}
          >
            <Sparkles className="h-3 w-3" />
            {CLASSIFICATION_META[classification].label} ({confidence}%)
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------ Reply composer ------------ */

function ReplyComposer({
  thread,
  draft,
  setDraft,
  draftSubject,
  setDraftSubject,
  replyChannel,
  setReplyChannel,
  discarded,
  onRegenerate,
  onDiscard,
  onSend,
  justSentAt,
  textareaRef,
}: {
  thread: Thread;
  draft: string;
  setDraft: (v: string) => void;
  draftSubject: string;
  setDraftSubject: (v: string) => void;
  replyChannel: Channel;
  setReplyChannel: (c: Channel) => void;
  discarded: boolean;
  onRegenerate: () => void;
  onDiscard: () => void;
  onSend: () => void;
  justSentAt: { time: string; channel: Channel } | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const chMeta = CHANNEL_META[replyChannel];
  const channelSwitched = replyChannel !== thread.channel;
  const overLinkedinLimit =
    replyChannel === "linkedin" && draft.length > LINKEDIN_CHAR_LIMIT;

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-[12px] font-medium text-brand-primary">
            AI draft
          </span>
          <span className="text-[12px] text-brand-text-secondary">
            · Claude Haiku 4.5 · edit freely — nothing sends automatically
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Select defaultValue="match">
            <SelectTrigger className="h-7 w-32 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Tone: match thread</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="bahasa">Bahasa-friendly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Regenerate
          </Button>
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </div>

      {/* Channel switcher row */}
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-brand-bg/40 px-2.5 py-1.5">
        <span className="text-[11px] text-brand-text-secondary">Reply via:</span>
        <div className="flex items-center gap-1">
          {(["linkedin", "email", "whatsapp"] as Channel[]).map((c) => {
            const active = c === replyChannel;
            const meta = CHANNEL_META[c];
            return (
              <button
                key={c}
                onClick={() => setReplyChannel(c)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? cn("ring-1", meta.pill)
                    : "text-brand-text-secondary hover:bg-card",
                )}
              >
                <ChannelGlyph channel={c} size="xs" active={false} />
                {meta.label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto truncate text-[11px] text-brand-text-secondary">
          Sending as <strong className="text-brand-text">{thread.account}</strong>{" "}
          ·{" "}
          {replyChannel === thread.channel
            ? thread.accountLabel
            : `${chMeta.label} (auto-routed)`}
        </span>
      </div>

      {channelSwitched && (
        <div className="mb-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">
          <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span>
            You're switching from <strong>{CHANNEL_META[thread.channel].label}</strong>{" "}
            to <strong>{chMeta.label}</strong>. The thread will continue under{" "}
            {chMeta.label} after sending.
          </span>
        </div>
      )}

      {/* Email-only subject */}
      {replyChannel === "email" && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-card px-2">
          <span className="text-[11px] font-medium text-brand-text-secondary">
            Subject
          </span>
          <Input
            value={draftSubject}
            onChange={(e) => setDraftSubject(e.target.value)}
            placeholder="Re: …"
            className="h-8 border-0 px-1 text-sm focus-visible:ring-0"
          />
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={
          discarded
            ? "Write your reply..."
            : `Write a ${chMeta.label} reply to ${thread.candidate}...`
        }
        className={cn(
          "min-h-[110px] resize-y text-sm leading-relaxed focus-visible:ring-brand-mint/30",
          replyChannel === "whatsapp" && "font-normal",
        )}
      />

      {/* Email signature preview */}
      {replyChannel === "email" && draft && (
        <div className="mt-1 rounded-md border border-dashed border-border bg-brand-bg/30 px-3 py-2 text-[11px] text-brand-text-secondary">
          <div className="font-medium text-brand-text">— {thread.account}</div>
          <div>Norvex Solutions · Executive Search · Jakarta</div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onSend}
            disabled={!draft.trim() || overLinkedinLimit}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Send via {chMeta.label}
          </Button>
          {(replyChannel === "email" || replyChannel === "whatsapp") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Attach file (mock)")}
            >
              <Paperclip className="mr-1.5 h-3.5 w-3.5" />
              Attach
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.success("Scheduled: in 1 hour")}>
                In 1 hour
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success("Scheduled: tomorrow morning")}
              >
                Tomorrow 9 AM Jakarta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Custom time picker")}>
                Custom time…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => toast.success("Draft saved")}
            className="text-[12px] text-brand-text-secondary hover:text-brand-text"
          >
            Save as draft
          </button>
        </div>
        <div className="flex items-center gap-3">
          {replyChannel === "linkedin" && (
            <span
              className={cn(
                "text-[11px] tabular-nums",
                overLinkedinLimit ? "font-medium text-red-600" : "text-brand-text-secondary",
              )}
            >
              {draft.length.toLocaleString()} / {LINKEDIN_CHAR_LIMIT.toLocaleString()}
            </span>
          )}
          {justSentAt && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Reply sent via {CHANNEL_META[justSentAt.channel].label} at{" "}
              {justSentAt.time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------ Empty right panel ------------ */

function EmptyRight() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <MessageSquare className="mb-3 h-12 w-12 text-brand-text-secondary/60" />
      <p className="text-base text-brand-text-secondary">Select a conversation</p>
      <p className="mt-1 max-w-sm text-[13px] text-brand-text-secondary">
        Choose a message from the left to view the full thread across LinkedIn,
        Email, and WhatsApp and reply.
      </p>
      <InboxIcon className="sr-only" />
    </div>
  );
}
