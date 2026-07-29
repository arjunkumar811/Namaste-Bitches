"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Plus } from "lucide-react";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 left-0 right-0 z-40 w-full flex justify-center px-4 pointer-events-none">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="pointer-events-auto flex items-center justify-between gap-4 h-14 px-4 sm:px-6 w-full max-w-4xl rounded-full bg-[#111216]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            NamasteBitches
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <IdentityBadge />
          </div>

          {onOpenCreateModal && (
            <Button
              onClick={onOpenCreateModal}
              size="sm"
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create room</span>
            </Button>
          )}
        </div>
      </motion.div>
    </header>
  );
}
