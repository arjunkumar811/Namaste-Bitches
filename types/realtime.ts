export type RealtimeEventType =
  | "message:new"
  | "message:delete"
  | "message:reaction"
  | "message:burn"
  | "user:join"
  | "user:leave"
  | "typing:start"
  | "typing:stop"
  | "room:update";

export interface RealtimeEvent<T = unknown> {
  channel: string;
  event: RealtimeEventType;
  data: T;
  timestamp: number;
}

export interface TypingEventData {
  roomId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ReactionEventData {
  messageId: string;
  roomId: string;
  userId: string;
  emoji: string;
}

export interface BurnEventData {
  messageId: string;
  roomId: string;
}
