import { GeoCoordinates } from "@/types/location";

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export class LocationService {
  /**
   * Calculates the Haversine distance between two coordinates in meters
   */
  static getDistanceInMeters(coord1: GeoCoordinates, coord2: GeoCoordinates): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Formats distance into human readable string (e.g., "150m" or "2.4km")
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Generates a geohash string for a coordinate
   */
  static encodeGeohash(latitude: number, longitude: number, precision: number = 6): string {
    let idx = 0;
    let bit = 0;
    let evenBit = true;
    let geohash = "";

    let latMin = -90,
      latMax = 90;
    let lonMin = -180,
      lonMax = 180;

    while (geohash.length < precision) {
      if (evenBit) {
        // Bisect longitude
        const lonMid = (lonMin + lonMax) / 2;
        if (longitude >= lonMid) {
          idx = idx * 2 + 1;
          lonMin = lonMid;
        } else {
          idx = idx * 2;
          lonMax = lonMid;
        }
      } else {
        // Bisect latitude
        const latMid = (latMin + latMax) / 2;
        if (latitude >= latMid) {
          idx = idx * 2 + 1;
          latMin = latMid;
        } else {
          idx = idx * 2;
          latMax = latMid;
        }
      }
      evenBit = !evenBit;

      if (++bit === 5) {
        geohash += BASE32.charAt(idx);
        bit = 0;
        idx = 0;
      }
    }

    return geohash;
  }

  /**
   * Generates neighboring geohash prefixes for broad sector searching
   */
  static getSectorGeohashPrefix(latitude: number, longitude: number): string {
    return this.encodeGeohash(latitude, longitude, 5); // ~4.9km x 4.9km sector
  }
}
