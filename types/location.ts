import { Room } from "@prisma/client";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type RoomWithDistance = Omit<Room, "latitude" | "longitude" | "password"> & {
  distance: number; // in meters
  formattedDistance: string; // e.g. "250m" or "1.2km"
  userCount?: number;
};

export interface SectorData {
  geohash: string;
  center: GeoCoordinates;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  roomCount: number;
  activeUsers: number;
}

export interface RoomFilterState {
  radius: number; // in meters; 0 means global
  category: string; // "all", "general", "campus", "nightlife", "tech", "gaming", "chill"
  search: string;
  sortBy: "distance" | "active" | "newest";
}
