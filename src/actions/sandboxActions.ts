"use server";

import { db } from "@/db/drizzle";
import { sandboxes, sandboxPhases, sandboxLogs, sandboxResources } from "@/db/schema/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { parseInput, zHttpUrl, zId, zText } from "@/lib/validation";
import {
  assertPhaseOwner,
  assertResourceOwner,
  assertSandboxOwner,
} from "@/lib/ownership";
import { safeFetchHtml } from "@/lib/safe-fetch";

const MAX_HOURS = 999; // numeric(5,2) columns

const sandboxInput = z.object({
  name: zText(120),
  targetHours: z.number().int().min(1).max(100_000),
});

const phaseInput = z.object({
  title: zText(200),
  description: z.string().trim().max(2000),
  milestones: z.array(z.string().trim().max(300)).max(50),
  allocatedHours: z.number().min(0).max(MAX_HOURS),
});

const sessionInput = z
  .object({
    title: z.string().trim().max(255),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    // Accepted for backwards compatibility; the server recomputes it from the times.
    duration: z.number().optional(),
  })
  .refine((s) => s.endTime > s.startTime, "End time must be after start time")
  .refine(
    (s) => s.endTime.getTime() - s.startTime.getTime() <= 24 * 60 * 60 * 1000,
    "A session can't be longer than 24 hours"
  );

const resourceTypes = ["video", "article", "repo", "documentation"] as const;

