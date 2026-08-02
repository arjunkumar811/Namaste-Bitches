"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Plus } from "lucide-react";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { Button } from "@/components/ui/button";
import { motion, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center pt-6 px-4 pointer-events-none transition-all duration-300">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-4 h-14 px-4 sm:px-6 w-full max-w-5xl rounded-full transition-all duration-500",
          isScrolled 
            ? "bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "bg-[#0a0a0c]/40 backdrop-blur-xl border border-white/[0.05] shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400/50 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <Radio className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-white/90 group-hover:text-white transition-colors drop-shadow-sm hidden sm:inline-block">
            namaste-chat
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div>
            <IdentityBadge />
          </div>

          {onOpenCreateModal && (
            <Button
              onClick={onOpenCreateModal}
              size="sm"
              className="relative overflow-hidden rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-xs px-4 h-9 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] group-hover:bg-[position:-200%_0,0_0] group-hover:duration-[1000ms]" />
              <span className="relative z-10 flex items-center">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create room</span>
              </span>
            </Button>
          )}
        </div>
      </motion.div>
    </header>
  );
}
