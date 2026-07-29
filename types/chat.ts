import { Message, Reaction } from "@prisma/client";

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // usernames or userIds who reacted
  hasReacted: boolean;
}

export interface ChatMessage extends Message {
  user: {
    id: string;
    username: string;
    avatar: string;
    accentColor: string;
    isAdmin?: boolean;
  };
  reactionsList: ChatReaction[];
  isOwn?: boolean;
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
  expiresInSeconds?: number; // for ephemeral burning messages
}
