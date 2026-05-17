import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({ meta: [{ title: "Role — HireSmart" }] }),
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-lg text-brand-primary">
            <span className="font-normal">Hire</span>
            <span className="font-semibold">Smart</span>
            <span className="ml-2 text-sm font-normal text-brand-text-secondary">Careers</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <PageHeader title={`Role ${id}`} subtitle="Position details and application form." />
        <EmptyState
          icon={Briefcase}
          title="Under construction"
          description="The job detail page with apply flow will be built next."
        />
      </main>
    </div>
  );
}
