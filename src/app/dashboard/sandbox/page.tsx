import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getSandboxes } from "@/actions/sandboxActions";
import SandboxListView from "@/components/dashboard/sandbox/SandboxListView";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { requirePageUser } from "@/lib/require-user";

export default async function SandboxPage() {
  // Outside prefetchQuery: keeps the route dynamic and fails fast when signed out.
  await requirePageUser("/dashboard/sandbox");

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({ queryKey: queryKeys.sandboxes.list(), queryFn: () => getSandboxes() });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandboxListView />
    </HydrationBoundary>
  );
}
