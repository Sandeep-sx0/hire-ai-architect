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
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Message {
  id: string;
  direction: "out" | "in";
  author: string;
  channel?: string;
  campaignContext?: string;
  timestamp: string;
  body: string;
  status?: "Delivered" | "Sent" | "Failed";
}

interface Thread {
  id: string;
  candidateId: string;
  candidate: string;
  position: string;
  account: string;
  project: string;
  classification: Classification;
  confidence: number;
  unread: boolean;
  time: string;
  preview: string;
  messages: Message[];
  aiDraft: string;
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

const THREADS_SEED: Thread[] = [
  {
    id: "t1",
    candidateId: "c1",
    candidate: "Rina Wijaya",
    position: "CFO, PT Telkom Indonesia",
    account: "Amarsh Jain",
    project: "CFO — Indorama",
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
        channel: "via LinkedIn",
        campaignContext: "Campaign: CFO Search — Indorama · Step 1: Connection",
        timestamp: "Mar 14, 10:23 AM",
        body: "Rina — I'm advising a leading petrochemical company in Jakarta on their CFO appointment. Your track record at Telkom, particularly the scale of the operation and your M&A experience, aligns closely with what they're looking for. Would you be open to a brief, confidential conversation?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Rina Wijaya",
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
    account: "Amarsh Jain",
    project: "CFO — Indorama",
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
        channel: "via LinkedIn",
        campaignContext: "Campaign: CFO Search — Indorama · Step 1: Connection",
        timestamp: "Mar 12, 9:15 AM",
        body: "Patrick — I'm working with a major petrochemical group in Jakarta looking for a CFO. Given your extensive treasury experience at BHP and your understanding of resource-sector finance, I thought this could be worth a conversation. Open to connecting?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Patrick O'Brien",
        timestamp: "Mar 14, 4:30 PM",
        body: "Amarsh, thanks for the note. Interesting opportunity but I'm quite settled at BHP. That said, I might know someone who could be a fit — a former colleague who recently left Rio Tinto. Want me to make an introduction?",
      },
    ],
    aiDraft:
      "Patrick, thanks for being upfront — and an introduction would be incredibly helpful. If your former colleague at Rio Tinto is open to a confidential conversation, I'd welcome the connection. Happy to share more details with them directly. Appreciate it.",
  },
  {
    id: "t3",
    candidateId: "c3",
    candidate: "Dewi Anggraini",
    position: "VP Corp Finance, Indofood",
    account: "Dewi Putri",
    project: "VP Ops — OYO",
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
        channel: "via LinkedIn",
        timestamp: "Mar 13, 11:00 AM",
        body: "Dewi — would you be open to a brief chat about a VP Operations search we're running for a major hospitality group?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Dewi Anggraini",
        timestamp: "Mar 14, 1:00 PM",
        body: "Thanks for thinking of me but I'm not exploring at the moment. Best of luck with the search.",
      },
    ],
    aiDraft:
      "Dewi, understood — thank you for the quick reply. I'll keep you in mind for future opportunities that may be a better fit. All the best.",
  },
  {
    id: "t4",
    candidateId: "c4",
    candidate: "Budi Santoso",
    position: "VP Finance, Astra",
    account: "Amarsh Jain",
    project: "CFO — Indorama",
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
        channel: "via LinkedIn",
        timestamp: "Mar 11, 9:30 AM",
        body: "Budi — a confidential CFO search in Jakarta that lines up with your background. Open to a 20-minute conversation?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Budi Santoso",
        timestamp: "Mar 13, 3:00 PM",
        body: "Happy to discuss. What's the timing on the search?",
      },
    ],
    aiDraft:
      "Budi, great to hear from you. The client is moving quickly — first-round interviews kick off in two weeks. Would Thursday or Friday work for a 20-minute call so I can share more context?",
  },
  {
    id: "t5",
    candidateId: "c5",
    candidate: "Sarah Mitchell",
    position: "Regional Finance, Unilever",
    account: "Dewi Putri",
    project: "VP Ops — OYO",
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
        channel: "via LinkedIn",
        timestamp: "Mar 13, 10:00 AM",
        body: "Sarah — would you be open to a confidential conversation about a regional ops role?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Sarah Mitchell",
        timestamp: "Mar 13, 10:01 AM",
        body: "I'm out of the office until Mar 22. For urgent matters please contact my assistant.",
      },
    ],
    aiDraft:
      "Sarah — no rush at all. I'll reach back out after the 22nd. Enjoy the time away.",
  },
  {
    id: "t6",
    candidateId: "c6",
    candidate: "Amara Osei",
    position: "CFO, Fonterra SEA",
    account: "Amarsh Jain",
    project: "CFO — Indorama",
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
        timestamp: "Mar 10",
        body: "Amara — CFO search in Jakarta. Worth a chat?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Amara Osei",
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
    account: "Amarsh Jain",
    project: "CFO — Indorama",
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
        timestamp: "Mar 10",
        body: "Priya — would value a confidential conversation about a CFO search.",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Priya Nair",
        timestamp: "Mar 13",
        body: "Not exploring right now, thank you.",
      },
    ],
    aiDraft:
      "Priya — understood, thanks for the quick reply. I'll stay in touch.",
  },
  {
    id: "t8",
    candidateId: "c8",
    candidate: "James Chen",
    position: "Finance Director, Wilmar",
    account: "Dewi Putri",
    project: "Country Dir — KNS",
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
        timestamp: "Mar 8",
        body: "James — open to a chat about a country director role?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "James Chen",
        timestamp: "Mar 12",
        body: "Not the right time.",
      },
    ],
    aiDraft: "James — understood. I'll keep you posted if something more aligned comes up.",
  },
  {
    id: "t9",
    candidateId: "c9",
    candidate: "Rahul Kapoor",
    position: "Head of Strategy, McKinsey",
    account: "Dewi Putri",
    project: "VP Ops — OYO",
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
        timestamp: "Mar 7",
        body: "Rahul — VP Ops role for a fast-scaling hospitality group. Worth a conversation?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Rahul Kapoor",
        timestamp: "Mar 11",
        body: "Not for me but happy to introduce a colleague who's looking. Want me to make the intro?",
      },
    ],
    aiDraft:
      "Rahul, that would be hugely appreciated — please go ahead with the introduction. I'll take great care of them.",
  },
  {
    id: "t10",
    candidateId: "c10",
    candidate: "Ananya Sharma",
    position: "Head of FP&A, Grab",
    account: "Dewi Putri",
    project: "Country Dir — KNS",
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
        timestamp: "Mar 4",
        body: "Ananya — open to a chat about a country director role?",
        status: "Delivered",
      },
      {
        id: "m2",
        direction: "in",
        author: "Ananya Sharma",
        timestamp: "Mar 8",
        body: "Thanks but no thanks.",
      },
    ],
    aiDraft: "Ananya — appreciated. I'll stay in touch.",
  },
];

