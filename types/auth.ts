export interface AnonymousIdentity {
  id: string;
  username: string;
  avatar: string;
  accentColor: string;
  isAdmin?: boolean;
}

export interface SessionPayload {
  sessionId: string;
  token: string;
  userId: string;
  username: string;
  avatar: string;
  accentColor: string;
  isAdmin?: boolean;
  expiresAt: string;
}

export interface UserPreferences {
  theme: "dark" | "cyber" | "neon" | "midnight";
  radius: number; // in meters (e.g., 500, 1000, 5000, 10000)
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}
