import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Clock,
  Flame,
  MoreHorizontal,
  Plus,
  Settings as SettingsIcon,
  User as UserIcon,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScoreRing, StatusBadge } from "@/components/shared";
import {
  ScorecardForm,
  MOCK_RINA_SCORECARD,
  type SubmittedScorecard,
} from "./ScorecardForm";
import { CandidateSheet } from "./CandidateSheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StageId =
  | "applied"
  | "screening"
  | "shortlisted"
  | "submitted"
  | "interview"
  | "offer"
  | "placed"
  | "rejected";

interface Stage {
  id: StageId;
  label: string;
  color: string;
  gated?: boolean;
  checklistRequired?: number;
}

const STAGES: Stage[] = [
  { id: "applied", label: "Applied", color: "#d1d5db" },
  { id: "screening", label: "Screening", color: "#fbbf24" },
  { id: "shortlisted", label: "Shortlisted", color: "#a855f7" },
  { id: "submitted", label: "Submitted to client", color: "#3b82f6", gated: true },
  { id: "interview", label: "Interview", color: "#2563eb" },
  { id: "offer", label: "Offer", color: "#4ade80" },
  { id: "placed", label: "Placed", color: "#16a34a" },
  { id: "rejected", label: "Rejected", color: "#f87171" },
];

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  skills: string[];
  stage: StageId;
  daysInStage: number;
  assigned: string;
  checklist: { label: string; done: boolean }[];
  hot?: boolean;
  rejectionReason?: string;
}

const SCREENING_CHECKLIST = [
  "Initial profile review completed",
  "LinkedIn profile verified",
  "Phone screen scheduled",
  "Salary expectations confirmed",
  "Notice period verified",
];

const SHORTLIST_CHECKLIST = [
  "Reference check started",
  "Compensation aligned",
  "Client brief shared",
];

const SUBMITTED_CHECKLIST = [
  "Scorecard complete",
  "Profile dossier prepared",
  "Submitted via portal",
  "Client confirmation received",
];

const INITIAL: Candidate[] = [
  {
    id: "p1",
    name: "Rina Wijaya",
    title: "CFO",
    company: "PT Telkom Indonesia",
    score: 88,
    skills: ["IFRS", "M&A", "Board"],
    stage: "shortlisted",
    daysInStage: 3,
    assigned: "Amarsh",
    checklist: SHORTLIST_CHECKLIST.map((label) => ({ label, done: true })),
    hot: true,
  },
  {
    id: "p2",
    name: "Priya Nair",
    title: "Group CFO",
    company: "Tata Motors",
    score: 85,
    skills: ["Treasury", "M&A", "IPO"],
    stage: "submitted",
    daysInStage: 1,
    assigned: "Amarsh",
    checklist: SUBMITTED_CHECKLIST.map((label, i) => ({ label, done: i < 2 })),
  },
  {
    id: "p3",
    name: "Amara Osei",
    title: "CFO",
    company: "Fonterra SEA",
    score: 82,
    skills: ["FP&A", "IFRS", "ESG"],
    stage: "screening",
    daysInStage: 5,
    assigned: "Dewi",
    checklist: SCREENING_CHECKLIST.map((label, i) => ({ label, done: i < 4 })),
  },
  {
    id: "p4",
    name: "Budi Santoso",
    title: "VP Finance",
    company: "Astra International",
    score: 76,
    skills: ["FP&A", "Tax", "Board"],
    stage: "interview",
    daysInStage: 2,
    assigned: "Amarsh",
    checklist: [],
  },
  {
    id: "p5",
    name: "Patrick O'Brien",
    title: "Group Treasurer",
    company: "BHP",
    score: 71,
    skills: ["Treasury", "Risk", "FX"],
    stage: "screening",
    daysInStage: 8,
    assigned: "Dewi",
    checklist: SCREENING_CHECKLIST.map((label, i) => ({ label, done: i < 1 })),
  },
  {
    id: "p6",
    name: "Sarah Mitchell",
    title: "Regional Finance",
    company: "Unilever",
    score: 64,
    skills: ["FP&A", "SAP"],
    stage: "applied",
    daysInStage: 1,
    assigned: "Dewi",
    checklist: [],
  },
  {
    id: "p7",
    name: "Dewi Anggraini",
    title: "VP Corp Finance",
    company: "Indofood",
    score: 68,
    skills: ["M&A", "Tax"],
    stage: "rejected",
    daysInStage: 0,
    assigned: "Amarsh",
    checklist: [],
    rejectionReason:
      "Salary expectations — candidate's expectation of $300K exceeds the $250K budget ceiling",
  },
  {
    id: "p8",
    name: "James Chen",
    title: "Finance Director",
    company: "Wilmar",
    score: 55,
    skills: ["IFRS", "Tax"],
    stage: "applied",
    daysInStage: 3,
    assigned: "Amarsh",
    checklist: [],
  },
];

