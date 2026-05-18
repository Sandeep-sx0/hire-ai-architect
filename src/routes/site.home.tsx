import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, LineChart, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";

const PARTNERS = ["Indorama", "OYO", "KNS Group", "Oasis Water", "RTW", "Stylo", "Royal Kitchen"];

export const Route = createFileRoute("/site/home")({
  head: () => ({
    meta: [
      { title: "HireSmart — Executive Recruitment & Strategic Business Consulting" },
      {
        name: "description",
        content:
          "HireSmart pairs executive recruitment with strategic business consulting for high-growth companies across Asia.",
      },
      { property: "og:title", content: "HireSmart — Executive Recruitment & Consulting" },
      {
        property: "og:description",
        content: "AI-powered executive search and consulting, made smart, fast, and human.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-brand-primary">
            HireSmart
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-brand-text md:text-6xl">
            Executive Recruitment &{" "}
            <span className="text-brand-primary">Strategic Business Consulting</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
            We place senior leaders and advise founders across Southeast Asia — combining
            decades of search expertise with AI that surfaces the right people, faster.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              <Link to="/site/contact">
                Looking to hire <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/jobs">I'm a candidate</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner wall */}
      <section className="border-b border-gray-100 bg-brand-bg">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-brand-text-secondary">
            Trusted by leadership teams at
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {PARTNERS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-brand-text"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Service pillars */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-20 md:grid-cols-2">
          <PillarCard
            icon={<Briefcase className="h-5 w-5" />}
            title="Executive Recruitment"
            body="C-suite, VP, and Director searches across manufacturing, hospitality, tech, and consumer brands. Discreet, retained, and outcome-driven."
            ctaLabel="Start a search"
            ctaTo="/site/contact"
          />
          <PillarCard
            icon={<LineChart className="h-5 w-5" />}
            title="Strategic Business Consulting"
            body="Org design, leadership assessment, and growth advisory for founders and boards scaling past the next inflection point."
            ctaLabel="Talk to an advisor"
            ctaTo="/site/contact"
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-seafoam/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center">
          <Sparkles className="h-6 w-6 text-brand-primary" />
          <h2 className="max-w-2xl text-3xl font-semibold text-brand-text md:text-4xl">
            Whether you're hiring or job-hunting — we'd love to talk.
          </h2>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              <Link to="/site/contact">Looking to hire</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/jobs">I'm a candidate</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function PillarCard({
  icon,
  title,
  body,
  ctaLabel,
  ctaTo,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  ctaTo: "/site/contact";
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 transition-shadow hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-seafoam/40 text-brand-primary">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-brand-text">{title}</h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-brand-text-secondary">{body}</p>
      <Link
        to={ctaTo}
        className="mt-6 inline-flex items-center text-sm font-medium text-brand-primary hover:underline"
      >
        {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    </div>
  );
}
