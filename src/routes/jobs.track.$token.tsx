import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { cn } from "@/lib/utils";

const STAGES = ["Applied", "Under review", "Shortlisted", "Interview", "Decision"] as const;
const CURRENT_STAGE_INDEX = 0;

export const Route = createFileRoute("/jobs/track/$token")({
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
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-brand-text">Application status</h1>

          <div className="mt-6 border-b border-gray-100 pb-6">
            <p className="text-[15px] font-medium text-brand-text">Chief Financial Officer</p>
            <p className="text-sm text-brand-primary">Indorama Ventures</p>
            <p className="mt-3 text-xs text-brand-text-secondary">Applied: March 17, 2026</p>
          </div>

          <div className="mt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-brand-text-secondary">
              Current status
            </p>
            <ol className="space-y-3">
              {STAGES.map((stage, i) => {
                const isPast = i < CURRENT_STAGE_INDEX;
                const isCurrent = i === CURRENT_STAGE_INDEX;
                return (
                  <li key={stage} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        isCurrent && "border-green-500 bg-green-500",
                        isPast && "border-green-500 bg-green-500",
                        !isPast && !isCurrent && "border-gray-300 bg-white",
                      )}
                    >
                      {isPast && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isCurrent && "font-semibold text-brand-text",
                        isPast && "text-brand-text-secondary",
                        !isPast && !isCurrent && "text-brand-text-secondary",
                      )}
                    >
                      {stage}
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
