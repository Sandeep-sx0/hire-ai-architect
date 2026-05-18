import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe,
  Mail,
  Briefcase,
  Building2,
  AlertTriangle,
  AlertCircle,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Hiresmart — White-Label AI Recruitment OS for Agencies" },
      {
        name: "description",
        content:
          "The recruitment operating system that runs under your brand. AI matching, LinkedIn outreach, candidate portals — all at your domain. Six weeks to launch.",
      },
      { property: "og:title", content: "Hiresmart — White-Label AI Recruitment OS" },
      {
        property: "og:description",
        content:
          "Boutique recruitment agencies deploy Hiresmart under their own brand and domain. AI matching, LinkedIn outreach, branded portals.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MarketingPage,
});

/* ============================================================
   Shared bits
   ============================================================ */

const ink = "#0A0B0D";
const bone = "#F4F1EA";
const lime = "#C8FF00";
const clay = "#D97757";
const surface = "#16181B";
const hair = "#2A2D31";

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const display = { fontFamily: "'Fraunces', serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] uppercase tracking-[0.18em]"
      style={{ ...mono, color: lime }}
    >
      {children}
    </div>
  );
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "", prefix = "", duration = 1400 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const { ref, seen } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* ============================================================
   Navbar
   ============================================================ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["Platform", "#platform"],
    ["Modules", "#modules"],
    ["For Agencies", "#agencies"],
    ["Pricing", "#pricing"],
    ["Changelog", "#changelog"],
  ];
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        backgroundColor: scrolled ? "rgba(10,11,13,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${hair}` : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="flex flex-col leading-none">
          <span style={{ ...display, color: bone }} className="text-[22px] font-bold tracking-tight">
            Hiresmart
          </span>
          <span style={{ ...mono, color: "#6F757D" }} className="mt-0.5 text-[10px] uppercase tracking-[0.16em]">
            [white-label os]
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ ...body, color: "#B6BBC2" }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#demo"
            className="hidden rounded-md border px-3.5 py-2 text-[13px] transition-colors hover:bg-white/5 md:inline-flex md:items-center md:gap-1.5"
            style={{ borderColor: hair, color: bone, ...body }}
          >
            See Live Demo <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#book"
            className="rounded-md px-3.5 py-2 text-[13px] font-medium"
            style={{ backgroundColor: lime, color: ink, ...body }}
          >
            Book a Call
          </a>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   Hero
   ============================================================ */

