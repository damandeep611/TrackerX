import { db } from "@/db/drizzle";
import { sandboxes } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
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

  return <SandboxDetailView sandbox={sandbox} />;
}
