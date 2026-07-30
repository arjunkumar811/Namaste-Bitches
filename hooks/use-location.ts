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

    // Request current position with robust options.
    // Disabling enableHighAccuracy allows mobile browsers to use cellular/wifi 
    // triangulation which returns instantly instead of timing out waiting for GPS satellites.
    const geoOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000, // Cache for 5 mins to speed up reload
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);

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
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0, // Force a fresh read on manual retry
      }
    );
  };

  return { coordinates, error, isLoading, isUsingFallback, requestLocation };
}
