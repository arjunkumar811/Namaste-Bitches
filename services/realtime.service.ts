import { RealtimeEvent, RealtimeEventType } from "@/types/realtime";
import { EventEmitter } from "events";

// Global EventEmitter for zero-config Server-Sent Events (SSE) and polling fallback in local/demo mode
const globalForEvents = globalThis as unknown as {
  realtimeEmitter: EventEmitter | undefined;
  recentEvents: RealtimeEvent[] | undefined;
};

export const realtimeEmitter =
  globalForEvents.realtimeEmitter ?? new EventEmitter();
realtimeEmitter.setMaxListeners(1000);

export const recentEvents = globalForEvents.recentEvents ?? [];

if (process.env.NODE_ENV !== "production") {
  globalForEvents.realtimeEmitter = realtimeEmitter;
  globalForEvents.recentEvents = recentEvents;
}

export class RealtimeService {
  /**
   * Broadcast an event to a channel (Room)
   * In zero-config mode, this pushes to EventEmitter for SSE & polling
   */
  static async broadcast<T>(
    channel: string,
    event: RealtimeEventType,
    data: T
  ): Promise<void> {
    const payload: RealtimeEvent<T> = {
      channel,
      event,
      data,
      timestamp: Date.now(),
    };

    // Store in recent memory for polling fallback (keep last 500 events)
    recentEvents.push(payload);
    if (recentEvents.length > 500) {
      recentEvents.shift();
    }

    // Emit event locally for Server-Sent Events (SSE) subscribers
    realtimeEmitter.emit(channel, payload);
    realtimeEmitter.emit("all", payload);
  }

  /**
   * Get events that occurred after a specific timestamp (for polling fallback)
   */
  static getEventsSince(channel: string, sinceTimestamp: number): RealtimeEvent[] {
    return recentEvents.filter(
      (e) => (e.channel === channel || e.channel === "all") && e.timestamp > sinceTimestamp
    );
  }
}
