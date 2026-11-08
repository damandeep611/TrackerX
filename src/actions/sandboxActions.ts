"use server";

import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import * as cheerio from "cheerio";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { sandboxes, sandboxLogs, sandboxMilestones, sandboxResources } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { assertResourceOwner, assertSandboxOwner, NotFoundError } from "@/lib/ownership";
import { buildProjectInsights, INSIGHTS_WINDOW_DAYS, lastNDays } from "@/lib/insights";
import { getUserToday } from "@/lib/user-today";
import { safeFetchHtml } from "@/lib/safe-fetch";
import {
  parseInput,
  tryParseInput,
  zHttpUrl,
  zId,
  zLocalDate,
  zOptionalText,
  zText,
} from "@/lib/validation";
import { MAX_ENTRY_MINUTES } from "@/types/skillDashboardTypes";
import {
  MILESTONE_STEP_HOURS,
  RESOURCE_TYPES,
  type NewSandboxLog,
  type SandboxLog,
  type SandboxOverview,
  type SandboxResource,
  type SandboxSummary,
} from "@/types/sandbox";

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };

const fail = (error: string) => ({ success: false as const, error });

/** Owner check that turns "not yours / doesn't exist" into a result instead of a throw. */
async function ownsSandbox(sandboxId: string, userId: string) {
  try {
    await assertSandboxOwner(sandboxId, userId);
    return true;
  } catch (e) {
    if (e instanceof NotFoundError) return false;
    throw e;
  }
}

const day = sql<string>`to_char(${sandboxLogs.loggedDate}, 'YYYY-MM-DD')`;
const minutesSum = sql<number>`coalesce(sum(${sandboxLogs.minutes}), 0)`.mapWith(Number);
const lastDay = sql<string | null>`to_char(max(${sandboxLogs.loggedDate}), 'YYYY-MM-DD')`;
const startOf = (key: string) => new Date(`${key}T00:00:00.000Z`);

/* -------------------------------------------------------------------------- */
/* Sandboxes                                                                  */
/* -------------------------------------------------------------------------- */

const sandboxInput = z.object({
  name: zText(120),
  targetHours: z.number().int().min(1).max(100_000),
});

/** Every sandbox of the user with total time and 14 days of activity (2 grouped queries). */
export async function getSandboxes(): Promise<{ today: string; sandboxes: SandboxSummary[] }> {
  const userId = await requireUser();
  const keys = lastNDays(14, await getUserToday());

  const [rows, daily] = await Promise.all([
    db
      .select({
        id: sandboxes.id,
        name: sandboxes.name,
        targetHours: sandboxes.targetHours,
        createdAt: sandboxes.createdAt,
        totalMinutes: minutesSum,
        lastLogged: lastDay,
      })
      .from(sandboxes)
      .leftJoin(sandboxLogs, eq(sandboxLogs.sandboxId, sandboxes.id))
      .where(eq(sandboxes.userId, userId))
      .groupBy(sandboxes.id)
      .orderBy(desc(sandboxes.createdAt)),
    db
      .select({ sandboxId: sandboxLogs.sandboxId, day, minutes: minutesSum })
      .from(sandboxLogs)
      .innerJoin(sandboxes, eq(sandboxLogs.sandboxId, sandboxes.id))
      .where(and(eq(sandboxes.userId, userId), gte(sandboxLogs.loggedDate, startOf(keys[0]))))
      .groupBy(sandboxLogs.sandboxId, day),
  ]);

  const byKey = new Map(daily.map((r) => [`${r.sandboxId}|${r.day}`, r.minutes]));
  return {
    today: keys.at(-1)!,
    sandboxes: rows.map((r) => {
      const daily14 = keys.map((k) => byKey.get(`${r.id}|${k}`) ?? 0);
      return {
        ...r,
        createdAt: r.createdAt.toISOString(),
        daily14,
        minutes7d: daily14.slice(-7).reduce((a, b) => a + b, 0),
      };
    }),
  };
}

export async function createSandbox(data: {
  name: string;
  targetHours: number;
}): Promise<Result<{ sandbox: SandboxSummary }>> {
  const userId = await requireUser();
  const input = tryParseInput(sandboxInput, data);
  if (!input) return fail("Give the sandbox a name and a target of at least 1 hour");

  const [row] = await db
    .insert(sandboxes)
    .values({ name: input.name, targetHours: input.targetHours, userId })
    .returning();

  return {
    success: true,
    sandbox: {
      id: row.id,
      name: row.name,
      targetHours: row.targetHours,
      createdAt: row.createdAt.toISOString(),
      totalMinutes: 0,
      minutes7d: 0,
      daily14: Array(14).fill(0),
      lastLogged: null,
    },
  };
}

