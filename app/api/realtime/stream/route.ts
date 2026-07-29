import { NextRequest } from "next/server";
import { realtimeEmitter } from "@/services/realtime.service";
import { RealtimeEvent } from "@/types/realtime";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "all";

  if (channel.startsWith("room:")) {
    const roomId = channel.replace("room:", "");
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { isPrivate: true }});
    if (room?.isPrivate) {
      const cookieStore = await cookies();
      if (!cookieStore.has(`room_access_${roomId}`)) {
        return new Response("Unauthorized", { status: 401 });
      }
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat to establish connection
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"ok"}\n\n`));

      const listener = (event: RealtimeEvent) => {
        try {
          const formatted = `event: ${event.event}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(formatted));
        } catch {
          // Controller may be closed
        }
      };

      realtimeEmitter.on(channel, listener);

      // Keep-alive heartbeat interval every 20s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(interval);
          realtimeEmitter.off(channel, listener);
        }
      }, 20000);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        realtimeEmitter.off(channel, listener);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