const CANDIDATES_POOL: Omit<Candidate, "stage" | "daysInStage" | "checklist">[] = [
  { id: "pool1", name: "Mei Tan", title: "CFO", company: "Singtel", score: 81, skills: ["IFRS", "FP&A"], assigned: "Amarsh" },
  { id: "pool2", name: "Arjun Mehta", title: "VP Finance", company: "Reliance", score: 74, skills: ["M&A", "Treasury"], assigned: "Dewi" },
  { id: "pool3", name: "Linh Nguyen", title: "Finance Director", company: "VinGroup", score: 78, skills: ["Tax", "FP&A"], assigned: "Amarsh" },
  { id: "pool4", name: "Hiroshi Tanaka", title: "Group CFO", company: "Sony Music", score: 86, skills: ["IPO", "Board"], assigned: "Amarsh" },
  { id: "pool5", name: "Aisha Rahman", title: "Head of Finance", company: "Grab", score: 72, skills: ["FP&A", "ESG"], assigned: "Dewi" },
  { id: "pool6", name: "Carlos Mendez", title: "CFO", company: "Mercado Libre", score: 79, skills: ["M&A", "IFRS"], assigned: "Amarsh" },
];

interface RejectModalState {
  candidate: Candidate;
  from: StageId;
}

interface PlaceModalState {
  candidate: Candidate;
  from: StageId;
}

