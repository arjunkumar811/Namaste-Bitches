"use server";

import { prisma } from "@/lib/prisma";
import { LocationService } from "@/services/location.service";
import { RoomWithDistance, RoomFilterState } from "@/types/location";
import { RealtimeService } from "@/services/realtime.service";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { cookies } from "next/headers";
import { getSession } from "@/actions/auth.actions";
import { RateLimiter } from "@/lib/rate-limit";

// 3 room creations per hour
const roomCreationLimiter = new RateLimiter(3, 60 * 60 * 1000);

/**
 * Fetch and filter nearby rooms based on user coordinates and filter preferences
 */
export async function getNearbyRooms(
  lat: number,
  lng: number,
  filters?: Partial<RoomFilterState>
): Promise<RoomWithDistance[]> {
  const radius = filters?.radius || 10000; // default 10km
  const category = filters?.category || "all";
  const search = (filters?.search || "").toLowerCase().trim();
  const sortBy = filters?.sortBy || "distance";

  // Fetch rooms (with message counts and presence)
  const rooms = await prisma.room.findMany({
    where: {
      isActive: true,
      ...(category !== "all" ? { category } : {}),
    },
    include: {
      _count: {
        select: { messages: true, presences: true },
      },
    },
  });

  const userCoord = { latitude: lat, longitude: lng };

  // Compute distances and filter by radius
  const roomsWithDistance: RoomWithDistance[] = rooms
    .map((room) => {
      const distance = LocationService.getDistanceInMeters(userCoord, {
        latitude: room.latitude,
        longitude: room.longitude,
      });

      // Strip sensitive fields
      const { latitude, longitude, password, ...safeRoom } = room;

      return {
        ...safeRoom,
        distance,
        formattedDistance: LocationService.formatDistance(distance),
        userCount: safeRoom._count.presences + Math.floor(safeRoom._count.messages / 3) + 1, // Simulated active feel
      };
    })
    .filter((room) => {
      // Allow rooms within radius OR if they are marked pinned/global
      const withinRadius = room.distance <= radius;
      const matchesSearch =
        !search ||
        room.name.toLowerCase().includes(search) ||
        (room.description && room.description.toLowerCase().includes(search));

      return (withinRadius || room.distance <= 50000) && matchesSearch;
    });

  // Sort rooms
  roomsWithDistance.sort((a, b) => {
    if (sortBy === "distance") return a.distance - b.distance;
    if (sortBy === "active") return (b.userCount || 0) - (a.userCount || 0);
    if (sortBy === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
    return a.distance - b.distance;
  });

  return roomsWithDistance;
}

/**
 * Get a specific room by id or slug
 */
export async function getRoomById(roomId: string): Promise<RoomWithDistance | null> {
  const room = await prisma.room.findFirst({
    where: {
      OR: [{ id: roomId }, { slug: roomId }],
    },
    include: {
      _count: { select: { messages: true, presences: true } },
    },
  });

  if (!room) return null;

  // Strip sensitive fields
  const { latitude, longitude, password, ...safeRoom } = room;

  return {
    ...safeRoom,
    distance: 0,
    formattedDistance: "Nearby",
    userCount: safeRoom._count.presences + Math.floor(safeRoom._count.messages / 3) + 1,
  };
}

/**
 * Create a new anonymous chat room
 */
export async function createRoomAction(data: {
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  isPrivate?: boolean;
  password?: string;
}): Promise<{ success: boolean; room?: RoomWithDistance; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please refresh the page to login." };
    }

    const rateCheck = roomCreationLimiter.check(session.userId);
    if (!rateCheck.success) {
      return { success: false, error: "You can only create 3 rooms per hour. Please try again later." };
    }

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    const geohash = LocationService.encodeGeohash(data.latitude, data.longitude);

    const newRoom = await prisma.room.create({
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        category: data.category || "general",
        latitude: data.latitude,
        longitude: data.longitude,
        geohash,
        radiusMeters: data.radiusMeters || 1000,
        isPrivate: !!data.isPrivate,
        password: data.password && data.isPrivate ? hashPassword(data.password) : null,
      },
      include: {
        _count: { select: { messages: true, presences: true } },
      },
    });

    const { latitude, longitude, password, ...safeRoom } = newRoom;

    const formattedRoom: RoomWithDistance = {
      ...safeRoom,
      distance: 0,
      formattedDistance: "0m",
      userCount: 1,
    };

    // Notify discovery listeners
    await RealtimeService.broadcast("all", "room:update", formattedRoom);

    return { success: true, room: formattedRoom };
  } catch (error) {
    console.error("Failed to create room:", error);
    return { success: false, error: "Failed to create room. Please check values." };
  }
}

/**
 * Join a private room by verifying its password and setting a secure access cookie
 */
export async function joinPrivateRoomAction(roomId: string, passwordAttempt: string): Promise<{ success: boolean; error?: string }> {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { isPrivate: true, password: true }
    });

    if (!room) return { success: false, error: "Room not found." };
    if (!room.isPrivate) return { success: true }; // No password needed

    if (!room.password || !verifyPassword(passwordAttempt, room.password)) {
      return { success: false, error: "Incorrect password." };
    }

    // Set a secure HTTP-only cookie granting access to this specific room
    const cookieStore = await cookies();
    cookieStore.set(`room_access_${roomId}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours access
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to join private room:", error);
    return { success: false, error: "Authentication failed." };
  }
}
