import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Check, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { cn } from "@/lib/utils";

const STAGES = ["Applied", "Under review", "Shortlisted", "Interview", "Decision"] as const;

const trackSchema = z.object({
  stage: fallback(z.coerce.number().int().min(0).max(4), 0).default(0),
});

// Minimal token → job lookup. Unknown tokens fall back to demo.
const TOKEN_LOOKUP: Record<string, { title: string; company: string; appliedAt: string }> = {
  demo: { title: "Chief Financial Officer", company: "Indorama Ventures", appliedAt: "March 17, 2026" },
  oyo: { title: "VP Operations", company: "OYO Hotels", appliedAt: "March 14, 2026" },
  kns: { title: "Country Director", company: "KNS Group", appliedAt: "March 9, 2026" },
};

export const Route = createFileRoute("/jobs/track/$token")({
  validateSearch: zodValidator(trackSchema),
  head: () => ({
    meta: [
      { title: "Application status — HireSmart" },
      { name: "description", content: "Track the status of your application." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { token } = Route.useParams();
  const { stage } = Route.useSearch();
  const info = TOKEN_LOOKUP[token] ?? TOKEN_LOOKUP.demo;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-brand-text">Application status</h1>

          <div className="mt-6 border-b border-gray-100 pb-6">
            <p className="text-[15px] font-medium text-brand-text">{info.title}</p>
            <p className="text-sm text-brand-primary">{info.company}</p>
            <p className="mt-3 text-xs text-brand-text-secondary">Applied: {info.appliedAt}</p>
          </div>

          <div className="mt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-brand-text-secondary">
              Current status
            </p>
            <ol className="space-y-3">
              {STAGES.map((label, i) => {
                const isPast = i < stage;
                const isCurrent = i === stage;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        (isCurrent || isPast) && "border-green-500 bg-green-500",
                        !isPast && !isCurrent && "border-gray-300 bg-white",
                      )}
                    >
                      {isPast && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isCurrent && "font-semibold text-brand-text",
                        !isCurrent && "text-brand-text-secondary",
                      )}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-8 rounded-lg bg-brand-seafoam/10 p-4 text-[13px] leading-relaxed text-brand-text-secondary">
            We'll email you when your status changes. For questions, contact us on WhatsApp:{" "}
            <a
              href="https://wa.me/628194421035"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-primary hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              +62 819 4421 0355
            </a>
          </div>

          <Link
            to="/jobs"
            className="mt-6 block text-center text-sm font-medium text-brand-primary hover:underline"
          >
            ← Browse more positions
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
