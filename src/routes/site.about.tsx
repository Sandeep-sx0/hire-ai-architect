import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/site/about")({
  head: () => ({
    meta: [
      { title: "About — HireSmart" },
      {
        name: "description",
        content:
          "HireSmart blends decades of executive search with AI-native tooling to help leaders build great teams faster.",
      },
      { property: "og:title", content: "About HireSmart" },
      {
        property: "og:description",
        content: "Our story, our people, and how we work with hiring clients and candidates.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-brand-primary">
            About
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-text md:text-5xl">
            People-first search, powered by smarter tools.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-text-secondary">
            HireSmart is a boutique executive search and consulting firm working with
            founders, boards, and CHROs across Southeast Asia. We started as a traditional
            search practice and built our own AI tooling to do the craft better — not to
            replace it.
          </p>
        </div>
      </section>

      <section className="bg-brand-bg">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-3">
          <Stat label="Years in search" value="12+" />
          <Stat label="Senior placements" value="180+" />
          <Stat label="Repeat-client rate" value="84%" />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 space-y-10">
          <Block
            title="Our story"
            body="Founded in Jakarta, HireSmart grew out of frustration with slow, opaque executive search. We rebuilt the workflow around transparency, candidate experience, and AI-assisted sourcing — and kept the human judgement that matters."
          />
          <Block
            title="How we work"
            body="Every mandate is led by a senior partner. We commit to a structured search plan, weekly client updates, and a shortlist quality bar we'd stake our reputation on. For candidates, we promise a real conversation — never a black hole."
          />
          <Block
            title="What we believe"
            body="Great hires compound. The right CFO, COO, or Head of Engineering changes a company's trajectory. We take that responsibility seriously, on both sides of the table."
          />
        </div>
      </section>

      <section className="border-t border-gray-100 bg-brand-seafoam/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold text-brand-text">Let's talk.</h2>
          <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
            <Link to="/site/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-semibold text-brand-primary">{value}</div>
      <div className="mt-2 text-sm text-brand-text-secondary">{label}</div>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-text">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-brand-text-secondary">{body}</p>
    </div>
  );
}
