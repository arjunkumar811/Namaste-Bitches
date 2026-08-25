import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configure web-push with VAPID keys from environment variables
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@namastechat.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export class PushService {
  /**
   * Send a notification to all subscribers of a specific room.
   * If any subscription is invalid/expired, it removes it from the database.
   */
  static async notifyRoom(roomId: string, payload: { title: string; body: string; url: string }, excludeEndpoint?: string) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { roomId },
      });

      if (subscriptions.length === 0) return;

      const pushPromises = subscriptions.map(async (sub) => {
        // Do not notify the sender if they provided their endpoint
        if (excludeEndpoint && sub.endpoint === excludeEndpoint) return;

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
        } catch (error: any) {
          // If subscription is expired or no longer valid (status 410 or 404), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            console.error("Failed to send push notification:", error);
          }
        }
      });

      await Promise.allSettled(pushPromises);
    } catch (error) {
      console.error("Error in notifyRoom:", error);
    }
  }
}
