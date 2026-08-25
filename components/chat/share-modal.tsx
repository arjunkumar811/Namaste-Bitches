"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomId: string;
  geohash: string;
}

export function ShareModal({ isOpen, onClose, roomName, roomId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}` : `/room/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#111216] border border-white/[0.1] shadow-2xl p-5 text-left space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-white text-sm">Share room</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-medium text-white text-sm truncate">{roomName}</h4>
          <p className="text-xs text-zinc-400">Anyone with this link can join without signing in.</p>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/50 border border-white/[0.08]">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-zinc-300 px-2 py-1 flex-1 focus:outline-none truncate font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
