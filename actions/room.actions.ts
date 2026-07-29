"use server";

import { prisma } from "@/lib/prisma";
import { LocationService } from "@/services/location.service";
import { RoomWithDistance, RoomFilterState } from "@/types/location";
import { RealtimeService } from "@/services/realtime.service";

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

      return {
        ...room,
        distance,
        formattedDistance: LocationService.formatDistance(distance),
        userCount: room._count.presences + Math.floor(room._count.messages / 3) + 1, // Simulated active feel
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

  return {
    ...room,
    distance: 0,
    formattedDistance: "Nearby",
    userCount: room._count.presences + Math.floor(room._count.messages / 3) + 1,
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
        password: data.password || null,
      },
      include: {
        _count: { select: { messages: true, presences: true } },
      },
    });

    const formattedRoom: RoomWithDistance = {
      ...newRoom,
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
