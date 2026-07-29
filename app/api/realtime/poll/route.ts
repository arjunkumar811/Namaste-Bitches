import { NextRequest, NextResponse } from "next/server";
import { RealtimeService } from "@/services/realtime.service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "all";
  const since = parseInt(searchParams.get("since") || "0", 10);

  if (channel.startsWith("room:")) {
    const roomId = channel.replace("room:", "");
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { isPrivate: true }});
    if (room?.isPrivate) {
      const cookieStore = await cookies();
      if (!cookieStore.has(`room_access_${roomId}`)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  const events = RealtimeService.getEventsSince(channel, since);
  return NextResponse.json({ events, timestamp: Date.now() });
}
