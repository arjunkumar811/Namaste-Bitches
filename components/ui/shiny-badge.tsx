"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShinyBadgeProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function ShinyBadge({ children, className, icon }: ShinyBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer select-none",
        className
      )}
    >
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:-200%_0,0_0] hover:duration-[1500ms]" />
      
      {icon && (
        <span className="relative z-10 flex shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
}
