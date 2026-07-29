import { prisma } from "@/lib/prisma";
import { RealtimeService } from "@/services/realtime.service";
import { ChatMessage, ChatReaction, SendMessagePayload } from "@/types/chat";
import { Message, Reaction, User } from "@prisma/client";

type MessageWithRelations = Message & {
  user: User;
  reactions: (Reaction & { user: User })[];
};

export class ChatService {
  /**
   * Formats database message with aggregated reactions list
   */
  static formatMessage(msg: MessageWithRelations, currentUserId?: string): ChatMessage {
    const reactionMap = new Map<string, { count: number; users: string[]; hasReacted: boolean }>();

    msg.reactions.forEach((r) => {
      const existing = reactionMap.get(r.emoji) || { count: 0, users: [], hasReacted: false };
      existing.count += 1;
      existing.users.push(r.user.username);
      if (r.userId === currentUserId) {
        existing.hasReacted = true;
      }
      reactionMap.set(r.emoji, existing);
    });

    const reactionsList: ChatReaction[] = Array.from(reactionMap.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));

    return {
      ...msg,
      user: {
        id: msg.user.id,
        username: msg.user.username,
        avatar: msg.user.avatar,
        accentColor: msg.user.accentColor,
        isAdmin: msg.user.isAdmin,
      },
      reactionsList,
      isOwn: msg.userId === currentUserId,
    };
  }

  /**
   * Fetches chat messages for a room with cursor pagination
   */
  static async getMessages(roomId: string, currentUserId?: string, limit: number = 50, cursor?: string): Promise<ChatMessage[]> {
    const messages = await prisma.message.findMany({
      where: {
        roomId,
        isDeleted: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "asc" },
      include: {
        user: true,
        reactions: { include: { user: true } },
      },
    });

    return messages.map((m) => this.formatMessage(m, currentUserId));
  }

  /**
   * Send a new message to a room
   */
  static async sendMessage(userId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const expiresAt = payload.expiresInSeconds
      ? new Date(Date.now() + payload.expiresInSeconds * 1000)
      : null;

    const newMsg = await prisma.message.create({
      data: {
        roomId: payload.roomId,
        userId,
        content: payload.content,
        expiresAt,
      },
      include: {
        user: true,
        reactions: { include: { user: true } },
      },
    });

    const formatted = this.formatMessage(newMsg, userId);

    // Broadcast to room channel via zero-config SSE / polling
    await RealtimeService.broadcast(`room:${payload.roomId}`, "message:new", formatted);

    return formatted;
  }

  /**
   * Toggle reaction on a message
   */
  static async toggleReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    const existing = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: { messageId, userId, emoji },
      });
    }

    const updatedMsg = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: true,
        reactions: { include: { user: true } },
      },
    });

    if (updatedMsg) {
      const formatted = this.formatMessage(updatedMsg, userId);
      await RealtimeService.broadcast(`room:${updatedMsg.roomId}`, "message:reaction", formatted);
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(userId: string, messageId: string, isAdmin?: boolean): Promise<boolean> {
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return false;
    if (!isAdmin && msg.userId !== userId) return false;

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: "[Message Deleted]" },
    });

    await RealtimeService.broadcast(`room:${msg.roomId}`, "message:delete", { messageId, roomId: msg.roomId });
    return true;
  }
}
