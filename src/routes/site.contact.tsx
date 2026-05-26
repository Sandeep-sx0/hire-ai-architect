import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, UserRound, Mail, MessageCircle, CheckCircle2, Upload } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Syndie Recruit" },
      {
        name: "description",
        content:
          "Reach the Syndie Recruit team — hiring clients and candidates have dedicated intake forms plus WhatsApp and email.",
      },
      { property: "og:title", content: "Contact Syndie Recruit" },
      {
        property: "og:description",
        content: "Whether you're hiring or job-hunting, start the conversation here.",
      },
    ],
  }),
  component: ContactPage,
});

type Track = "hire" | "candidate" | null;

function ContactPage() {
  const [track, setTrack] = useState<Track>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <PublicLayout>
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-brand-primary">
            Contact
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-text md:text-5xl">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-brand-text-secondary">
            Pick a track below and we'll route you to the right team.
          </p>

          {/* Quick contact strip */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <a
              href="https://wa.me/628194421035"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 font-medium text-green-700 hover:bg-green-100"
            >
              <MessageCircle className="h-4 w-4" />
              +62 819 4421 0355
            </a>
            <a
              href="mailto:hello@syndierecruit.com"
              className="inline-flex items-center gap-2 rounded-full bg-brand-seafoam/30 px-4 py-2 font-medium text-brand-primary hover:bg-brand-seafoam/50"
            >
              <Mail className="h-4 w-4" />
              hello@syndierecruit.com
            </a>
          </div>
        </div>
      </section>

      <section className="bg-brand-bg">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {submitted ? (
            <SuccessCard track={track} onReset={() => { setSubmitted(false); setTrack(null); }} />
          ) : (
            <>
              {/* Track buttons */}
              <div className="grid gap-4 md:grid-cols-2">
                <TrackButton
                  active={track === "hire"}
                  icon={<Briefcase className="h-5 w-5" />}
                  title="I want to hire"
                  body="Start an executive search or consulting engagement."
                  onClick={() => setTrack("hire")}
                />
                <TrackButton
                  active={track === "candidate"}
                  icon={<UserRound className="h-5 w-5" />}
                  title="I'm a candidate"
                  body="Share your CV or ask about a specific opportunity."
                  onClick={() => setTrack("candidate")}
                />
              </div>

              {track === "hire" && (
                <HireForm onSubmitted={() => setSubmitted(true)} />
              )}
              {track === "candidate" && (
                <CandidateForm onSubmitted={() => setSubmitted(true)} />
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function TrackButton({
  active,
  icon,
  title,
  body,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border-2 bg-white p-6 text-left transition-all",
        active
          ? "border-brand-primary shadow-sm ring-2 ring-brand-primary/10"
          : "border-gray-200 hover:border-brand-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          active ? "bg-brand-primary text-white" : "bg-brand-seafoam/40 text-brand-primary",
        )}
      >
        {icon}
      </div>
      <div className="text-lg font-semibold text-brand-text">{title}</div>
      <div className="text-sm text-brand-text-secondary">{body}</div>
    </button>
  );
}

function FormShell({
  title,
  onSubmit,
  children,
}: {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-5 rounded-2xl border border-gray-100 bg-white p-6 md:p-8"
    >
      <h2 className="text-xl font-semibold text-brand-text">{title}</h2>
      {children}
      <p className="text-xs text-brand-text-secondary">
        We'll confirm via <span className="font-medium text-brand-text">hello@syndierecruit.com</span>{" "}
        within one business day.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-brand-text">{label}</Label>
      {children}
    </div>
  );
}

function HireForm({ onSubmitted }: { onSubmitted: () => void }) {
  return (
    <FormShell
      title="Tell us about the hire"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitted();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company name"><Input required placeholder="Acme Holdings" /></Field>
        <Field label="Your name"><Input required placeholder="Full name" /></Field>
        <Field label="Email"><Input required type="email" placeholder="you@company.com" /></Field>
        <Field label="Phone"><Input type="tel" placeholder="+62 ..." /></Field>
        <Field label="WhatsApp"><Input type="tel" placeholder="+62 ..." /></Field>
        <Field label="Urgency">
          <Select>
            <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate (this month)</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="exploring">Exploring</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Role description">
        <Textarea required rows={5} placeholder="Role, scope, location, reporting line..." />
      </Field>
      <Button type="submit" size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
        Send request
      </Button>
    </FormShell>
  );
}

function CandidateForm({ onSubmitted }: { onSubmitted: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <FormShell
      title="Tell us about yourself"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitted();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name"><Input required placeholder="Full name" /></Field>
        <Field label="Email"><Input required type="email" placeholder="you@email.com" /></Field>
        <Field label="Phone"><Input type="tel" placeholder="+62 ..." /></Field>
        <Field label="LinkedIn URL"><Input type="url" placeholder="https://linkedin.com/in/..." /></Field>
        <Field label="Current role"><Input placeholder="e.g. VP Engineering at ..." /></Field>
      </div>
      <Field label="CV">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-brand-bg px-4 py-6 text-sm text-brand-text-secondary hover:border-brand-primary/40"
        >
          <Upload className="h-4 w-4" />
          {fileName ?? "Click to upload (.pdf, .doc, .docx)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </Field>
      <Field label="Message">
        <Textarea rows={4} placeholder="Anything we should know?" />
      </Field>
      <Button type="submit" size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
        Send message
      </Button>
    </FormShell>
  );
}

function SuccessCard({ track, onReset }: { track: Track; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-7 w-7 text-green-600" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-brand-text">
        {track === "hire" ? "Thanks — we'll be in touch." : "Got it — thanks for reaching out."}
      </h2>
      <p className="mt-3 text-brand-text-secondary">
        We'll confirm via <span className="font-medium text-brand-text">hello@syndierecruit.com</span>{" "}
        within one business day. For anything urgent, message us on WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href="https://wa.me/628194421035"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4" /> +62 819 4421 0355
        </a>
        <Button variant="outline" onClick={onReset}>Send another message</Button>
      </div>
    </div>
  );
}