function NoiseBg() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay"
      aria-hidden
    >
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      <NoiseBg />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-16 px-6 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionLabel>§ 01 — The Platform</SectionLabel>
          <h1
            className="mt-7 font-bold leading-[0.96] tracking-[-0.02em]"
            style={{
              ...display,
              color: bone,
              fontSize: "clamp(2.6rem, 6.4vw, 5.6rem)",
            }}
          >
            Run your recruitment agency{" "}
            <span style={{ fontWeight: 900, fontStyle: "italic" }}>like a tech company.</span>{" "}
            <span style={{ color: "#8C9098" }}>Under your own brand.</span>
          </h1>
          <p
            className="mt-8 max-w-[60ch] text-[17px] leading-[1.6]"
            style={{ ...body, color: "#B6BBC2" }}
          >
            Hiresmart is the AI-native operating system that powers boutique recruitment
            agencies end-to-end — from JD intake to placement. Deploy it at{" "}
            <span style={mono}>app.youragency.com</span> in six weeks. Your logo, your domain,
            your client experience. We stay invisible.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3.5 text-[15px] font-medium transition-transform hover:-translate-y-px"
              style={{ backgroundColor: lime, color: ink, ...body }}
            >
              See the Live Demo <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#book"
              className="inline-flex items-center gap-2 rounded-md border px-5 py-3.5 text-[15px] transition-colors hover:bg-white/5"
              style={{ borderColor: hair, color: bone, ...body }}
            >
              Book a 30-min Walkthrough
            </a>
          </div>
          <div
            className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em]"
            style={{ ...mono, color: "#6F757D" }}
          >
            <span>Trusted by agencies in</span>
            <span style={{ color: bone }}>• Jakarta</span>
            <span style={{ color: bone }}>• Singapore</span>
            <span style={{ color: bone }}>• Dubai</span>
            <span style={{ color: bone }}>• London</span>
            <span style={{ color: bone }}>• Mumbai</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-3xl"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 20%, rgba(200,255,0,0.10), transparent 60%), radial-gradient(40% 40% at 10% 90%, rgba(217,119,87,0.12), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="relative rounded-2xl border p-5"
        style={{ backgroundColor: surface, borderColor: hair }}
      >
        {/* Project card */}
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: hair, backgroundColor: "#1B1E22" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" style={{ color: "#8C9098" }} />
              <span style={{ ...mono, color: "#8C9098" }} className="text-[10px] uppercase tracking-[0.14em]">
                M03 · Project
              </span>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ ...mono, backgroundColor: "rgba(200,255,0,0.12)", color: lime }}
            >
              SOURCING
            </span>
          </div>
          <div className="mt-2.5" style={{ ...display, color: bone }}>
            <div className="text-[20px] font-semibold leading-tight">CFO — Indorama Group</div>
            <div className="mt-1 text-[12px] font-normal" style={{ ...body, color: "#8C9098" }}>
              Jakarta · Permanent · USD 350k OTE
            </div>
          </div>
        </div>

        {/* Match card */}
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: hair, backgroundColor: "#1B1E22" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full"
                style={{ border: `2px solid ${lime}` }}
              >
                <span style={{ ...display, color: lime }} className="text-[18px] font-bold">
                  94
                </span>
              </div>
              <div>
                <div style={{ ...body, color: bone }} className="text-[13px] font-medium">
                  Rina W██████
                </div>
                <span
                  className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ ...mono, backgroundColor: "rgba(200,255,0,0.12)", color: lime }}
                >
                  STRONG MATCH
                </span>
              </div>
            </div>
            <span style={{ ...mono, color: "#6F757D" }} className="text-[10px]">
              M05
            </span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {[
              "18 yrs CFO experience, listed manufacturing",
              "Led 2 IPOs in SEA — Bursa + IDX",
              "Bahasa Indonesia native, fluent Mandarin",
            ].map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-[12px]"
                style={{ ...body, color: "#B6BBC2" }}
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: lime }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Outreach strip */}
        <div
          className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: hair, backgroundColor: "#1B1E22" }}
        >
          <div className="flex items-center gap-3">
            <Activity className="h-3.5 w-3.5" style={{ color: clay }} />
            <span style={{ ...body, color: bone }} className="text-[12px]">
              Sending via LinkedIn
            </span>
          </div>
          <span style={{ ...mono, color: "#8C9098" }} className="text-[11px]">
            12 / 15 today
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   The Loop
   ============================================================ */

const LOOP = [
  {
    n: "01",
    m: "M03",
    title: "Create Project",
    body: "Paste a JD. AI structures it into a hiring brief with skills, seniority, must-haves, and salary range.",
    ai: "Parses any JD format in under 5 seconds.",
  },
  {
    n: "02",
    m: "M04",
    title: "Source Candidates",
    body: "Seven import paths — CV upload, LinkedIn URL, Chrome extension, CSV, inbound applications, paste, manual.",
    ai: "Extracts 18+ structured fields from every CV.",
  },
  {
    n: "03",
    m: "M04",
    title: "Build Database",
    body: "Every candidate becomes a searchable, embedded profile. Full-text plus semantic search across years of recruiter memory.",
    ai: "Deduplicates and enriches every record automatically.",
  },
  {
    n: "04",
    m: "M06",
    title: "Outreach",
    body: "LinkedIn campaigns with hard safety rails. 15 sends/day cap. Stop on reply. Manual approval on the first 50. Built for executive search, not spam.",
    ai: "Drafts every connection note and follow-up.",
  },
  {
    n: "05",
    m: "M05 + M08",
    title: "Screen & Select",
    body: "Top 30 candidates ranked 0–100 with strengths, gaps, and concerns. Kanban pipeline from APPLIED to PLACED.",
    ai: "Explains every match — not just scores it.",
  },
];