export function PipelineKanban() {
  const [cards, setCards] = useState<Candidate[]>(INITIAL);
  const [filter, setFilter] = useState<"all" | "Amarsh" | "Dewi">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState | null>(null);
  const [placeModal, setPlaceModal] = useState<PlaceModalState | null>(null);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [scorecards, setScorecards] = useState<Record<string, SubmittedScorecard[]>>({
    p1: [MOCK_RINA_SCORECARD],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const filtered = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.assigned === filter)),
    [cards, filter],
  );

  const byStage = useMemo(() => {
    const map: Record<StageId, Candidate[]> = {
      applied: [],
      screening: [],
      shortlisted: [],
      submitted: [],
      interview: [],
      offer: [],
      placed: [],
      rejected: [],
    };
    filtered.forEach((c) => map[c.stage].push(c));
    return map;
  }, [filtered]);

  const selectedCandidate = cards.find((c) => c.id === selected) ?? null;
  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  const moveCard = (id: string, to: StageId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: to, daysInStage: 0 } : c)),
    );
  };

  const attemptMove = (candidate: Candidate, to: StageId) => {
    if (candidate.stage === to) return;
    const stage = STAGES.find((s) => s.id === to)!;
    const fromIndex = STAGES.findIndex((s) => s.id === candidate.stage);
    const toIndex = STAGES.findIndex((s) => s.id === to);

    // Gate enforcement: blocking advance into a gated stage if the source checklist is incomplete
    if (to === "submitted" && stage.gated) {
      const incomplete = candidate.checklist.length === 0 || candidate.checklist.some((i) => !i.done);
      if (incomplete) {
        toast.error("Complete the screening checklist before advancing");
        return;
      }
    }

    if (to === "rejected") {
      setRejectModal({ candidate, from: candidate.stage });
      return;
    }
    if (to === "placed") {
      setPlaceModal({ candidate, from: candidate.stage });
      return;
    }

    moveCard(candidate.id, to);
    if (toIndex > fromIndex) {
      toast.success(`${candidate.name} moved to ${stage.label}`);
    } else {
      toast(`${candidate.name} moved back to ${stage.label}`);
    }
  };

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const id = String(e.active.id);
    const to = String(e.over.id) as StageId;
    const candidate = cards.find((c) => c.id === id);
    if (!candidate) return;
    attemptMove(candidate, to);
  };

  const toggleChecklist = (candidateId: string, idx: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              checklist: c.checklist.map((item, i) =>
                i === idx ? { ...item, done: !item.done } : item,
              ),
            }
          : c,
      ),
    );
  };

  return (
    <div>
      {/* Header bar */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-medium text-brand-text">Pipeline</div>
          <div className="text-[13px] text-brand-text-secondary">
            {filtered.length} candidates in pipeline
          </div>
          <div className="text-[12px] text-brand-text-secondary">Updated 2 hours ago</div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-9 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All candidates</SelectItem>
              <SelectItem value="Amarsh">Assigned: Amarsh</SelectItem>
              <SelectItem value="Dewi">Assigned: Dewi</SelectItem>
            </SelectContent>
          </Select>
          <button className="inline-flex items-center gap-1 text-[12px] text-brand-text-secondary hover:text-brand-text">
            <SettingsIcon className="h-3.5 w-3.5" />
            Customize stages
          </button>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add candidate
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex flex-nowrap gap-4 overflow-x-auto px-2 pb-4">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              cards={byStage[stage.id]}
              activeId={activeId}
              onCardClick={(id) => setSelected(id)}
              onMenuMove={(candidate, to) => attemptMove(candidate, to)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-1 opacity-90 shadow-lg">
              <CardBody candidate={activeCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stage detail slide-over */}
      <SidePanel
        isOpen={!!selectedCandidate}
        onClose={() => setSelected(null)}
        title="Candidate detail"
        width="lg"
      >
        {selectedCandidate && (
          <StageDetail
            candidate={selectedCandidate}
            scorecards={scorecards[selectedCandidate.id] ?? []}
            onAddScorecard={() => setScorecardOpen(true)}
            onToggleChecklist={(idx) => toggleChecklist(selectedCandidate.id, idx)}
            onAdvance={() => {
              const idx = STAGES.findIndex((s) => s.id === selectedCandidate.stage);
              const next = STAGES[idx + 1];
              if (next && next.id !== "rejected") attemptMove(selectedCandidate, next.id);
            }}
            onReject={() =>
              setRejectModal({ candidate: selectedCandidate, from: selectedCandidate.stage })
            }
          />
        )}
      </SidePanel>

      {/* Scorecard form */}
      {selectedCandidate && (
        <ScorecardForm
          open={scorecardOpen}
          onClose={() => setScorecardOpen(false)}
          candidate={{
            name: selectedCandidate.name,
            title: selectedCandidate.title,
            company: selectedCandidate.company,
            score: selectedCandidate.score,
            initials: selectedCandidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          }}
          stageLabel={STAGES.find((s) => s.id === selectedCandidate.stage)!.label}
          projectLabel="CFO Search — Indorama"
          evaluatorName="Dewi Anggraini"
          evaluatorInitials="DA"
          onSubmit={(card) =>
            setScorecards((prev) => ({
              ...prev,
              [selectedCandidate.id]: [...(prev[selectedCandidate.id] ?? []), card],
            }))
          }
        />
      )}

      {/* Rejection dialog */}
      <RejectDialog
        state={rejectModal}
        onCancel={() => setRejectModal(null)}
        onConfirm={(reason) => {
          if (!rejectModal) return;
          setCards((prev) =>
            prev.map((c) =>
              c.id === rejectModal.candidate.id
                ? { ...c, stage: "rejected", daysInStage: 0, rejectionReason: reason }
                : c,
            ),
          );
          toast.success(`${rejectModal.candidate.name} rejected — ${reason}`);
          setRejectModal(null);
        }}
      />

      {/* Placement dialog */}
      <PlaceDialog
        state={placeModal}
        onCancel={() => setPlaceModal(null)}
        onConfirm={() => {
          if (!placeModal) return;
          moveCard(placeModal.candidate.id, "placed");
          toast.success(`🎉 ${placeModal.candidate.name} placed!`);
          setPlaceModal(null);
        }}
      />

      {/* Add candidate dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setAddQuery(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add candidate to pipeline</DialogTitle>
            <DialogDescription>Select a candidate to add to the Applied stage.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Search candidates..."
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
          />
          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            {(() => {
              const existingIds = new Set(cards.map((c) => c.id));
              const q = addQuery.trim().toLowerCase();
              const list = CANDIDATES_POOL.filter((c) => !existingIds.has(c.id)).filter(
                (c) =>
                  !q ||
                  c.name.toLowerCase().includes(q) ||
                  c.company.toLowerCase().includes(q) ||
                  c.title.toLowerCase().includes(q),
              );
              if (list.length === 0) {
                return (
                  <div className="p-4 text-center text-sm text-brand-text-secondary">
                    No candidates available
                  </div>
                );
              }
              return list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCards((prev) => [
                      ...prev,
                      {
                        ...c,
                        stage: "applied",
                        daysInStage: 0,
                        checklist: [],
                      },
                    ]);
                    toast.success(`${c.name} added to Applied`);
                    setAddOpen(false);
                    setAddQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left last:border-0 hover:bg-brand-mint/10"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-brand-text">{c.name}</div>
                    <div className="truncate text-xs text-brand-text-secondary">
                      {c.title} · {c.company}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-primary">{c.score}</span>
                </button>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------- Column ----------------- */

function StageColumn({
  stage,
  cards,
  activeId,
  onCardClick,
  onMenuMove,
}: {
  stage: Stage;
  cards: Candidate[];
  activeId: string | null;
  onCardClick: (id: string) => void;
  onMenuMove: (c: Candidate, to: StageId) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] flex-shrink-0 flex-col rounded-xl bg-brand-bg/30 transition-colors",
        isOver && "bg-brand-mint/15 ring-2 ring-dashed ring-brand-primary",
      )}
    >
      <div
        className="h-1 rounded-t-xl"
        style={{ backgroundColor: stage.color }}
      />
      <div className="border-b border-gray-100 px-3 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-brand-text">{stage.label}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {cards.length}
          </span>
        </div>
      </div>
      <div className="flex max-h-[calc(100vh-340px)] flex-col gap-2 overflow-y-auto p-3">
        {cards.length === 0 ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-[13px] text-brand-text-secondary">
            Drag candidates here
          </div>
        ) : (
          cards.map((c) => (
            <DraggableCard
              key={c.id}
              candidate={c}
              isDragging={activeId === c.id}
              onClick={() => onCardClick(c.id)}
              onMove={(to) => onMenuMove(c, to)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ----------------- Card ----------------- */

function DraggableCard({
  candidate,
  isDragging,
  onClick,
  onMove,
}: {
  candidate: Candidate;
  isDragging: boolean;
  onClick: () => void;
  onMove: (to: StageId) => void;
}) {
  const { setNodeRef, attributes, listeners } = useDraggable({ id: candidate.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-no-drag]")) return;
        onClick();
      }}
      className={cn(
        "group relative cursor-grab transition-all active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <CardBody candidate={candidate} onMove={onMove} />
    </div>
  );
}

function CardBody({
  candidate,
  onMove,
}: {
  candidate: Candidate;
  onMove?: (to: StageId) => void;
}) {
  const overdue = candidate.daysInStage >= 7 && candidate.stage !== "placed" && candidate.stage !== "rejected";
  const checklistDone = candidate.checklist.filter((i) => i.done).length;
  const checklistTotal = candidate.checklist.length;
  const placed = candidate.stage === "placed";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-brand-mint hover:shadow-md",
        overdue && "border-l-[3px] border-l-amber-400",
        placed && "border-green-300 bg-green-50/40",
      )}
    >
      {candidate.hot && (
        <Flame className="absolute right-2 top-2 h-3.5 w-3.5 text-green-500" />
      )}
      <div className="flex items-start gap-2.5">
        <ScoreRing score={candidate.score} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <div className="truncate text-sm font-medium text-brand-text">
              {candidate.name}
            </div>
            {onMove && (
              <div data-no-drag className="opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded p-0.5 text-brand-text-secondary hover:bg-brand-bg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => toast("Opens full profile")}>
                      View full profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Note dialog")}>
                      Add note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Scorecard dialog")}>
                      Add scorecard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Move to…</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {STAGES.filter(
                          (s) => s.id !== candidate.stage && s.id !== "rejected",
                        ).map((s) => (
                          <DropdownMenuItem key={s.id} onClick={() => onMove(s.id)}>
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-status-danger"
                      onClick={() => onMove("rejected")}
                    >
                      <X className="mr-2 h-3.5 w-3.5" />
                      Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="truncate text-[12px] text-brand-text-secondary">
            {candidate.title} · {candidate.company}
          </div>
        </div>
      </div>

      {candidate.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded bg-brand-bg px-1.5 py-0.5 text-xs text-brand-text-secondary"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[12px] text-brand-text-secondary">
        <span className={cn("inline-flex items-center gap-1", overdue && "text-amber-600 font-medium")}>
          <Clock className="h-3 w-3" />
          {candidate.daysInStage === 0 ? "Today" : `${candidate.daysInStage} days`}
          {overdue && " (7+)"}
        </span>
        <span className="inline-flex items-center gap-1">
          <UserIcon className="h-3 w-3" />
          {candidate.assigned}
        </span>
      </div>

      {checklistTotal > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-brand-text-secondary tabular-nums">
            Checklist {checklistDone}/{checklistTotal}
          </span>
          <div className="h-[3px] w-10 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-brand-primary"
              style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
            />
          </div>
        </div>
      )}

      {candidate.rejectionReason && (
        <div className="mt-2 text-[11px] italic text-brand-text-secondary line-clamp-2">
          {candidate.rejectionReason}
        </div>
      )}
    </div>
  );
}

/* ----------------- Stage detail panel ----------------- */

function StageDetail({
  candidate,
  scorecards,
  onAddScorecard,
  onToggleChecklist,
  onAdvance,
  onReject,
}: {
  candidate: Candidate;
  scorecards: SubmittedScorecard[];
  onAddScorecard: () => void;
  onToggleChecklist: (idx: number) => void;
  onAdvance: () => void;
  onReject: () => void;
}) {
  const stage = STAGES.find((s) => s.id === candidate.stage)!;
  const idx = STAGES.findIndex((s) => s.id === candidate.stage);
  const next = STAGES[idx + 1];
  const history = [
    { from: "Applied", to: "Screening", who: "Amarsh", when: "5 days ago" },
    { from: "Screening", to: "Shortlisted", who: "Amarsh", when: "3 days ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <ScoreRing score={candidate.score} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-brand-text">{candidate.name}</div>
          <div className="text-sm text-brand-text-secondary">
            {candidate.title} · {candidate.company}
          </div>
          <div className="mt-2">
            <StatusBadge status={stage.id === "submitted" ? "submitted" : stage.id} label={stage.label} />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-brand-text">
          {stage.label} checklist
        </h3>
        {candidate.checklist.length === 0 ? (
          <p className="text-[13px] text-brand-text-secondary">
            No checklist for this stage.
          </p>
        ) : (
          <ul className="space-y-2">
            {candidate.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => onToggleChecklist(i)}
                  className="mt-0.5"
                />
                <span
                  className={cn(
                    "text-sm",
                    item.done
                      ? "text-brand-text-secondary line-through"
                      : "text-brand-text",
                  )}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Scorecards */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-brand-text">Scorecards</h3>
          <Button variant="outline" size="sm" onClick={onAddScorecard}>
            Add scorecard
          </Button>
        </div>
        <ScorecardsStack cards={scorecards} />
      </section>

      {/* Stage history */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-brand-text">Stage history</h3>
        <ul className="space-y-2">
          {history.map((h, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="rounded-md bg-brand-bg px-2 py-0.5 text-brand-text-secondary">
                {h.from}
              </span>
              <ArrowRight className="h-3 w-3 text-brand-text-secondary" />
              <span className="rounded-md bg-brand-seafoam px-2 py-0.5 text-brand-primary">
                {h.to}
              </span>
              <span className="text-brand-text-secondary">
                · {h.who}, {h.when}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Notes */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-brand-text">Notes</h3>
        <Textarea placeholder="Add a quick note…" className="min-h-[80px]" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => toast.success("Note saved")}>
            Add note
          </Button>
        </div>
      </section>

      {/* Quick actions */}
      <section className="border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {next && next.id !== "rejected" && (
            <Button onClick={onAdvance}>Move to {next.label}</Button>
          )}
          <Button variant="outline" className="text-status-danger" onClick={onReject}>
            Reject
          </Button>
          <button
            className="text-sm text-brand-primary hover:underline"
            onClick={() => toast("Open full profile")}
          >
            View full profile
          </button>
        </div>
      </section>
    </div>
  );
}

/* ----------------- Dialogs ----------------- */

const REJECTION_REASONS = [
  "Skills mismatch",
  "Experience gap",
  "Salary expectations",
  "Cultural fit",
  "Candidate withdrew",
  "Client rejected",
  "Position filled",
  "Other",
];

function RejectDialog({
  state,
  onCancel,
  onConfirm,
}: {
  state: RejectModalState | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <Dialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) {
          setReason("");
          setNote("");
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Reject {state?.candidate.name}?</DialogTitle>
          <DialogDescription>
            Project: CFO Search — Indorama Ventures
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Rejection reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why was this candidate rejected? This helps improve future matching."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!reason}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              onConfirm(reason);
              setReason("");
              setNote("");
            }}
          >
            Reject candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlaceDialog({
  state,
  onCancel,
  onConfirm,
}: {
  state: PlaceModalState | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [salary, setSalary] = useState("");
  const [note, setNote] = useState("");

  return (
    <Dialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) {
          setStartDate("");
          setSalary("");
          setNote("");
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Confirm placement?</DialogTitle>
          <DialogDescription>
            {state?.candidate.name} — {state?.candidate.title} at Indorama Ventures
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Final salary</Label>
            <Input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $245,000 USD"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={onConfirm}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Confirm placement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
