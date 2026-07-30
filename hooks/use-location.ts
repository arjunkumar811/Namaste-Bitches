"use client";

import { useState, useEffect } from "react";
import { GeoCoordinates } from "@/types/location";

// Default coordinates (San Francisco tech hub / downtown) as reliable fallback
const DEFAULT_COORDINATES: GeoCoordinates = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
};

export function useLocation() {
  const [coordinates, setCoordinates] = useState<GeoCoordinates>(DEFAULT_COORDINATES);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setCoordinates((prev) => {
        // Only update if moved significantly (diff > 0.0001 degrees ~ 11 meters)
        // This prevents the UI from refreshing every 2-3 seconds due to GPS jitter
        if (
          prev &&
          Math.abs(prev.latitude - position.coords.latitude) < 0.0001 &&
          Math.abs(prev.longitude - position.coords.longitude) < 0.0001
        ) {
          return prev;
        }
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      });
      setError(null);
      setIsUsingFallback(false);
      setIsLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation warning/error, using fallback:", err.message);
      setError(err.message);
      setIsUsingFallback(true);
      setIsLoading(false);
    };

    // Request current position ONLY ONCE to prevent constant GPS bouncing on mobile phones
    // which causes the nearby rooms list to shuffle/refresh every 2-3 seconds.
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });

    // Cleanup not needed since we aren't using watchPosition anymore
    return () => {};
  }, []);

  const requestLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
        setIsUsingFallback(false);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsUsingFallback(true);
        setIsLoading(false);
      }
    );
  };

  return { coordinates, error, isLoading, isUsingFallback, requestLocation };
}
