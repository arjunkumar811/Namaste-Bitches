"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "@/hooks/use-location";
import { getNearbyRooms } from "@/actions/room.actions";
import { RoomWithDistance, RoomFilterState } from "@/types/location";
import { RoomCard } from "@/components/radar/room-card";
import { RoomFilters } from "@/components/radar/room-filters";
import { RadarView } from "@/components/radar/radar-view";
import { CreateRoomModal } from "@/components/radar/create-room-modal";
import { FeaturesAndFaq } from "@/components/landing/features-faq";
import { Compass, Grid, Sparkles, MapPin, AlertTriangle, RefreshCw, Shield, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { coordinates, isUsingFallback, isLoading: isLocLoading, requestLocation } = useLocation();
  const [rooms, setRooms] = useState<RoomWithDistance[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<RoomFilterState>({
    radius: 10000,
    category: "all",
    search: "",
    sortBy: "distance",
  });

  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const res = await getNearbyRooms(coordinates.latitude, coordinates.longitude, filters);
      setRooms(res);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [coordinates.latitude, coordinates.longitude, filters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleFilterChange = (newFilters: Partial<RoomFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col relative overflow-hidden h-full">
      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-full">
        {/* Discord-style Header */}
        <header className="h-12 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-muted-foreground" />
            <h1 className="font-semibold text-[15px]">Discover Rooms</h1>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="h-7 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
          >
            Create room
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="max-w-[1200px] mx-auto w-full">
        <AnimatePresence>
          {isUsingFallback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-3.5 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Using default location (San Francisco hub). Allow browser location access to see rooms near you.
                </span>
              </div>
              <button
                onClick={requestLocation}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors font-medium shrink-0 ml-2 cursor-pointer"
              >
                Retry GPS
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Controls Bar */}
        <RoomFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Header Bar */}
        <div className="flex items-center justify-between my-6 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Nearby rooms</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-xs text-zinc-400">
                {rooms.length} found
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRooms}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors border border-white/[0.06] cursor-pointer"
              title="Refresh rooms"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? "animate-spin text-zinc-200" : ""}`} />
            </button>

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-[#111216] border border-white/[0.08]">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white/[0.1] text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("radar")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  viewMode === "radar"
                    ? "bg-white/[0.1] text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Display */}
        {isLoadingRooms || isLocLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-[#111216] border border-white/[0.06] animate-pulse p-5 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-16 h-4 rounded bg-white/10" />
                  <div className="w-12 h-4 rounded bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="w-2/3 h-5 rounded bg-white/10" />
                  <div className="w-full h-3 rounded bg-white/10" />
                </div>
                <div className="flex justify-between pt-3 border-t border-white/[0.04]">
                  <div className="w-20 h-3 rounded bg-white/10" />
                  <div className="w-16 h-7 rounded-lg bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-[#111216] border border-white/[0.08] max-w-md mx-auto my-6">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No rooms found nearby</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
              There are no active chat rooms within {filters.radius / 1000}km. Be the first to start a room in your area!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs transition-colors cursor-pointer"
            >
              Create the first room
            </button>
          </div>
        ) : viewMode === "radar" ? (
          <RadarView rooms={rooms} userLat={coordinates.latitude} userLng={coordinates.longitude} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, idx) => (
              <RoomCard key={room.id} room={room} index={idx} />
            ))}
          </div>
        )}

        <FeaturesAndFaq />
        </div>
      </main>

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userLat={coordinates.latitude}
        userLng={coordinates.longitude}
        onRoomCreated={(newRoom) => {
          setRooms((prev) => [newRoom, ...prev]);
        }}
      />
    </div>
  );
}
