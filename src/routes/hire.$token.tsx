import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";

export const Route = createFileRoute("/hire/$token")({
  head: () => ({ meta: [{ title: "Employer portal — HireSmart" }] }),
  component: EmployerPortal,
});

function EmployerPortal() {
  const { token } = Route.useParams();
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-lg text-brand-primary">
            <span className="font-normal">Hire</span>
            <span className="font-semibold">Smart</span>
            <span className="ml-2 text-sm font-normal text-brand-text-secondary">Client portal</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <PageHeader
          title="Your shortlist"
          subtitle={`Secure access · token ${token.slice(0, 8)}…`}
        />
        <EmptyState
          icon={Users}
          title="Under construction"
          description="The token-gated employer portal lets clients review shortlisted candidates and leave feedback."
        />
      </main>
    </div>
  );
}
