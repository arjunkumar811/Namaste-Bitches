"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
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
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { ShinyBadge } from "@/components/ui/shiny-badge";

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
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />
      
      <div className="relative z-10">
        <Navbar onOpenCreateModal={() => setIsCreateOpen(true)} />


        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 pt-32 pb-20 max-w-5xl mx-auto w-full text-center flex flex-col items-center justify-center min-h-[70vh]">
          <AnimatedGrid />
          
          <div className="relative z-10 flex flex-col items-center">
            <ShinyBadge icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />} className="mb-8">
              Introducing NamasteBitches 2.0
            </ShinyBadge>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 max-w-3xl mx-auto leading-[1.1] pb-2"
            >
              Chat anonymously with people around you.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mt-6 leading-relaxed"
            >
              Discover local chat rooms based on approximate distance. No sign-up required, no phone numbers, and no message history stored.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Button
                onClick={() => setIsCreateOpen(true)}
                size="lg"
                className="w-full sm:w-auto relative overflow-hidden rounded-full bg-white text-black hover:bg-zinc-200 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all duration-300 font-semibold px-8 h-12 text-sm cursor-pointer hover:scale-105 active:scale-95 group"
              >
                <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] group-hover:bg-[position:-200%_0,0_0] group-hover:duration-[1000ms]" />
                <span className="relative z-10 flex items-center justify-center">
                  Create a room <Sparkles className="ml-2 w-4 h-4" />
                </span>
              </Button>
              <a href="#rooms" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-6 py-3">
                Explore nearby rooms
              </a>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full pb-16">
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
                suppressHydrationWarning
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
              suppressHydrationWarning
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
                suppressHydrationWarning
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
                suppressHydrationWarning
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
              suppressHydrationWarning
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
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">NamasteBitches</span>
            <span>— Local anonymous chat</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>No sign-up required</span>
            <span>•</span>
            <span>No chat history saved</span>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
