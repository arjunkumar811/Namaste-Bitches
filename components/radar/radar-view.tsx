"use client";

import React, { useState } from "react";
import { RoomWithDistance } from "@/types/location";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users, ArrowRight, ShieldCheck, Lock, X } from "lucide-react";
import Link from "next/link";

interface RadarViewProps {
  rooms: RoomWithDistance[];
  userLat: number;
  userLng: number;
}

export function RadarView({ rooms }: RadarViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomWithDistance | null>(null);

  const getRadarPosition = (room: RoomWithDistance, idx: number) => {
    const maxRadius = 40; // percentage
    const normalizedDist = Math.min(1, room.distance / 15000);
    const r = 12 + normalizedDist * (maxRadius - 12);
    const angle = ((idx * 137.5) % 360) * (Math.PI / 180);

    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);

    return { x, y };
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6 aspect-square max-h-[500px] flex items-center justify-center p-4">
      {/* Outer Grid Container */}
      <div className="relative w-full h-full rounded-full bg-[#111216] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-inner">
        {/* Concentric Rings */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.06] border-dashed" />
        <div className="absolute w-[55%] h-[55%] rounded-full border border-white/[0.06]" />
        <div className="absolute w-[30%] h-[30%] rounded-full border border-white/[0.06] border-dashed" />
        <div className="absolute w-[12%] h-[12%] rounded-full border border-emerald-500/30 bg-emerald-500/5" />

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-white/[0.04]" />
        <div className="absolute h-full w-[1px] bg-white/[0.04]" />

        {/* Center Beacon */}
        <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-black shadow-sm">
          <Radio className="w-3.5 h-3.5" />
        </div>

        {/* Room Dots */}
        {rooms.map((room, idx) => {
          const pos = getRadarPosition(room, idx);
          const isSelected = selectedRoom?.id === room.id;

          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full transition-transform cursor-pointer ${
                isSelected
                  ? "bg-white text-black scale-110 shadow-md ring-2 ring-white/50"
                  : "bg-[#181a20] text-emerald-400 border border-white/[0.1] hover:scale-105"
              }`}
            >
              <span className="text-xs font-semibold">
                {room.name.charAt(0).toUpperCase()}
              </span>
            </button>
          );
        })}

        {/* Labels */}
        <span className="absolute top-[10%] text-[10px] text-zinc-600 select-none">10km</span>
        <span className="absolute top-[22%] text-[10px] text-zinc-600 select-none">5km</span>
        <span className="absolute top-[35%] text-[10px] text-zinc-500 select-none">1km</span>
      </div>

      {/* Selected Room Detail Card */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 p-4 rounded-xl bg-[#111216] border border-white/[0.1] shadow-2xl z-30 space-y-3 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 text-[11px] font-medium">
                {selectedRoom.category}
              </span>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>{selectedRoom.name}</span>
                {selectedRoom.isPrivate && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                {selectedRoom.isOfficial && <ShieldCheck className="w-4 h-4 text-blue-400" />}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {selectedRoom.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
              <span className="flex items-center gap-1 text-zinc-300">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {selectedRoom.userCount || 1} online
              </span>
              <span className="text-zinc-400">{selectedRoom.formattedDistance}</span>
            </div>

            <Link href={`/room/${selectedRoom.id || selectedRoom.slug}`} className="block pt-1">
              <button className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95">
                <span>Join room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
