import { prisma } from "@/lib/prisma";
import { generateRandomIdentity } from "@/constants/identities";
import { SessionPayload } from "@/types/auth";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "whispr_session_token";
const SESSION_DURATION_DAYS = 30;

export class AuthService {
  /**
   * Creates a new anonymous guest user and session
   */
  static async createAnonymousSession(ipHash?: string): Promise<SessionPayload> {
    const { username, avatar, accentColor } = generateRandomIdentity();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        username,
        avatar,
        accentColor,
        isAdmin: false,
        sessions: {
          create: {
            token,
            expiresAt,
            ipHash,
          },
        },
      },
      include: {
        sessions: true,
      },
    });

    const session = user.sessions[0];

    return {
      sessionId: session.id,
      token: session.token,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      accentColor: user.accentColor,
      isAdmin: user.isAdmin,
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  /**
   * Validates a session token and returns the user payload
   */
  static async validateSession(token: string): Promise<SessionPayload | null> {
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
      }
      return null;
    }

    // Update lastSeen asynchronously
    prisma.user
      .update({
        where: { id: session.user.id },
        data: { lastSeen: new Date() },
      })
      .catch(() => null);

    return {
      sessionId: session.id,
      token: session.token,
      userId: session.user.id,
      username: session.user.username,
      avatar: session.user.avatar,
      accentColor: session.user.accentColor,
      isAdmin: session.user.isAdmin,
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  /**
   * Deletes a session (Logout)
   */
  static async deleteSession(token: string): Promise<boolean> {
    try {
      await prisma.session.delete({ where: { token } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refreshes identity (generates a new random username/avatar/color for existing user, disabling Admin)
   */
  static async refreshIdentity(userId: string): Promise<{ username: string; avatar: string; accentColor: string; isAdmin: boolean }> {
    const { username, avatar, accentColor } = generateRandomIdentity();
    await prisma.user.update({
      where: { id: userId },
      data: { username, avatar, accentColor, isAdmin: false },
    });
    return { username, avatar, accentColor, isAdmin: false };
  }

  /**
   * Activates Admin mode for a user if the passkey matches
   */
  static async activateAdmin(userId: string, passkey: string): Promise<{ success: boolean; error?: string }> {
    const expectedKey = process.env.ADMIN_PASSKEY || "admin123";
    if (passkey !== expectedKey) {
      return { success: false, error: "Invalid Admin Passkey" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: true,
        username: "Admin",
        avatar: "🛡️",
        accentColor: "#10b981", // Emerald green for admin
      },
    });

    return { success: true };
  }

  /**
   * Updates user settings (avatar and accent color)
   */
  static async updateUserSettings(userId: string, avatar: string, accentColor: string): Promise<{ username: string; avatar: string; accentColor: string; isAdmin: boolean }> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar, accentColor },
    });
    return { username: user.username, avatar: user.avatar, accentColor: user.accentColor, isAdmin: user.isAdmin };
  }
}
