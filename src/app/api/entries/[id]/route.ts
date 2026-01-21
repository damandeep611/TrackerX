import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { entries, timeSlots } from "@/db/schema/daily-log-schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  timeMinutes: z.number().min(0).max(1440).optional().nullable(),
  content: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  colorLabel: z.string().optional().nullable(),
  slots: z.array(z.object({
    start: z.number().min(0).max(1440),
    end: z.number().min(0).max(1440),
  })).optional()
}).refine((data) => {
  if (data.slots) {
    return data.slots.every(s => s.end > s.start);
  }
  return true;
}, { message: "End time must be greater than start time for all slots" });

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedEntry] = await db.update(entries)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(entries.id, id),
        eq(entries.userId, session.user.id)
      ))
      .returning();

    if (!deletedEntry) {
      return NextResponse.json({ error: "Entry not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Verify ownership first
    const existingEntry = await db.query.entries.findFirst({
        where: and(eq(entries.id, id), eq(entries.userId, session.user.id))
    });

    if (!existingEntry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // Update main entry fields
      await tx.update(entries)
        .set({
            ...(data.timeMinutes !== undefined ? { timeMinutes: data.timeMinutes } : {}),
            ...(data.content !== undefined ? { content: data.content } : {}),
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.colorLabel !== undefined ? { colorLabel: data.colorLabel } : {}),
            updatedAt: new Date(),
        })
        .where(eq(entries.id, id));

      // Update slots if provided
      if (data.slots) {
        // Delete existing slots
        await tx.delete(timeSlots).where(eq(timeSlots.entryId, id));
        
        // Insert new slots
        if (data.slots.length > 0) {
            await tx.insert(timeSlots).values(
                data.slots.map(slot => ({
                    entryId: id,
                    startMinutes: slot.start,
                    endMinutes: slot.end,
                }))
            );
        }
      }
    });

    const updatedEntry = await db.query.entries.findFirst({
        where: eq(entries.id, id),
        with: { timeSlots: true }
    });

    return NextResponse.json(updatedEntry);

  } catch (error) {
    console.error("PATCH /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
