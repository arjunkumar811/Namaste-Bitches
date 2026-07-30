"use client";

import { useEffect, useRef } from "react";
import { RealtimeEvent, RealtimeEventType } from "@/types/realtime";

type EventCallback<T = unknown> = (data: T, event: RealtimeEvent<T>) => void;

export function useRealtime(
  channel: string,
  onEvent?: EventCallback,
  eventType?: RealtimeEventType
) {
  const lastTimestampRef = useRef<number>(Date.now());
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!channel) return;

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isConnected = false;

    // Attempt Server-Sent Events (SSE) connection
    try {
      eventSource = new EventSource(`/api/realtime/stream?channel=${encodeURIComponent(channel)}`);

      eventSource.addEventListener("connected", () => {
        isConnected = true;
      });

      // Listen for all event types we care about
      const types: RealtimeEventType[] = [
        "message:new",
        "message:delete",
        "message:reaction",
        "message:burn",
        "user:join",
        "user:leave",
        "typing:start",
        "typing:stop",
        "room:update",
      ];

      types.forEach((type) => {
        eventSource?.addEventListener(type, (e: MessageEvent) => {
          try {
            const parsed: RealtimeEvent = JSON.parse(e.data);
            lastTimestampRef.current = Math.max(lastTimestampRef.current, parsed.timestamp);
            if (!eventType || eventType === parsed.event) {
              callbackRef.current?.(parsed.data, parsed);
            }
          } catch {
            // ignore JSON parse err
          }
        });
      });

      eventSource.onerror = () => {
        // If SSE fails or disconnects, ensure polling is running
        if (!pollInterval) {
          startPollingFallback();
        }
      };

      // In serverless environments (Vercel), SSE doesn't share memory across instances.
      // We must start polling immediately to ensure we fetch messages from the DB
      // that were created by other lambda instances.
      startPollingFallback();
    } catch {
      startPollingFallback();
    }

    function startPollingFallback() {
      if (pollInterval) return;
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/realtime/poll?channel=${encodeURIComponent(channel)}&since=${lastTimestampRef.current}`
          );
          if (!res.ok) return;
          const data = await res.json();
          if (data.events && Array.isArray(data.events)) {
            data.events.forEach((ev: RealtimeEvent) => {
              lastTimestampRef.current = Math.max(lastTimestampRef.current, ev.timestamp);
              if (!eventType || eventType === ev.event) {
                callbackRef.current?.(ev.data, ev);
              }
            });
          }
        } catch {
          // ignore network poll error
        }
      }, 3000); // Poll every 3 seconds as fallback
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [channel, eventType]);
}