const resourceInput = z.object({
  title: zText(300),
  url: zHttpUrl,
  phaseId: zId.nullable(),
  resourceType: z.enum(resourceTypes).catch("article"),
  thumbnailUrl: zHttpUrl.optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function createSandbox(data: { name: string; targetHours: number }) {
  const userId = await requireUser();
  const input = parseInput(sandboxInput, data);

  const [newSandbox] = await db
    .insert(sandboxes)
    .values({ name: input.name, targetHours: input.targetHours, userId })
    .returning();

  revalidatePath("/dashboard/sandbox");
  return newSandbox;
}

export async function deleteSandbox(sandboxId: string) {
  const userId = await requireUser();
  const id = parseInput(zId, sandboxId);

  // Children are removed by ON DELETE CASCADE.
  await db
    .delete(sandboxes)
    .where(and(eq(sandboxes.id, id), eq(sandboxes.userId, userId)));

  revalidatePath("/dashboard/sandbox");
}

export async function getSandboxes() {
  const userId = await requireUser();

  return db.select().from(sandboxes).where(eq(sandboxes.userId, userId));
}

/**
 * Everything the sandbox detail page needs, scoped to the owner.
 * Returns null when the sandbox doesn't exist or isn't the user's.
 */
export async function getSandboxDetail(sandboxId: string) {
  const userId = await requireUser();
  const parsed = zId.safeParse(sandboxId);
  if (!parsed.success) return null;
  const id = parsed.data;

  const [sandbox] = await db
    .select()
    .from(sandboxes)
    .where(and(eq(sandboxes.id, id), eq(sandboxes.userId, userId)));
  if (!sandbox) return null;

  const [phasesData, logsData, resources] = await Promise.all([
    db
      .select()
      .from(sandboxPhases)
      .where(eq(sandboxPhases.sandboxId, id))
      .orderBy(sandboxPhases.orderIndex),
    db
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
      .where(eq(sandboxPhases.sandboxId, id))
      .orderBy(desc(sandboxLogs.startTime)),
    db
      .select()
      .from(sandboxResources)
      .where(eq(sandboxResources.sandboxId, id))
      .orderBy(desc(sandboxResources.createdAt)),
  ]);

  return {
    sandbox,
    phases: phasesData.map((p) => ({ ...p, allocatedHours: Number(p.allocatedHours) })),
    logs: logsData.map((l) => ({ ...l, duration: Number(l.duration) })),
    resources,
  };
}

// Phase Actions

export async function createPhase(
  sandboxId: string,
  data: { title: string; description: string; milestones: string[]; allocatedHours: number }
) {
  const userId = await requireUser();
  const id = parseInput(zId, sandboxId);
  const input = parseInput(phaseInput, data);
  await assertSandboxOwner(id, userId);

  const [last] = await db
    .select({ orderIndex: sandboxPhases.orderIndex })
    .from(sandboxPhases)
    .where(eq(sandboxPhases.sandboxId, id))
    .orderBy(desc(sandboxPhases.orderIndex))
    .limit(1);

  const [newPhase] = await db
    .insert(sandboxPhases)
    .values({
      sandboxId: id,
      title: input.title,
      description: input.description,
      milestones: input.milestones,
      allocatedHours: input.allocatedHours.toString(),
      orderIndex: last ? last.orderIndex + 1 : 0,
    })
    .returning();

  revalidatePath(`/dashboard/sandbox/${id}`);
  return newPhase;
}

export async function updatePhase(
  phaseId: string,
  sandboxId: string,
  data: { title: string; description: string; milestones: string[]; allocatedHours: number }
) {
  const userId = await requireUser();
  const pid = parseInput(zId, phaseId);
  const sid = parseInput(zId, sandboxId);
  const input = parseInput(phaseInput, data);
  await assertPhaseOwner(pid, sid, userId);

  const [updatedPhase] = await db
    .update(sandboxPhases)
    .set({
      title: input.title,
      description: input.description,
      milestones: input.milestones,
      allocatedHours: input.allocatedHours.toString(),
    })
    .where(and(eq(sandboxPhases.id, pid), eq(sandboxPhases.sandboxId, sid)))
    .returning();

  revalidatePath(`/dashboard/sandbox/${sid}`);
  return updatedPhase;
}

export async function deletePhase(phaseId: string, sandboxId: string) {
  const userId = await requireUser();
  const pid = parseInput(zId, phaseId);
  const sid = parseInput(zId, sandboxId);
  await assertPhaseOwner(pid, sid, userId);

  await db
    .delete(sandboxPhases)
    .where(and(eq(sandboxPhases.id, pid), eq(sandboxPhases.sandboxId, sid)));

  revalidatePath(`/dashboard/sandbox/${sid}`);
}

// Log Actions

export async function logSession(
  sandboxId: string,
  phaseId: string,
  data: { title: string; startTime: Date; endTime: Date; duration: number }
) {
  const userId = await requireUser();
  const sid = parseInput(zId, sandboxId);
  const pid = parseInput(zId, phaseId);
  const input = parseInput(sessionInput, data);
  await assertPhaseOwner(pid, sid, userId);

  const hours = (input.endTime.getTime() - input.startTime.getTime()) / 3_600_000;
  const duration = (Math.round(hours * 100) / 100).toFixed(2);

  const newLog = await db.transaction(async (tx) => {
    const [log] = await tx
      .insert(sandboxLogs)
      .values({
        phaseId: pid,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        duration,
      })
      .returning();

    await tx
      .update(sandboxes)
      .set({ currentHours: sql`${sandboxes.currentHours} + ${duration}` })
      .where(and(eq(sandboxes.id, sid), eq(sandboxes.userId, userId)));

    return log;
  });

  revalidatePath(`/dashboard/sandbox/${sid}`);
  return newLog;
}

// Resource Actions

const FALLBACK_METADATA = { title: "New Resource", thumbnailUrl: "", resourceType: "article" };

function detectResourceType(url: URL): { resourceType: string; thumbnailUrl?: string } {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    const thumbnailUrl =
      id && /^[\w-]{6,20}$/.test(id) ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : undefined;
    return { resourceType: "video", thumbnailUrl };
  }
  if (host === "github.com") return { resourceType: "repo" };
  return { resourceType: "article" };
}

/**
 * Link-preview scraper used by the "add resource" bar. Requires a session and
 * only fetches public https pages (see lib/safe-fetch.ts).
 */
export async function fetchResourceMetadata(url: string) {
  await requireUser();
  const parsed = zHttpUrl.safeParse(url);
  if (!parsed.success) return FALLBACK_METADATA;
  const target = new URL(parsed.data);
  const detected = detectResourceType(target);

  try {
    const res = await safeFetchHtml(target.toString());
    if (res.status >= 400 || !/html/i.test(res.contentType)) {
      return { ...FALLBACK_METADATA, ...detected, thumbnailUrl: detected.thumbnailUrl ?? "" };
    }
    const $ = cheerio.load(res.body);
    const title =
      $('meta[property="og:title"]').attr("content") || $("title").first().text() || "Untitled Resource";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const ogImageOk = zHttpUrl.safeParse(ogImage).success ? ogImage : "";

    return {
      title: title.trim().substring(0, 100),
      thumbnailUrl: detected.thumbnailUrl ?? ogImageOk,
      resourceType: detected.resourceType,
    };
  } catch (error) {
    console.error("Scraping error:", error instanceof Error ? error.message : error);
    return { ...FALLBACK_METADATA, ...detected, thumbnailUrl: detected.thumbnailUrl ?? "" };
  }
}

export async function addResource(
  sandboxId: string,
  data: {
    title: string;
    url: string;
    phaseId: string | null;
    resourceType: string;
    thumbnailUrl?: string;
  }
) {
  const userId = await requireUser();
  const sid = parseInput(zId, sandboxId);
  const input = parseInput(resourceInput, data);
  if (input.phaseId) {
    await assertPhaseOwner(input.phaseId, sid, userId);
  } else {
    await assertSandboxOwner(sid, userId);
  }

  const [newResource] = await db
    .insert(sandboxResources)
    .values({
      sandboxId: sid,
      phaseId: input.phaseId,
      title: input.title,
      url: input.url,
      resourceType: input.resourceType,
      thumbnailUrl: input.thumbnailUrl,
    })
    .returning();

  revalidatePath(`/dashboard/sandbox/${sid}`);
  return newResource;
}

export async function getResources(sandboxId: string) {
  const userId = await requireUser();
  const sid = parseInput(zId, sandboxId);
  await assertSandboxOwner(sid, userId);

  return db
    .select()
    .from(sandboxResources)
    .where(eq(sandboxResources.sandboxId, sid))
    .orderBy(desc(sandboxResources.createdAt));
}

export async function deleteResource(resourceId: string, sandboxId: string) {
  const userId = await requireUser();
  const rid = parseInput(zId, resourceId);
  const sid = parseInput(zId, sandboxId);
  await assertResourceOwner(rid, sid, userId);

  await db
    .delete(sandboxResources)
    .where(and(eq(sandboxResources.id, rid), eq(sandboxResources.sandboxId, sid)));

  revalidatePath(`/dashboard/sandbox/${sid}`);
}

export async function toggleResourceStatus(resourceId: string, sandboxId: string, currentStatus: string) {
  const userId = await requireUser();
  const rid = parseInput(zId, resourceId);
  const sid = parseInput(zId, sandboxId);
  const status = parseInput(z.enum(["read", "unread"]), currentStatus);
  await assertResourceOwner(rid, sid, userId);

  await db
    .update(sandboxResources)
    .set({ status: status === "unread" ? "read" : "unread" })
    .where(and(eq(sandboxResources.id, rid), eq(sandboxResources.sandboxId, sid)));

  revalidatePath(`/dashboard/sandbox/${sid}`);
}