function Loop() {
  return (
    <section id="platform" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <SectionLabel>§ 02 — The Core Loop</SectionLabel>
        <h2
          className="mt-5 max-w-[18ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Five steps. End to end.{" "}
          <span style={{ fontStyle: "italic", color: "#8C9098" }}>Every AI step reviewable.</span>
        </h2>

        <div className="relative mt-16">
          {/* connecting line — desktop */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[64px] hidden h-px lg:block"
            style={{
              background: `repeating-linear-gradient(to right, ${lime} 0 8px, transparent 8px 16px)`,
              opacity: 0.4,
            }}
            aria-hidden
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {LOOP.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div
                  className="group h-full rounded-xl border p-5 transition-all hover:-translate-y-0.5"
                  style={{ borderColor: hair, backgroundColor: surface }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = lime)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = hair)}
                >
                  <div
                    className="font-bold leading-none"
                    style={{ ...display, color: bone, fontSize: "3rem" }}
                  >
                    {s.n}
                  </div>
                  <div
                    className="mt-3 text-[10px] uppercase tracking-[0.14em]"
                    style={{ ...mono, color: lime }}
                  >
                    {s.m}
                  </div>
                  <div
                    className="mt-2 text-[18px] font-semibold leading-tight"
                    style={{ ...display, color: bone }}
                  >
                    {s.title}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.55]" style={{ ...body, color: "#B6BBC2" }}>
                    {s.body}
                  </p>
                  <div
                    className="mt-4 border-t pt-3 text-[11px] uppercase tracking-[0.12em]"
                    style={{ borderColor: hair, ...mono, color: lime }}
                  >
                    AI does: <span style={{ color: bone, textTransform: "none", letterSpacing: 0 }}>{s.ai}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   White-label
   ============================================================ */

const DOMAINS = [
  { icon: Briefcase, url: "app.youragency.com", desc: "Core recruitment app" },
  { icon: Globe, url: "jobs.youragency.com", desc: "Candidate portal" },
  { icon: Building2, url: "hire.youragency.com", desc: "Employer portal" },
  { icon: Globe, url: "youragency.com", desc: "Corporate website" },
  { icon: Mail, url: "hello@youragency.com", desc: "Transactional email" },
];

function WhiteLabel() {
  return (
    <section className="relative py-28 md:py-36" style={{ backgroundColor: "#0D0F12" }}>
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <SectionLabel>§ 03 — White Label, Not White-Labeled</SectionLabel>
        <h2
          className="mt-5 max-w-[20ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Your agency. Your domain.{" "}
          <span style={{ fontStyle: "italic", color: lime }}>Your tool.</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Reveal>
              <p className="text-[17px] leading-[1.7]" style={{ ...body, color: "#B6BBC2" }}>
                Most &ldquo;white-label&rdquo; tools slap your logo in the corner and call it a day.
                Hiresmart goes further. Every touchpoint — the app at{" "}
                <span style={mono}>app.youragency.com</span>, the candidate jobs portal at{" "}
                <span style={mono}>jobs.youragency.com</span>, the employer brief portal at{" "}
                <span style={mono}>hire.youragency.com</span>, the corporate website at{" "}
                <span style={mono}>youragency.com</span>, the transactional emails from{" "}
                <span style={mono}>hello@youragency.com</span> — all carry your brand. End to end.
                Zero Hiresmart visible.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[17px] leading-[1.7]" style={{ ...body, color: "#B6BBC2" }}>
                When you share a shortlist with a hiring client, they see your tool. When a candidate
                applies, they apply to you. When you send a follow-up, it leaves your LinkedIn.{" "}
                <span style={{ color: bone }}>We are infrastructure. You are the brand.</span>
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <div className="space-y-2.5">
                {DOMAINS.map((d) => {
                  const Icon = d.icon;
                  return (
                    <div
                      key={d.url}
                      className="group flex items-center gap-4 rounded-lg border px-4 py-3.5 transition-all hover:-translate-y-px"
                      style={{ borderColor: hair, backgroundColor: surface }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = lime)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = hair)}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
                        style={{ borderColor: hair, backgroundColor: "#1B1E22" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: "#8C9098" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ ...mono, color: bone }} className="truncate text-[14px]">
                          {d.url}
                        </div>
                        <div style={{ ...body, color: "#6F757D" }} className="mt-0.5 text-[12px]">
                          {d.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  className="mt-5 text-[13px]"
                  style={{ ...body, color: clay }}
                >
                  Six weeks from kickoff to live launch.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Modules grid
   ============================================================ */

const MODULES: [string, string, string][] = [
  ["M01", "Auth & Workspace", "Roles, seats, team invites."],
  ["M02", "Client CRM", "Hiring companies, contacts, notes."],
  ["M03", "Projects + JD Parsing", "AI-structured hiring briefs in 5 seconds."],
  ["M04", "Candidate Database", "Seven import paths. One source of truth."],
  ["M05", "AI Matching", "Top 30 ranked, explained, reviewable."],
  ["M06", "Outreach Engine", "LinkedIn with safety rails."],
  ["M07", "Unified Inbox", "All replies. AI-classified. Recruiter sends."],
  ["M08", "Pipeline", "Kanban from applied to placed."],
  ["M09", "Candidate Portal", "Branded jobs page. No login required."],
  ["M10", "Employer Portal", "Clients submit briefs directly."],
  ["M11", "Corporate Website", "5-page site, wired to the platform."],
  ["M12", "Analytics", "Funnels, time-in-stage, recruiter performance."],
  ["M13", "White-Label Engine", "Logo, colors, domain, email."],
  ["M14", "Chrome Extension", "Save any LinkedIn profile in one click."],
];

function Modules() {
  return (
    <section id="modules" className="py-28 md:py-36">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <SectionLabel>§ 04 — Fourteen Modules, One Platform</SectionLabel>
        <h2
          className="mt-5 max-w-[24ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Everything an agency needs.{" "}
          <span style={{ fontStyle: "italic", color: "#8C9098" }}>Nothing it doesn&rsquo;t.</span>
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {MODULES.map(([id, name, desc], i) => (
            <Reveal key={id} delay={i * 30}>
              <div
                className="h-full rounded-xl border p-5 transition-all hover:-translate-y-px"
                style={{ borderColor: hair, backgroundColor: surface }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = lime)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = hair)}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.14em]"
                  style={{ ...mono, color: lime }}
                >
                  {id}
                </div>
                <div
                  className="mt-2 text-[18px] font-semibold leading-tight"
                  style={{ ...display, color: bone }}
                >
                  {name}
                </div>
                <p className="mt-2 text-[13px] leading-[1.5]" style={{ ...body, color: "#8C9098" }}>
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   AI explains itself
   ============================================================ */

function AIExplains() {
  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: "#0D0F12" }}>
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <SectionLabel>§ 05 — AI With a Paper Trail</SectionLabel>
        <h2
          className="mt-5 max-w-[22ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          We don&rsquo;t score candidates.{" "}
          <span style={{ fontStyle: "italic", color: lime }}>We explain them.</span>
        </h2>

        <Reveal>
          <div
            className="mt-14 rounded-2xl border p-8 md:p-10"
            style={{ borderColor: hair, backgroundColor: surface }}
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div style={{ ...mono, color: "#6F757D" }} className="text-[11px] uppercase tracking-[0.14em]">
                  Match result · M05
                </div>
                <div
                  className="mt-2 text-[22px] font-medium"
                  style={{ ...display, color: bone, letterSpacing: "0.06em" }}
                >
                  ████ ██████
                </div>
                <span
                  className="mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ ...mono, backgroundColor: "rgba(200,255,0,0.14)", color: lime }}
                >
                  STRONG MATCH
                </span>
              </div>
              <div className="text-right">
                <div
                  className="leading-none"
                  style={{ ...display, color: bone, fontSize: "clamp(3.6rem, 7vw, 5.6rem)", fontWeight: 800 }}
                >
                  87
                </div>
                <div style={{ ...mono, color: "#6F757D" }} className="mt-1 text-[11px]">
                  / 100
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <ExplainCol
                title="Strengths"
                Icon={Check}
                color="#7CDB8A"
                items={[
                  "15+ years CFO experience in Asian manufacturing",
                  "Led IPO and 2 cross-border M&A transactions",
                  "Native Bahasa Indonesia + fluent Mandarin",
                ]}
              />
              <ExplainCol
                title="Gaps"
                Icon={AlertTriangle}
                color="#E8B96B"
                items={[
                  "Limited experience with SaaS revenue models",
                  "No prior consumer goods exposure",
                ]}
              />
              <ExplainCol
                title="Concerns"
                Icon={AlertCircle}
                color={clay}
                items={[
                  "Current notice period: 6 months",
                  "Based in Singapore, role requires Jakarta",
                ]}
              />
            </div>
          </div>
        </Reveal>

        <p
          className="mx-auto mt-10 max-w-[68ch] text-center text-[16px] leading-[1.7]"
          style={{ ...body, color: "#B6BBC2" }}
        >
          Every AI decision in Hiresmart comes with its reasoning attached. Recruiters can
          override any score. Every override is tracked. The system gets smarter; the recruiter
          stays in charge.
        </p>
      </div>
    </section>
  );
}

function ExplainCol({
  title,
  items,
  Icon,
  color,
}: {
  title: string;
  items: string[];
  Icon: typeof Check;
  color: string;
}) {
  return (
    <div>
      <div
        className="text-[11px] uppercase tracking-[0.14em]"
        style={{ ...mono, color }}
      >
        {title}
      </div>
      <ul className="mt-3 space-y-2.5">
        {items.map((s) => (
          <li
            key={s}
            className="flex items-start gap-2 text-[13.5px] leading-[1.5]"
            style={{ ...body, color: "#B6BBC2" }}
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Safety rails (spec sheet)
   ============================================================ */

const RAILS: [string, string][] = [
  ["Daily Send Cap", "15 messages/account/day (max 25)"],
  ["Warmup Period", "7 days for new accounts (5→15 ramp)"],
  ["Sending Hours", "8 AM – 6 PM recipient timezone only"],
  ["Stop on Reply", "Always on. Cannot be disabled."],
  ["Manual Approval", "First 50 sends. Recruiter clicks each."],
  ["Weekend Sending", "Off by default."],
];

function SafetyRails() {
  return (
    <section className="py-28 md:py-36">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <SectionLabel>§ 06 — Safety Rails, Not Training Wheels</SectionLabel>
        <h2
          className="mt-5 max-w-[22ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Built for executive search,{" "}
          <span style={{ fontStyle: "italic", color: "#8C9098" }}>not cold-email spam.</span>
        </h2>
        <p
          className="mt-4 max-w-[60ch] text-[16px]"
          style={{ ...body, color: "#8C9098" }}
        >
          Boutique recruiters don&rsquo;t blast. So neither do we.
        </p>

        <div className="mt-14 overflow-hidden rounded-xl border" style={{ borderColor: hair }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {RAILS.map(([k, v], i) => (
              <div
                key={k}
                className="border-b border-r p-6"
                style={{
                  borderColor: hair,
                  backgroundColor: surface,
                  borderRightWidth: (i % 3 === 2) ? 0 : 1,
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ ...mono, color: lime }}
                >
                  {k}
                </div>
                <div
                  className="mt-3 text-[18px] leading-tight"
                  style={{ ...display, color: bone, fontWeight: 600 }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="mt-8 max-w-[72ch] text-[14px] leading-[1.6]"
          style={{ ...body, color: clay }}
        >
          Every message leaves the recruiter&rsquo;s own LinkedIn account via licensed Unipile
          integration. No scraping. No password sharing. No auto-replies. Ever.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Numbers strip
   ============================================================ */

function Numbers() {
  const stats = [
    { value: 48, prefix: "< ", suffix: " hrs", label: "Time to first shortlist" },
    { value: 75, prefix: "> ", suffix: "%", label: "AI match accuracy" },
    { value: 5, prefix: "< ", suffix: " sec", label: "JD parse latency" },
    { value: 6, prefix: "", suffix: " weeks", label: "From kickoff to launch" },
  ];
  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: "#0D0F12" }}>
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <SectionLabel>§ 07 — The Numbers</SectionLabel>
        <div className="mt-12 grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div>
                <div
                  className="leading-none"
                  style={{ ...display, color: bone, fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)", fontWeight: 800 }}
                >
                  <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div
                  className="mt-4 max-w-[18ch] text-[13px] leading-[1.5]"
                  style={{ ...body, color: "#8C9098" }}
                >
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   For agency owners
   ============================================================ */

const CASES = [
  {
    n: "01",
    title: "Look like a tech-native firm without hiring a tech team.",
    body: "Your clients judge you on the experience. Hiresmart gives you a branded candidate portal, a branded employer portal, branded emails, and a real product running at your domain. No screenshots of someone else's SaaS in your pitch decks.",
  },
  {
    n: "02",
    title: "Stop paying for five tools you half-use.",
    body: "Hiresmart replaces your ATS, your sourcing tool, your CRM, your outreach sequencer, and your candidate portal. One platform. One bill. One source of truth for your candidate database.",
  },
  {
    n: "03",
    title: "Built for Southeast Asia. Works anywhere.",
    body: "WhatsApp is a first-class contact channel — not an afterthought. Bilingual support roadmap (English + Bahasa Indonesia). Jakarta-aware defaults. Deployed globally.",
  },
];

function AgencyOwners() {
  return (
    <section id="agencies" className="py-28 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <SectionLabel>§ 08 — For Agency Owners</SectionLabel>
        <h2
          className="mt-5 max-w-[22ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Three reasons agencies pick{" "}
          <span style={{ fontStyle: "italic", color: lime }}>Hiresmart.</span>
        </h2>

        <div className="mt-14 space-y-5">
          {CASES.map((c, i) => (
            <Reveal key={c.n} delay={i * 80}>
              <div
                className="grid grid-cols-1 gap-8 rounded-2xl border p-8 md:p-10 lg:grid-cols-12"
                style={{
                  borderColor: hair,
                  backgroundColor: surface,
                }}
              >
                <div
                  className={`lg:col-span-3 ${i % 2 === 1 ? "lg:order-2 lg:text-right" : ""}`}
                >
                  <div
                    style={{ ...display, color: lime, fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 800 }}
                    className="leading-none"
                  >
                    {c.n}
                  </div>
                </div>
                <div className={`lg:col-span-9 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <h3
                    className="text-[22px] font-semibold leading-tight md:text-[28px]"
                    style={{ ...display, color: bone }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="mt-4 text-[15.5px] leading-[1.65]"
                    style={{ ...body, color: "#B6BBC2" }}
                  >
                    {c.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Pricing
   ============================================================ */

function Pricing() {
  const cols = [
    {
      label: "One-Time Build",
      price: "$4,500",
      lines: ["6 weeks", "4 milestones"],
    },
    {
      label: "Monthly Service",
      price: "$600 / month",
      lines: ["3 seats included", "12-month commitment"],
    },
    {
      label: "Running Costs",
      price: "~$60–120 / mo",
      lines: ["Paid directly", "to vendors"],
    },
  ];
  return (
    <section id="pricing" className="py-28 md:py-36" style={{ backgroundColor: "#0D0F12" }}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <SectionLabel>§ 09 — Pricing</SectionLabel>
        <h2
          className="mt-5 max-w-[26ch] font-bold leading-[1.02] tracking-[-0.02em]"
          style={{ ...display, color: bone, fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}
        >
          Fixed build. Predictable monthly.{" "}
          <span style={{ fontStyle: "italic", color: "#8C9098" }}>No surprises.</span>
        </h2>

        <div
          className="mt-14 overflow-hidden rounded-2xl border"
          style={{ borderColor: hair, backgroundColor: surface }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            {cols.map((c, i) => (
              <div
                key={c.label}
                className="border-b p-8 md:border-b-0 md:border-r md:p-10"
                style={{
                  borderColor: hair,
                  borderRightWidth: i === cols.length - 1 ? 0 : 1,
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ ...mono, color: lime }}
                >
                  {c.label}
                </div>
                <div
                  className="mt-4 leading-none"
                  style={{ ...display, color: bone, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700 }}
                >
                  {c.price}
                </div>
                <div className="mt-5 space-y-1.5" style={{ ...body, color: "#8C9098" }}>
                  {c.lines.map((l) => (
                    <div key={l} className="text-[13.5px]">
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="mt-10 max-w-[72ch] text-[15.5px] leading-[1.7]"
          style={{ ...body, color: "#B6BBC2" }}
        >
          The build fee covers branding, deployment, custom domain setup, and launch. The
          monthly service fee covers hosting, maintenance, AI model upgrades, and priority bug
          fixes. Third-party costs (Anthropic, OpenAI, Supabase, Unipile, Resend, Vercel) sit
          under your accounts — you own everything.
        </p>
        <p
          className="mt-4 text-[12.5px]"
          style={{ ...mono, color: "#6F757D" }}
        >
          Additional seats $25/seat/month. Add-on modules available post-launch — email outreach,
          WhatsApp outreach, job board publishing, ATS integrations.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */

const FAQ_ITEMS = [
  {
    q: "How is this different from Bullhorn / Loxo / Recruiterflow?",
    a: "Those are recruitment CRMs you log into. Hiresmart is your own product, on your own domain, that your clients and candidates also touch. Plus AI matching with explanations, not just keyword search.",
  },
  {
    q: "What happens to my data if I leave?",
    a: "It's yours. The Supabase project, the Resend account, the Vercel deployment, the Unipile account — every third-party service sits under your ownership from day one. Export anytime. No lock-in.",
  },
  {
    q: "Is the LinkedIn outreach against terms of service?",
    a: "No. We use Unipile, a licensed LinkedIn integration. No scraping. No password sharing. Every message leaves the recruiter's own account, with conservative caps that match how a senior recruiter actually works.",
  },
  {
    q: "How long until we're live?",
    a: "Six weeks from kickoff to launch. Week 1: foundation and branding. Week 2: jobs and candidates. Weeks 3–4: matching and outreach. Weeks 5–6: public portals, corporate website, UAT, go-live.",
  },
  {
    q: "Can we customize the AI prompts and matching logic?",
    a: "Match weights are configurable per tenant. Prompt customization is available as a post-launch engagement.",
  },
  {
    q: "Do you sign DPAs / NDAs?",
    a: "Yes, standard for every engagement.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-28 md:py-36">
      <div className="mx-auto max-w-[900px] px-6 md:px-10">
        <SectionLabel>§ 10 — Questions We Get a Lot</SectionLabel>
        <div className="mt-10 divide-y" style={{ borderColor: hair }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="border-t"
                style={{ borderColor: hair }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-6 py-6 text-left"
                >
                  <span
                    className="text-[18px] leading-snug md:text-[20px]"
                    style={{ ...display, color: bone, fontWeight: 600 }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className="mt-1 h-5 w-5 shrink-0 transition-transform"
                    style={{
                      color: lime,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all"
                  style={{
                    maxHeight: isOpen ? "400px" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p
                    className="pb-6 pr-12 text-[15.5px] leading-[1.7]"
                    style={{ ...body, color: "#B6BBC2" }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
          <div className="border-t" style={{ borderColor: hair }} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Final CTA
   ============================================================ */

function FinalCTA() {
  return (
    <section
      id="book"
      className="relative overflow-hidden py-32 md:py-40"
      style={{ backgroundColor: lime, color: ink }}
    >
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <h2
          className="max-w-[18ch] font-bold leading-[0.96] tracking-[-0.02em]"
          style={{
            ...display,
            color: ink,
            fontSize: "clamp(2.6rem, 7vw, 6.4rem)",
            fontWeight: 800,
          }}
        >
          Six weeks from now, your agency could{" "}
          <span style={{ fontStyle: "italic" }}>run like this.</span>
        </h2>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3.5 text-[15px] font-medium"
            style={{ backgroundColor: ink, color: lime, ...body }}
          >
            See the Live Demo <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-md border px-5 py-3.5 text-[15px]"
            style={{ borderColor: ink, color: ink, ...body }}
          >
            Book a 30-min Walkthrough
          </a>
        </div>

        <div className="mt-10 text-[12px]" style={{ ...mono, color: "rgba(10,11,13,0.7)" }}>
          No deck. No sales script. A working tool you can break in real time.
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Footer
   ============================================================ */

function Ticker() {
  const items = [
    "+ 47 candidates parsed in the last hour",
    "+ 12 LinkedIn replies routed to recruiters",
    "+ 3 new shortlists shared with clients",
    "+ 184 JDs structured this week",
    "+ 9 outreach campaigns launched today",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 2800);
    return () => clearInterval(id);
  }, [items.length]);
  return (
    <div
      className="flex items-center gap-2 text-[11px]"
      style={{ ...mono, color: "#6F757D" }}
    >
      <span
        className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
        style={{ backgroundColor: lime }}
      />
      <span style={{ color: bone }}>{items[i]}</span>
    </div>
  );
}

function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Platform", "Modules", "Demo", "Changelog"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "DPA", "Security"],
    },
  ];
  return (
    <footer className="border-t" style={{ borderColor: hair, backgroundColor: ink }}>
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4 md:px-10">
        <div>
          <div style={{ ...display, color: bone }} className="text-[22px] font-bold leading-none">
            Hiresmart
          </div>
          <p className="mt-4 max-w-[28ch] text-[13px] leading-[1.55]" style={{ ...body, color: "#8C9098" }}>
            The white-label OS for recruitment agencies.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[12px]" style={{ ...mono, color: "#7CDB8A" }}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#7CDB8A" }}
            />
            All systems operational
          </div>
          <div className="mt-6">
            <Ticker />
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ ...mono, color: "#6F757D" }}
            >
              {c.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-[13.5px] transition-colors hover:opacity-80"
                    style={{ ...body, color: bone }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="border-t px-6 py-6 md:px-10"
        style={{ borderColor: hair }}
      >
        <div
          className="mx-auto flex max-w-[1320px] items-center justify-between text-[11px]"
          style={{ ...mono, color: "#6F757D" }}
        >
          <span>© 2026 Hiresmart. Built in Jakarta. Deployed globally.</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   Page
   ============================================================ */

function MarketingPage() {
  return (
    <div
      style={{
        backgroundColor: ink,
        color: bone,
        ...body,
        minHeight: "100vh",
        scrollBehavior: "smooth",
      }}
    >
      <style>{`
        html { scroll-behavior: smooth; }
        ::selection { background: ${lime}; color: ${ink}; }
      `}</style>
      <Navbar />
      <Hero />
      <Loop />
      <WhiteLabel />
      <Modules />
      <AIExplains />
      <SafetyRails />
      <Numbers />
      <AgencyOwners />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
