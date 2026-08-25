"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Lock, AlertCircle, X, Globe } from "lucide-react";
import { createRoomAction } from "@/actions/room.actions";
import { RoomWithDistance } from "@/types/location";
import { useRouter } from "next/navigation";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number;
  userLng: number;
  onRoomCreated?: (room: RoomWithDistance) => void;
}

const CATEGORIES = [
  { id: "general", label: "General", icon: "💬" },
  { id: "campus", label: "Campus Hub", icon: "🎓" },
  { id: "nightlife", label: "Nightlife", icon: "🍸" },
  { id: "tech", label: "Tech & Dev", icon: "💻" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "chill", label: "Chill Lounge", icon: "☕" },
];

export function CreateRoomModal({ isOpen, onClose, userLat, userLng, onRoomCreated }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [radiusMeters, setRadiusMeters] = useState(1000);
  const [isGlobal, setIsGlobal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Room name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await createRoomAction({
      name: name.trim(),
      description: description.trim(),
      category,
      latitude: userLat,
      longitude: userLng,
      radiusMeters: isGlobal ? 0 : radiusMeters,
      isPrivate,
      password: isPrivate ? password : undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.room) {
      onRoomCreated?.(res.room);
      onClose();
      router.push(`/room/${res.room.slug || res.room.id}`);
    } else {
      setError(res.error || "Failed to create room.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md p-6 max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#111216] border border-white/[0.1] shadow-2xl text-left"
        >
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Create room</h3>
                <p className="text-xs text-zinc-400">Start a chat room for people near you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Room name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Downtown tech meetup"
                maxLength={40}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                      category === cat.id
                        ? "bg-white/[0.1] border-white/[0.2] text-white font-medium"
                        : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this room about?"
                maxLength={120}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Global Room (Accessible anywhere)</span>
                </span>
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <AnimatePresence>
                {!isGlobal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 pt-1">
                      <span className="text-zinc-300 font-medium">Radius</span>
                      <span className="text-zinc-400 font-mono">{radiusMeters}m</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="10000"
                      step="200"
                      value={radiusMeters}
                      onChange={(e) => setRadiusMeters(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-white/[0.08] rounded-lg h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1 mb-2">
                      <span>200m</span>
                      <span>5km</span>
                      <span>10km</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password protected</span>
                </span>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              {isPrivate && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set room password..."
                  required={isPrivate}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Creating..." : "Create room"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
