"use client";

import React from "react";
import { RoomFilterState } from "@/types/location";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";

interface RoomFiltersProps {
  filters: RoomFilterState;
  onFilterChange: (newFilters: Partial<RoomFilterState>) => void;
}

const CATEGORIES = [
  { id: "all", label: "All rooms", icon: "🌐" },
  { id: "general", label: "General", icon: "💬" },
  { id: "campus", label: "Campus Hub", icon: "🎓" },
  { id: "nightlife", label: "Nightlife", icon: "🍸" },
  { id: "tech", label: "Tech & Dev", icon: "💻" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "chill", label: "Chill Lounge", icon: "☕" },
];

const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
  { label: "Global", value: 0 },
];

export function RoomFilters({ filters, onFilterChange }: RoomFiltersProps) {
  return (
    <div className="space-y-4 my-6 p-4 rounded-2xl bg-[#111216] border border-white/[0.08]">
      {/* Top Search and Sort Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search nearby rooms..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
            suppressHydrationWarning
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-white cursor-pointer"
              suppressHydrationWarning
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Range & Sort Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end text-xs">
          {/* Range Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>Range:</span>
            <select
              value={filters.radius}
              onChange={(e) => onFilterChange({ radius: Number(e.target.value) })}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
              suppressHydrationWarning
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111216] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as "distance" | "active" | "newest" })}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
              suppressHydrationWarning
            >
              <option value="distance" className="bg-[#111216] text-white">Closest</option>
              <option value="active" className="bg-[#111216] text-white">Most active</option>
              <option value="newest" className="bg-[#111216] text-white">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors border cursor-pointer ${
                isSelected
                  ? "bg-white/[0.1] border-white/[0.2] text-white font-medium"
                  : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              suppressHydrationWarning
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
