"use server";

import { cookies } from "next/headers";
import { AuthService, SESSION_COOKIE_NAME } from "@/services/auth.service";
import { SessionPayload } from "@/types/auth";
import { RateLimiter } from "@/lib/rate-limit";

// 5 attempts per 15 minutes
const adminRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

/**
 * Gets the current active session or returns null
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return AuthService.validateSession(token);
}

/**
 * Automatically logins as an anonymous guest, creating session cookie if not present
 */
export async function loginAnonymously(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingToken) {
    const validSession = await AuthService.validateSession(existingToken);
    if (validSession) return validSession;
  }

  // Create new session
  const newSession = await AuthService.createAnonymousSession();

  // Set secure HTTP-only cookie
  cookieStore.set(SESSION_COOKIE_NAME, newSession.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return newSession;
}

/**
 * Logouts the user and clears session cookie
 */
export async function logoutAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await AuthService.deleteSession(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  return true;
}

/**
 * Rerolls identity for the active session
 */
export async function rerollIdentityAction(): Promise<{ success: boolean; identity?: { username: string; avatar: string; accentColor: string; isAdmin?: boolean } }> {
  const session = await getSession();
  if (!session) return { success: false };

  const newIdentity = await AuthService.refreshIdentity(session.userId);
  return { success: true, identity: newIdentity };
}

/**
 * Activates Admin access for the active session
 */
export async function activateAdminAction(passkey: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "No active session" };

  const rateCheck = adminRateLimiter.check(session.userId);
  if (!rateCheck.success) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  return AuthService.activateAdmin(session.userId, passkey);
}