export async function deleteSandbox(sandboxId: string): Promise<Result> {
  const userId = await requireUser();
  const id = tryParseInput(zId, sandboxId);
  if (!id) return fail("Sandbox not found");

  // Logs, resources and milestones go with it (ON DELETE CASCADE).
  const [deleted] = await db
    .delete(sandboxes)
    .where(and(eq(sandboxes.id, id), eq(sandboxes.userId, userId)))
    .returning({ id: sandboxes.id });
  return deleted ? { success: true } : fail("Sandbox not found");
}

/**
 * The detail page header: the sandbox, its trend/streak/pace insights and its
 * named milestones. Null when it doesn't exist or isn't the user's.
 */
export async function getSandboxOverview(sandboxId: string): Promise<SandboxOverview | null> {
  const userId = await requireUser();
  const id = tryParseInput(zId, sandboxId);
  if (!id) return null;

  const [sandbox] = await db
    .select({
      id: sandboxes.id,
      name: sandboxes.name,
      targetHours: sandboxes.targetHours,
      createdAt: sandboxes.createdAt,
    })
    .from(sandboxes)
    .where(and(eq(sandboxes.id, id), eq(sandboxes.userId, userId)));
  if (!sandbox) return null;

  const today = await getUserToday();
  const keys = lastNDays(INSIGHTS_WINDOW_DAYS, today);
  const [daily, [totals], milestones] = await Promise.all([
    db
      .select({ day, minutes: minutesSum })
      .from(sandboxLogs)
      .where(and(eq(sandboxLogs.sandboxId, id), gte(sandboxLogs.loggedDate, startOf(keys[0]))))
      .groupBy(day),
    db
      .select({ minutes: minutesSum, last: lastDay })
      .from(sandboxLogs)
      .where(eq(sandboxLogs.sandboxId, id)),
    db
      .select({ hourMark: sandboxMilestones.hourMark, label: sandboxMilestones.label })
      .from(sandboxMilestones)
      .where(eq(sandboxMilestones.sandboxId, id))
      .orderBy(sandboxMilestones.hourMark),
  ]);

  return {
    sandbox: { ...sandbox, createdAt: sandbox.createdAt.toISOString() },
    insights: buildProjectInsights(new Map(daily.map((r) => [r.day, r.minutes])), totals, today),
    milestones,
  };
}

/* -------------------------------------------------------------------------- */
/* Sessions (minutes + local date, like skill time logs)                      */
/* -------------------------------------------------------------------------- */

const LOG_LIMIT = 100;

const logInput = z.object({
  sandboxId: zId,
  // One entry is capped at 3h (owner decision); longer sessions are split.
  minutes: z
    .number()
    .int()
    .min(1)
    .max(MAX_ENTRY_MINUTES, `Max ${MAX_ENTRY_MINUTES / 60}h per entry`),
  date: zLocalDate,
  title: zOptionalText(200),
});

const toLog = (r: {
  id: string;
  title: string | null;
  minutes: number;
  loggedDate: Date;
  createdAt: Date;
}): SandboxLog => ({
  id: r.id,
  title: r.title,
  minutes: r.minutes,
  date: r.loggedDate.toISOString().slice(0, 10),
  createdAt: r.createdAt.toISOString(),
});

/** The most recent sessions, newest first. */
export async function getSandboxLogs(sandboxId: string): Promise<SandboxLog[]> {
  const userId = await requireUser();
  const id = parseInput(zId, sandboxId);
  await assertSandboxOwner(id, userId);

  const rows = await db
    .select()
    .from(sandboxLogs)
    .where(eq(sandboxLogs.sandboxId, id))
    .orderBy(desc(sandboxLogs.loggedDate), desc(sandboxLogs.createdAt))
    .limit(LOG_LIMIT);
  return rows.map(toLog);
}

/** Log a session that ended now, on the user's local date. */
export async function logSandboxSession(data: NewSandboxLog): Promise<Result<{ log: SandboxLog }>> {
  const userId = await requireUser();
  const parsed = logInput.safeParse(data);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid session");
  const input = parsed.data;
  if (!(await ownsSandbox(input.sandboxId, userId))) return fail("Sandbox not found");

  const [row] = await db
    .insert(sandboxLogs)
    .values({
      sandboxId: input.sandboxId,
      title: input.title,
      minutes: input.minutes,
      loggedDate: startOf(input.date),
    })
    .returning();
  return { success: true, log: toLog(row) };
}

/** Remove a session (the Undo toast and the delete button in the session list). */
export async function deleteSandboxLog(logId: string): Promise<Result> {
  const userId = await requireUser();
  const id = tryParseInput(zId, logId);
  if (!id) return fail("Session not found");

  const owned = db.select({ id: sandboxes.id }).from(sandboxes).where(eq(sandboxes.userId, userId));
  const [deleted] = await db
    .delete(sandboxLogs)
    .where(and(eq(sandboxLogs.id, id), inArray(sandboxLogs.sandboxId, owned)))
    .returning({ id: sandboxLogs.id });
  return deleted ? { success: true } : fail("Session not found");
}

