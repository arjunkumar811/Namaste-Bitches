"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Plus, Compass, Settings } from "lucide-react";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] h-screen bg-[var(--sidebar)] flex flex-col flex-shrink-0 border-r border-white/[0.04]">
      {/* Brand Header */}
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-black/20">
        <Link href="/" className="flex items-center gap-2 group select-none w-full">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            NamasteBitches
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <Link
          href="/"
          className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
            pathname === "/"
              ? "bg-white/[0.08] text-white"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[15px] font-medium">Discover</span>
        </Link>
        
        <div className="pt-4 pb-1">
          <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center justify-between">
            <span>Your Channels</span>
            <button className="hover:text-zinc-300 transition-colors" title="Create Room">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* We would list joined rooms here, for now it's static/empty representation */}
          <div className="px-2 py-1.5 text-xs text-zinc-500 italic">
            Join a room to see it here
          </div>
        </div>
      </nav>

      {/* User Settings Area */}
      <div className="h-14 bg-[#232428] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <IdentityBadge />
        </div>
        <button className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
