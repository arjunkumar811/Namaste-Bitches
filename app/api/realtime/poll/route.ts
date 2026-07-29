import { NextRequest, NextResponse } from "next/server";
import { RealtimeService } from "@/services/realtime.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "all";
  const since = parseInt(searchParams.get("since") || "0", 10);

  const events = RealtimeService.getEventsSince(channel, since);
  return NextResponse.json({ events, timestamp: Date.now() });
}