const FILTERS: { key: "all" | "unread" | Classification; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "interested", label: "Interested" },
  { key: "needs_review", label: "Needs review" },
  { key: "not_interested", label: "Not interested" },
  { key: "out_of_office", label: "Out of office" },
  { key: "referral", label: "Referral" },
];

function InboxPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>(THREADS_SEED);
  const [accountFilter, setAccountFilter] = useState("all");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(THREADS_SEED[0].id);
  const [draft, setDraft] = useState<string>(THREADS_SEED[0].aiDraft);
  const [draftDiscarded, setDraftDiscarded] = useState(false);
  const [justSentAt, setJustSentAt] = useState<string | null>(null);
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (accountFilter !== "all" && t.account !== accountFilter) return false;
      if (filter === "all") return true;
      if (filter === "unread") return t.unread;
      return t.classification === filter;
    });
  }, [threads, filter, accountFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: threads.length, unread: 0 };
    threads.forEach((t) => {
      if (t.unread) c.unread = (c.unread ?? 0) + 1;
      c[t.classification] = (c[t.classification] ?? 0) + 1;
    });
    return c;
  }, [threads]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  // Mark read + reset draft when selecting
  useEffect(() => {
    if (!selectedId) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, unread: false } : t)),
    );
    const t = THREADS_SEED.find((x) => x.id === selectedId);
    setDraft(t?.aiDraft ?? "");
    setDraftDiscarded(false);
    setJustSentAt(null);
  }, [selectedId]);

  // Autoscroll thread
  useEffect(() => {
    if (threadScrollRef.current) {
      threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
    }
  }, [selectedId]);

  // Keyboard shortcuts
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
  }, [filtered, selectedId, draft]);

  const handleSend = () => {
    if (!selected || !draft.trim()) return;
    toast.success(`Reply sent to ${selected.candidate} via LinkedIn`);
    const now = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setJustSentAt(now);
    setDraft("");
    setTimeout(() => setJustSentAt(null), 3000);
  };

  const overrideClassification = (c: Classification) => {
    if (!selected) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selected.id ? { ...t, classification: c } : t)),
    );
    toast.success("Classification updated");
  };

  const unreadCount = counts.unread ?? 0;
  const accountCount = new Set(threads.map((t) => t.account)).size;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <PageHeader
        title="Inbox"
        subtitle={`${unreadCount} unread ${unreadCount === 1 ? "reply" : "replies"} across ${accountCount} accounts`}
        actions={
          <>
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
                <SelectItem value="Amarsh Jain">Amarsh Jain</SelectItem>
                <SelectItem value="Dewi Putri">Dewi Putri</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key] ?? 0;
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
              {dot && !active && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
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
        <div className="flex w-[380px] flex-shrink-0 flex-col border-r border-border max-lg:w-[320px] max-md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] text-brand-text-secondary">
            <span>Last synced: 2 minutes ago</span>
            <button className="inline-flex items-center gap-1 hover:text-brand-text">
              <RefreshCw className="h-3 w-3" />
              Refresh
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
                  {selected.messages.map((m) => (
                    <MessageCard
                      key={m.id}
                      msg={m}
                      classification={
                        m.direction === "in" ? selected.classification : null
                      }
                      confidence={selected.confidence}
                    />
                  ))}
                </div>
              </div>
              <ReplyComposer
                draft={draft}
                setDraft={setDraft}
                discarded={draftDiscarded}
                onRegenerate={() => {
                  setDraft(selected.aiDraft);
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
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
            thread.unread ? "bg-blue-500" : "bg-transparent",
          )}
        />
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
          <p className="mt-1.5 line-clamp-2 text-[12px] text-brand-text-secondary">
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
  return (
    <div className="border-b border-border px-6 py-4">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onView} className="text-left hover:underline">
          <div className="text-base font-medium text-brand-text">{thread.candidate}</div>
          <div className="text-[13px] text-brand-text-secondary">{thread.position}</div>
        </button>
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
              <DropdownMenuItem
                onClick={() => toast.success("Opens pipeline picker (placeholder)")}
              >
                Move to project pipeline
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success("Opens note dialog (placeholder)")}
              >
                Add note to candidate
              </DropdownMenuItem>
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
          : `Classified as: ${CLASSIFICATION_META[thread.classification].label} (${thread.confidence}% confidence)`}
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
  const initials = msg.author
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const isIn = msg.direction === "in";
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        isIn
          ? "border border-brand-mint/30 border-l-4 border-l-brand-mint bg-brand-seafoam/10"
          : "border border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2 text-[12px] text-brand-text-secondary">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium",
            isIn ? "bg-brand-seafoam text-brand-primary" : "bg-brand-bg text-brand-text",
          )}
        >
          {initials}
        </span>
        <span className="font-medium text-brand-text">{msg.author}</span>
        {msg.channel && <span>· {msg.channel}</span>}
        <span>· {msg.timestamp}</span>
      </div>
      {msg.campaignContext && (
        <div className="mt-1 text-[11px] text-brand-text-secondary">
          {msg.campaignContext}
        </div>
      )}
      <div className="my-3 h-px bg-border" />
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
        {msg.body}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {msg.status && (
          <span className="inline-flex items-center gap-1 text-[11px] text-brand-text-secondary">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
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
  draft,
  setDraft,
  discarded,
  onRegenerate,
  onDiscard,
  onSend,
  justSentAt,
  textareaRef,
}: {
  draft: string;
  setDraft: (v: string) => void;
  discarded: boolean;
  onRegenerate: () => void;
  onDiscard: () => void;
  onSend: () => void;
  justSentAt: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="border-t border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-[12px] font-medium text-brand-primary">
            AI suggested reply
          </span>
          <span className="text-[12px] text-brand-text-secondary">
            Edit freely — you send when ready
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Regenerate
          </Button>
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            Discard suggestion
          </Button>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={discarded ? "Write your reply..." : ""}
        className="min-h-[100px] resize-y text-sm leading-relaxed focus-visible:ring-brand-mint/30"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button onClick={onSend} disabled={!draft.trim()}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send reply
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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
                Tomorrow morning
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
        {justSentAt && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Reply sent via LinkedIn at {justSentAt}
          </span>
        )}
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
        Choose a message from the left panel to view the full thread and reply.
      </p>
      <InboxIcon className="sr-only" />
    </div>
  );
}
