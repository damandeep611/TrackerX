"use server";

import { db } from "@/db/drizzle";
import { sandboxes, sandboxPhases, sandboxLogs, sandboxResources } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

export async function createSandbox(data: { name: string; targetHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const [newSandbox] = await db
    .insert(sandboxes)
    .values({
      name: data.name,
      targetHours: data.targetHours,
      userId,
    })
    .returning();

  revalidatePath("/dashboard/sandbox");
  return newSandbox;
}

export async function deleteSandbox(sandboxId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Due to cascade delete, this should remove phases and logs too.
  await db.delete(sandboxes).where(eq(sandboxes.id, sandboxId));

  revalidatePath("/dashboard/sandbox");
}

export async function getSandboxes() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const userSandboxes = await db
    .select()
    .from(sandboxes)
    .where(eq(sandboxes.userId, userId));

  return userSandboxes;
}

// Phase Actions

export async function createPhase(sandboxId: string, data: { title: string; description: string; milestones: string[]; allocatedHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Calculate order index
  const existingPhases = await db
    .select({ orderIndex: sandboxPhases.orderIndex })
    .from(sandboxPhases)
    .where(eq(sandboxPhases.sandboxId, sandboxId))
    .orderBy(desc(sandboxPhases.orderIndex))
    .limit(1);
  
  const nextOrderIndex = existingPhases.length > 0 ? existingPhases[0].orderIndex + 1 : 0;

  const [newPhase] = await db
    .insert(sandboxPhases)
    .values({
      sandboxId,
      title: data.title,
      description: data.description,
      milestones: data.milestones,
      allocatedHours: data.allocatedHours.toString(),
      orderIndex: nextOrderIndex,
    })
    .returning();

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return newPhase;
}

export async function updatePhase(phaseId: string, sandboxId: string, data: { title: string; description: string; milestones: string[]; allocatedHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [updatedPhase] = await db
    .update(sandboxPhases)
    .set({
      title: data.title,
      description: data.description,
      milestones: data.milestones,
      allocatedHours: data.allocatedHours.toString(),
    })
    .where(eq(sandboxPhases.id, phaseId))
    .returning();

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return updatedPhase;
}

export async function deletePhase(phaseId: string, sandboxId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.delete(sandboxPhases).where(eq(sandboxPhases.id, phaseId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
}

// Log Actions

export async function logSession(sandboxId: string, phaseId: string, data: { title: string; startTime: Date; endTime: Date; duration: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Insert Log
  const [newLog] = await db
    .insert(sandboxLogs)
    .values({
      phaseId,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration.toString(),
    })
    .returning();

  // Update Sandbox Current Hours
  // We can do this efficiently with SQL increment or by summing up. 
  // Incrementing is faster but summing is safer against drift.
  // Given we track all logs, let's just increment for now.
  
  await db
    .update(sandboxes)
    .set({
      currentHours: sql`${sandboxes.currentHours} + ${data.duration.toString()}`,
    })
    .where(eq(sandboxes.id, sandboxId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return newLog;
}

// Resource Actions

export async function fetchResourceMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").text() || $('meta[property="og:title"]').attr("content") || "Untitled Resource";
    let thumbnailUrl = $('meta[property="og:image"]').attr("content") || "";
    
    let resourceType = "article";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      resourceType = "video";
      const ytMatch = url.match(/(?:[?&]v=|\/embed\/|\/v\/|youtu\.be\/|\/watch\?v=|&v=)([^#&?]*).*/);
      if (ytMatch && ytMatch[1]) {
        thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
      }
    } else if (url.includes("github.com")) {
      resourceType = "repo";
    }

    return { 
      title: title.trim().substring(0, 100), 
      thumbnailUrl, 
      resourceType 
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return { title: "New Resource", thumbnailUrl: "", resourceType: "article" };
  }
}

export async function addResource(sandboxId: string, data: { 
  title: string; 
  url: string; 
  phaseId: string | null; 
  resourceType: string;
  thumbnailUrl?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [newResource] = await db
    .insert(sandboxResources)
    .values({
      sandboxId,
      phaseId: data.phaseId,
      title: data.title,
      url: data.url,
      resourceType: data.resourceType,
      thumbnailUrl: data.thumbnailUrl,
    })
    .returning();

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return newResource;
}

export async function getResources(sandboxId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return await db
    .select()
    .from(sandboxResources)
    .where(eq(sandboxResources.sandboxId, sandboxId))
    .orderBy(desc(sandboxResources.createdAt));
}

export async function deleteResource(resourceId: string, sandboxId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.delete(sandboxResources).where(eq(sandboxResources.id, resourceId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
}

export async function toggleResourceStatus(resourceId: string, sandboxId: string, currentStatus: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const newStatus = currentStatus === "unread" ? "read" : "unread";

  await db
    .update(sandboxResources)
    .set({ status: newStatus })
    .where(eq(sandboxResources.id, resourceId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
}
