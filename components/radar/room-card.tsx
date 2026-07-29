"use client";

import React, { useRef, useState } from "react";
import { RoomWithDistance } from "@/types/location";
import { Users, MapPin, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomCardProps {
  room: RoomWithDistance;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: "bg-white/[0.06]", text: "text-zinc-300" },
  campus: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  nightlife: { bg: "bg-purple-500/10", text: "text-purple-400" },
  tech: { bg: "bg-blue-500/10", text: "text-blue-400" },
  gaming: { bg: "bg-red-500/10", text: "text-red-400" },
  chill: { bg: "bg-amber-500/10", text: "text-amber-400" },
};

export function RoomCard({ room, index = 0 }: RoomCardProps) {
  const catStyle = CATEGORY_COLORS[room.category] || CATEGORY_COLORS.general;
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative flex flex-col justify-between h-full p-5 overflow-hidden bg-[#111216]/80 backdrop-blur-md border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(300px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 40%)`
            ),
          }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase ${catStyle.bg} ${catStyle.text}`}>
              {room.category}
            </span>
            
            <div className="flex items-center gap-2">
              {room.isPrivate && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-medium" title="Password Protected">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-zinc-400 text-xs font-medium bg-black/40 px-2 py-1 rounded-md border border-white/[0.05]">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{room.formattedDistance}</span>
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span>{room.name}</span>
            {room.isOfficial && (
              <span title="Verified Official Room">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              </span>
            )}
          </h3>

          <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {room.description || "No description provided."}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300 font-medium bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.05]">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {room.userCount || 1} online
            </span>
          </div>

          <Link href={`/room/${room.id || room.slug}`}>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs bg-white text-black hover:bg-zinc-200 hover:text-black group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
              <span>Join room</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
