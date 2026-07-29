"use server";

import { getSession } from "@/actions/auth.actions";
import { ChatService } from "@/services/chat.service";
import { RealtimeService } from "@/services/realtime.service";
import { ChatMessage, SendMessagePayload } from "@/types/chat";

export async function getRoomMessagesAction(roomId: string): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
  try {
    const session = await getSession();
    const messages = await ChatService.getMessages(roomId, session?.userId);
    return { success: true, messages };
  } catch (error) {
    console.error("Failed to get messages:", error);
    return { success: false, error: "Failed to load messages" };
  }
}

export async function sendMessageAction(payload: SendMessagePayload): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated. Please wait for guest login." };
    }

    if (!payload.content || payload.content.trim().length === 0) {
      return { success: false, error: "Message cannot be empty" };
    }

    if (payload.content.length > 500) {
      return { success: false, error: "Message exceeds 500 characters" };
    }

    const message = await ChatService.sendMessage(session.userId, {
      roomId: payload.roomId,
      content: payload.content.trim(),
      expiresInSeconds: payload.expiresInSeconds,
    });

    return { success: true, message };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function toggleReactionAction(messageId: string, emoji: string): Promise<{ success: boolean }> {
  try {
    const session = await getSession();
    if (!session) return { success: false };

    await ChatService.toggleReaction(session.userId, messageId, emoji);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false };
  }
}

export async function deleteMessageAction(messageId: string): Promise<{ success: boolean }> {
  try {
    const session = await getSession();
    if (!session) return { success: false };

    const success = await ChatService.deleteMessage(session.userId, messageId);
    return { success };
  } catch {
    return { success: false };
  }
}

export async function broadcastTypingAction(roomId: string, isTyping: boolean): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await RealtimeService.broadcast(`room:${roomId}`, isTyping ? "typing:start" : "typing:stop", {
    roomId,
    userId: session.userId,
    username: session.username,
    isTyping,
  });
}
