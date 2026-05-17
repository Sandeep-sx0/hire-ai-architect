import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/projects/$id")({
  head: () => ({ meta: [{ title: "Project — HireSmart" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  return (
    <UnderConstruction
      title={`Project ${id}`}
      subtitle="Brief · Candidates · Outreach · Pipeline · Activity"
      icon={Briefcase}
    />
  );
}
