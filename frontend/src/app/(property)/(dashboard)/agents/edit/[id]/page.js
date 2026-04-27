import AgentFormClient from "@/components/property/dashboard/agent/AgentFormClient";


export default async function EditAgentPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <AgentFormClient id={id} />;
}