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
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
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

    // Request current position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });

    // Watch position for movement
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 120000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
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
