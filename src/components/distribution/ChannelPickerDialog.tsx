import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHANNELS,
  channelConnections,
  type ChannelId,
} from "@/lib/distribution";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Already-posted channels to disable in the picker. */
  alreadyPosted?: ChannelId[];
  onConfirm: (channels: ChannelId[]) => void;
}

export function ChannelPickerDialog({ open, onOpenChange, alreadyPosted = [], onConfirm }: Props) {
  const [selected, setSelected] = useState<ChannelId[]>([]);

  const toggle = (id: ChannelId) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleConfirm = () => {
    onConfirm(selected);
    setSelected([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post to more channels</DialogTitle>
          <DialogDescription>
            Choose where to distribute this role. Only connected channels can receive a posting now —
            partner-gated boards show their real access state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-[55vh] overflow-y-auto py-1">
          {CHANNELS.map((c) => {
            const conn = channelConnections[c.id];
            const alreadyDone = alreadyPosted.includes(c.id);
            const connected = conn.state === "connected";
            const disabled = alreadyDone || !connected;
            const checked = selected.includes(c.id);
            return (
              <label
                key={c.id}
                className={cn(
                  "relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  checked
                    ? "border-brand-primary bg-brand-mint/15"
                    : "border-border bg-card hover:bg-brand-bg/40",
                  disabled && "cursor-not-allowed opacity-70",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => !disabled && toggle(c.id)}
                  className="mt-1"
                />
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white", c.accent)}>
                  {c.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-brand-text">{c.name}</div>
                    {connected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-success/15 px-2 py-0.5 text-[10px] font-medium text-status-success">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    )}
                    {conn.state === "pending_partner" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-warning/15 px-2 py-0.5 text-[10px] font-medium text-status-warning">
                        <Lock className="h-3 w-3" /> Awaiting partner
                      </span>
                    )}
                    {conn.state === "not_connected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-brand-text-secondary">
                        Not connected
                      </span>
                    )}
                    {conn.state === "error" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-danger/15 px-2 py-0.5 text-[10px] font-medium text-status-danger">
                        <AlertCircle className="h-3 w-3" /> Reconnect
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-brand-text-secondary line-clamp-2">{c.blurb}</p>
                  {alreadyDone && (
                    <p className="mt-1 text-[11px] text-brand-text-secondary">Already posted</p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="rounded-md border border-border bg-brand-bg/40 p-3 text-xs text-brand-text-secondary">
          Manage credentials in{" "}
          <Link to="/settings/distribution" className="font-medium text-brand-primary hover:underline">
            Settings → Distribution
          </Link>
          . Posting accounts belong to your workspace — never to individual recruiters.
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={handleConfirm}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Queue {selected.length || ""} posting{selected.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
