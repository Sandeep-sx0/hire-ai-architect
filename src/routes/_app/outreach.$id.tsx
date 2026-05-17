import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/outreach/$id")({
  head: () => ({ meta: [{ title: "Campaign — HireSmart" }] }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  return (
    <UnderConstruction
      title={`Campaign ${id}`}
      subtitle="Performance, sequence, replies, and audience."
      icon={Send}
    />
  );
}
