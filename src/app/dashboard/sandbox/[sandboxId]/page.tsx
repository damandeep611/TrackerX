import { notFound } from "next/navigation";
import SandboxDetailView from "@/components/dashboard/sandbox/sandbox-detail-view";
import { getSandboxDetail } from "@/actions/sandboxActions";

interface PageProps {
  params: Promise<{
    sandboxId: string;
  }>;
}

export default async function SandboxDetailPage(props: PageProps) {
  const { sandboxId } = await props.params;

  // Scoped to the signed-in owner; anyone else gets a 404.
  const detail = await getSandboxDetail(sandboxId);
  if (!detail) notFound();

  return (
    <SandboxDetailView
      sandbox={detail.sandbox}
      initialPhases={detail.phases}
      initialLogs={detail.logs}
      initialResources={detail.resources}
    />
  );
}
