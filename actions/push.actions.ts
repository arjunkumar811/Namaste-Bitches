"use server";

import { prisma } from "@/lib/prisma";

export async function subscribeToRoomAction(
  roomId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!subscription.endpoint || !subscription.keys.p256dh || !subscription.keys.auth) {
      return { success: false, error: "Invalid subscription object" };
    }

    // Upsert the subscription for this roomId and endpoint
    await prisma.pushSubscription.upsert({
      where: {
        roomId_endpoint: {
          roomId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        roomId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

export async function unsubscribeFromRoomAction(
  roomId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        roomId,
        endpoint,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}
