import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { entries, timeSlots } from "@/db/schema/daily-log-schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['log-note', 'activity']),
  timeMinutes: z.number().min(0).max(1440).optional().nullable(),
  content: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  colorLabel: z.string().optional().nullable(),
  slots: z.array(z.object({
    start: z.number().min(0).max(1440),
    end: z.number().min(0).max(1440),
  })).optional()
}).refine((data) => {
  if (data.type === 'activity' && data.slots) {
    return data.slots.every(s => s.end > s.start);
  }
  return true;
}, { message: "End time must be greater than start time for all slots" });

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const userEntries = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, session.user.id),
        eq(entries.date, dateParam),
        isNull(entries.deletedAt)
      ),
      with: {
        timeSlots: true,
      },
      orderBy: [desc(entries.createdAt)],
    });

    return NextResponse.json(userEntries);
  } catch (error) {
    console.error("GET /api/entries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = entrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    const result = await db.transaction(async (tx) => {
      const [newEntry] = await tx.insert(entries).values({
        userId: session.user.id,
        date: data.date,
        type: data.type,
        timeMinutes: data.timeMinutes,
        content: data.content,
        title: data.title,
        colorLabel: data.colorLabel,
      }).returning();

      if (data.type === 'activity' && data.slots && data.slots.length > 0) {
        await tx.insert(timeSlots).values(
          data.slots.map(slot => ({
            entryId: newEntry.id,
            startMinutes: slot.start,
            endMinutes: slot.end,
          }))
        );
      }
      
      return newEntry;
    });
    
    // Fetch the complete entry with slots to return
    const completeEntry = await db.query.entries.findFirst({
        where: eq(entries.id, result.id),
        with: {
            timeSlots: true
        }
    });

    return NextResponse.json(completeEntry, { status: 201 });

  } catch (error) {
    console.error("POST /api/entries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