/* -------------------------------------------------------------------------- */
/* Milestones (only named markers are stored)                                 */
/* -------------------------------------------------------------------------- */

const milestoneInput = z.object({
  sandboxId: zId,
  hourMark: z.number().int().min(MILESTONE_STEP_HOURS).max(100_000).multipleOf(MILESTONE_STEP_HOURS),
  label: zOptionalText(80),
});

/** Name a dial marker. An empty label removes the name (the marker itself stays). */
export async function setMilestoneLabel(data: {
  sandboxId: string;
  hourMark: number;
  label: string | null;
}): Promise<Result> {
  const userId = await requireUser();
  const input = tryParseInput(milestoneInput, data);
  if (!input) return fail("Invalid milestone");
  if (!(await ownsSandbox(input.sandboxId, userId))) return fail("Sandbox not found");

  const where = and(
    eq(sandboxMilestones.sandboxId, input.sandboxId),
    eq(sandboxMilestones.hourMark, input.hourMark)
  );
  if (!input.label) {
    await db.delete(sandboxMilestones).where(where);
  } else {
    await db
      .insert(sandboxMilestones)
      .values({ sandboxId: input.sandboxId, hourMark: input.hourMark, label: input.label })
      .onConflictDoUpdate({
        target: [sandboxMilestones.sandboxId, sandboxMilestones.hourMark],
        set: { label: input.label },
      });
  }
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* Resources                                                                  */
/* -------------------------------------------------------------------------- */

const resourceInput = z.object({
  title: zText(300),
  url: zHttpUrl,
  resourceType: z.enum(RESOURCE_TYPES).catch("article"),
  thumbnailUrl: zHttpUrl.optional().or(z.literal("")).transform((v) => v || undefined),
});

const toResource = (r: typeof sandboxResources.$inferSelect): SandboxResource => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
});

export async function getSandboxResources(sandboxId: string): Promise<SandboxResource[]> {
  const userId = await requireUser();
  const id = parseInput(zId, sandboxId);
  await assertSandboxOwner(id, userId);

  const rows = await db
    .select()
    .from(sandboxResources)
    .where(eq(sandboxResources.sandboxId, id))
    .orderBy(desc(sandboxResources.createdAt));
  return rows.map(toResource);
}

const FALLBACK_METADATA = { title: "", thumbnailUrl: "", resourceType: "article" };

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
  const fallback = { ...FALLBACK_METADATA, ...detected, thumbnailUrl: detected.thumbnailUrl ?? "" };

  try {
    const res = await safeFetchHtml(target.toString());
    if (res.status >= 400 || !/html/i.test(res.contentType)) return fallback;
    const $ = cheerio.load(res.body);
    const title = $('meta[property="og:title"]').attr("content") || $("title").first().text() || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const ogImageOk = zHttpUrl.safeParse(ogImage).success ? ogImage : "";

    return {
      title: title.trim().substring(0, 100),
      thumbnailUrl: detected.thumbnailUrl ?? ogImageOk,
      resourceType: detected.resourceType,
    };
  } catch (error) {
    console.error("Scraping error:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

export async function addResource(
  sandboxId: string,
  data: { title: string; url: string; resourceType: string; thumbnailUrl?: string }
): Promise<Result<{ resource: SandboxResource }>> {
  const userId = await requireUser();
  const sid = tryParseInput(zId, sandboxId);
  const input = tryParseInput(resourceInput, data);
  if (!sid || !input) return fail("Add a title and an http(s) link");
  if (!(await ownsSandbox(sid, userId))) return fail("Sandbox not found");

  const [row] = await db
    .insert(sandboxResources)
    .values({
      sandboxId: sid,
      title: input.title,
      url: input.url,
      resourceType: input.resourceType,
      thumbnailUrl: input.thumbnailUrl,
    })
    .returning();
  return { success: true, resource: toResource(row) };
}

export async function deleteResource(resourceId: string, sandboxId: string): Promise<Result> {
  const userId = await requireUser();
  const rid = parseInput(zId, resourceId);
  const sid = parseInput(zId, sandboxId);
  await assertResourceOwner(rid, sid, userId);

  await db
    .delete(sandboxResources)
    .where(and(eq(sandboxResources.id, rid), eq(sandboxResources.sandboxId, sid)));
  return { success: true };
}

/** Set a resource to read/unread (idempotent, so a double click can't flip it back). */
export async function setResourceStatus(
  resourceId: string,
  sandboxId: string,
  status: "read" | "unread"
): Promise<Result> {
  const userId = await requireUser();
  const rid = parseInput(zId, resourceId);
  const sid = parseInput(zId, sandboxId);
  const next = parseInput(z.enum(["read", "unread"]), status);
  await assertResourceOwner(rid, sid, userId);

  await db
    .update(sandboxResources)
    .set({ status: next })
    .where(and(eq(sandboxResources.id, rid), eq(sandboxResources.sandboxId, sid)));
  return { success: true };
}
