import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getSandboxLogs, getSandboxOverview, getSandboxResources } from "@/actions/sandboxActions";
import SandboxDetailView from "@/components/dashboard/sandbox/SandboxDetailView";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { requirePageUser } from "@/lib/require-user";

export default async function SandboxDetailPage({ params }: { params: Promise<{ sandboxId: string }> }) {
  const { sandboxId } = await params;
  await requirePageUser(`/dashboard/sandbox/${sandboxId}`);

  // Owner-scoped: anyone else (or a bad id) gets a 404 before the children load.
  const overview = await getSandboxOverview(sandboxId);
  if (!overview) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.sandboxes.overview(sandboxId), overview);
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.sandboxes.logs(sandboxId), queryFn: () => getSandboxLogs(sandboxId) }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.sandboxes.resources(sandboxId),
      queryFn: () => getSandboxResources(sandboxId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandboxDetailView sandboxId={sandboxId} />
    </HydrationBoundary>
  );
}
