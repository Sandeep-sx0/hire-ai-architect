import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/candidates/$id")({
  head: () => ({ meta: [{ title: "Candidate — HireSmart" }] }),
  component: CandidateDetail,
});

function CandidateDetail() {
  const { id } = Route.useParams();
  return (
    <UnderConstruction
      title={`Candidate ${id}`}
      subtitle="Profile · History · Jobs · Outreach · Notes · Files"
      icon={User}
    />
  );
}
