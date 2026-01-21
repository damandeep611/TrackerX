import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { entries, timeSlots } from "@/db/schema/daily-log-schema";
import { eq, and, isNull, between, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const result = await db
      .select({
        color: entries.colorLabel,
        totalMinutes: sql<number>`sum(${timeSlots.endMinutes} - ${timeSlots.startMinutes})`.mapWith(Number),
      })
      .from(entries)
      .innerJoin(timeSlots, eq(entries.id, timeSlots.entryId))
      .where(and(
        eq(entries.userId, session.user.id),
        eq(entries.type, 'activity'),
        between(entries.date, startDate, endDate),
        isNull(entries.deletedAt)
      ))
      .groupBy(entries.colorLabel);

    return NextResponse.json(result);

  } catch (error) {
    console.error("GET /api/analytics/duration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
