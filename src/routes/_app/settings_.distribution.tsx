import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Unplug,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CHANNELS,
  channelConnections,
  connectionTone,
  type ChannelConfig,
  type ChannelId,
  type ConnectionState,
} from "@/lib/distribution";
import { currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/settings_/distribution")({
  head: () => ({ meta: [{ title: "Distribution — Settings — HireSmart" }] }),
  component: DistributionSettingsPage,
});

function DistributionSettingsPage() {
  // RBAC: Owner / Admin only.
  const allowed = currentUser.role === "owner" || currentUser.role === "admin";

  const [connectTarget, setConnectTarget] = useState<ChannelConfig | null>(null);
  const [state, setState] = useState(channelConnections);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-brand-text-secondary" />
        <h2 className="text-lg font-semibold text-brand-text">Owner / Admin access required</h2>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Workspace distribution credentials are restricted to Owners and Admins.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/settings">Back to settings</Link>
        </Button>
      </div>
    );
  }

  const connectedCount = Object.values(state).filter((c) => c.state === "connected").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-brand-text-secondary">
        <Link to="/settings" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Settings
        </Link>
        <span>/</span>
        <span className="text-brand-text">Distribution</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Distribution channels</h1>
          <p className="mt-1 max-w-2xl text-sm text-brand-text-secondary">
            Manage how this workspace posts roles to external job boards. Posting accounts belong to
            HireSmart — never to individual recruiters — so postings survive staff changes.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-right">
          <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
            Channels connected
          </div>
          <div className="mt-0.5 text-2xl font-semibold text-brand-text">
            {connectedCount}
            <span className="text-base font-normal text-brand-text-secondary"> / {CHANNELS.length}</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-status-info/30 bg-status-info/10 p-3 text-xs text-brand-text">
        <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-status-info" />
        Partner-gated boards (LinkedIn Jobs, Indeed) require approval through their respective partner
        programs. We'll show an honest <em>Awaiting partner access</em> state until you're admitted —
        no posting will go live in the meantime.
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {CHANNELS.map((ch) => {
          const conn = state[ch.id];
          const tone = connectionTone(conn.state);
          return (
            <div key={ch.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white", ch.accent)}>
                  {ch.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-brand-text">{ch.name}</div>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", tone.className)}>
                      {tone.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-text-secondary">{ch.blurb}</p>
                  {conn.account && (
                    <div className="mt-2 text-xs text-brand-text">
                      <span className="text-brand-text-secondary">Account: </span>
                      {conn.account}
                    </div>
                  )}
                  {conn.note && (
                    <div
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 text-[11px]",
                        conn.state === "error" ? "text-status-danger" : "text-brand-text-secondary",
                      )}
                    >
                      {conn.state === "error" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {conn.note}
                    </div>
                  )}
                  {conn.lastChecked && (
                    <div className="mt-1 text-[11px] text-brand-text-secondary">
                      Last checked {conn.lastChecked}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                {conn.state === "connected" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        setState((s) => ({ ...s, [ch.id]: { ...s[ch.id], lastChecked: "just now" } }))
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Re-check
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-status-danger"
                      onClick={() => {
                        setState((s) => ({ ...s, [ch.id]: { state: "not_connected" } }));
                        toast.success(`${ch.name} disconnected`);
                      }}
                    >
                      <Unplug className="h-3.5 w-3.5" /> Disconnect
                    </Button>
                  </>
                )}
                {conn.state === "not_connected" && (
                  <Button
                    size="sm"
                    onClick={() => setConnectTarget(ch)}
                    className="gap-1 bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" /> Connect
                  </Button>
                )}
                {conn.state === "error" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConnectTarget(ch)}
                    className="gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reconnect
                  </Button>
                )}
                {conn.state === "pending_partner" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => toast("Partner-access status checked — still pending")}
                  >
                    Check status
                  </Button>
                )}
                {ch.id === "careers_page" && conn.state === "connected" && (
                  <Button asChild size="sm" variant="ghost" className="gap-1">
                    <Link to="/distribution">
                      <SettingsIcon className="h-3.5 w-3.5" /> View postings
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConnectChannelDialog
        channel={connectTarget}
        onOpenChange={(open) => !open && setConnectTarget(null)}
        onConnected={(id, account) => {
          setState((s) => ({
            ...s,
            [id]: { state: "connected", account, lastChecked: "just now" },
          }));
          setConnectTarget(null);
        }}
        onRegisterInterest={(id) => {
          setState((s) => ({
            ...s,
            [id]: { state: "pending_partner", note: "Registered just now — review typically 2–4 weeks" },
          }));
          setConnectTarget(null);
        }}
      />
    </div>
  );
}

function ConnectChannelDialog({
  channel,
  onOpenChange,
  onConnected,
  onRegisterInterest,
}: {
  channel: ChannelConfig | null;
  onOpenChange: (open: boolean) => void;
  onConnected: (id: ChannelId, account: string) => void;
  onRegisterInterest: (id: ChannelId) => void;
}) {
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const open = channel !== null;
  if (!channel) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const isPartner = channel.integration === "partner_gated";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setField1("");
          setField2("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPartner ? `Register interest — ${channel.name}` : `Connect ${channel.name}`}
          </DialogTitle>
          <DialogDescription>
            {isPartner
              ? "Programmatic posting requires partner-program approval. Register interest and we'll surface the access status here."
              : channel.integration === "advertiser_account"
              ? "Enter the workspace-owned advertiser credentials. These are stored at the workspace level."
              : "Enter the API credentials for this board. Stored encrypted at the workspace level."}
          </DialogDescription>
        </DialogHeader>

        {isPartner ? (
          <div className="space-y-2 text-sm">
            <div className="rounded-md border border-status-warning/30 bg-status-warning/10 p-3 text-xs text-brand-text">
              Typical approval window: 2–4 weeks. Until approved, this channel cannot post —
              we'll never fake a “Live” status.
            </div>
            <Label htmlFor="contact">Primary contact email</Label>
            <Input
              id="contact"
              type="email"
              placeholder="distribution@norvex.example"
              value={field1}
              onChange={(e) => setField1(e.target.value)}
            />
          </div>
        ) : channel.integration === "advertiser_account" ? (
          <div className="space-y-3 text-sm">
            <div>
              <Label htmlFor="advid">Advertiser / Customer ID</Label>
              <Input id="advid" value={field1} onChange={(e) => setField1(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="key">API key</Label>
              <Input id="key" type="password" value={field2} onChange={(e) => setField2(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <Label htmlFor="acct">Account label</Label>
              <Input id="acct" placeholder="e.g. Norvex HK" value={field1} onChange={(e) => setField1(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="apikey">API key</Label>
              <Input id="apikey" type="password" value={field2} onChange={(e) => setField2(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isPartner ? (
            <Button
              disabled={!field1}
              onClick={() => {
                onRegisterInterest(channel.id);
                toast.success("Interest registered — we'll notify you when access is granted");
              }}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Register interest
            </Button>
          ) : (
            <Button
              disabled={!field1 || !field2}
              onClick={() => {
                onConnected(channel.id, field1);
                toast.success(`${channel.name} connected`);
              }}
              className="gap-1 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              <CheckCircle2 className="h-4 w-4" /> Connect
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
