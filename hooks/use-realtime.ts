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
    let pollTimer: NodeJS.Timeout | null = null;
    let isConnected = false;
    let isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    let currentPollDelay = 3000;
    const maxPollDelay = 30000;

    // Attempt Server-Sent Events (SSE) connection
    function connectSSE() {
      if (isOffline) return;
      if (eventSource) {
        eventSource.close();
      }

      try {
        eventSource = new EventSource(`/api/realtime/stream?channel=${encodeURIComponent(channel)}`);

        eventSource.addEventListener("connected", () => {
          isConnected = true;
          currentPollDelay = 3000; // Reset backoff on success
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
          if (eventSource?.readyState === EventSource.CLOSED) {
            isConnected = false;
            startPollingFallback();
          }
        };

        // Start polling fallback immediately for serverless sync
        startPollingFallback();
      } catch {
        startPollingFallback();
      }
    }

    async function doPoll() {
      if (isOffline) return;
      try {
        const res = await fetch(
          `/api/realtime/poll?channel=${encodeURIComponent(channel)}&since=${lastTimestampRef.current}`
        );
        if (!res.ok) {
           // backoff
           currentPollDelay = Math.min(currentPollDelay * 1.5, maxPollDelay);
           return;
        }
        // Success, reset backoff
        currentPollDelay = 3000;
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
        // network error, backoff
        currentPollDelay = Math.min(currentPollDelay * 1.5, maxPollDelay);
      } finally {
        if (!isOffline && pollTimer !== null) { 
           // If not explicitly stopped, schedule next poll
           pollTimer = setTimeout(doPoll, currentPollDelay);
        }
      }
    }

    function startPollingFallback() {
      if (pollTimer) return; // already running
      pollTimer = setTimeout(doPoll, currentPollDelay);
    }
    
    function stopPollingFallback() {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    }

    // Event Listeners for network & visibility
    const handleOnline = () => {
      isOffline = false;
      currentPollDelay = 3000; // Reset
      connectSSE();
    };

    const handleOffline = () => {
      isOffline = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        isConnected = false;
      }
      stopPollingFallback();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (isOffline) return;
        // Trigger an immediate poll to catch up when returning to foreground
        stopPollingFallback();
        currentPollDelay = 3000;
        doPoll();
        
        // Reconnect SSE if not connected
        if (!isConnected) connectSSE();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Initial connection
    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      stopPollingFallback();
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [channel, eventType]);
}
