import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/clients/$id")({
  head: () => ({ meta: [{ title: "Client — HireSmart" }] }),
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  return (
    <UnderConstruction
      title={`Client ${id}`}
      subtitle="Overview · Jobs · Contacts · Notes"
      icon={Building2}
    />
  );
}
