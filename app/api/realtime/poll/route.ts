import { NextRequest, NextResponse } from "next/server";
import { RealtimeService } from "@/services/realtime.service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ChatService } from "@/services/chat.service";
import { RealtimeEvent } from "@/types/realtime";

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

    // Serverless (Vercel) doesn't share memory between instances, so we MUST fetch
    // new messages from the Database directly to enable "live" chat polling.
    const newMessages = await prisma.message.findMany({
      where: {
        roomId,
        createdAt: { gt: new Date(since) },
        isDeleted: false,
      },
      include: {
        user: true,
        reactions: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" }
    });

    const dbEvents: RealtimeEvent[] = newMessages.map(msg => ({
      channel,
      event: "message:new",
      data: ChatService.formatMessage(msg),
      timestamp: msg.createdAt.getTime(),
    }));

    // Also get in-memory events for local dev (which includes typing indicators)
    const memEvents = RealtimeService.getEventsSince(channel, since);
    
    // Merge events from DB and memory
    const allEvents = [...dbEvents, ...memEvents];
    const uniqueEvents = Array.from(
      new Map(allEvents.map(e => [`${e.event}-${e.timestamp}`, e])).values()
    );
    uniqueEvents.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ events: uniqueEvents, timestamp: Date.now() });
  }

  const events = RealtimeService.getEventsSince(channel, since);
  return NextResponse.json({ events, timestamp: Date.now() });
}
