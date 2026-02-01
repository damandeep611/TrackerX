import { db } from "@/db/drizzle";
import { sandboxes, sandboxPhases, sandboxLogs } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import SandboxDetailView from "@/components/dashboard/sandbox/sandbox-detail-view";

interface PageProps {
  params: Promise<{
    sandboxId: string;
  }>;
}

export default async function SandboxDetailPage(props: PageProps) {
  const params = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [sandbox] = await db
    .select()
    .from(sandboxes)
    .where(eq(sandboxes.id, params.sandboxId));

  if (!sandbox) {
    notFound();
  }

  const phasesData = await db
    .select()
    .from(sandboxPhases)
    .where(eq(sandboxPhases.sandboxId, params.sandboxId))
    .orderBy(sandboxPhases.orderIndex);

  // Fetch logs via join to filter by sandboxId (through phases)
  const logsData = await db
    .select({
      id: sandboxLogs.id,
      phaseId: sandboxLogs.phaseId,
      title: sandboxLogs.title,
      startTime: sandboxLogs.startTime,
      endTime: sandboxLogs.endTime,
      duration: sandboxLogs.duration,
    })
    .from(sandboxLogs)
    .innerJoin(sandboxPhases, eq(sandboxLogs.phaseId, sandboxPhases.id))
    .where(eq(sandboxPhases.sandboxId, params.sandboxId))
    .orderBy(desc(sandboxLogs.startTime));

  // Transform data to match frontend interfaces (casting numeric strings to numbers)
  const phases = phasesData.map(p => ({
    ...p,
    allocatedHours: Number(p.allocatedHours),
  }));

  const logs = logsData.map(l => ({
    ...l,
    duration: Number(l.duration),
  }));

  return (
    <SandboxDetailView 
      sandbox={sandbox} 
      initialPhases={phases} 
      initialLogs={logs} 
    />
  );
}
