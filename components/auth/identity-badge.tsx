"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { RefreshCw, User, Shield, Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function IdentityBadge({ showReroll = true }: { showReroll?: boolean }) {
  const { user, isLoading, rerollIdentity, activateAdmin } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReroll = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    try {
      await rerollIdentity();
      toast.info("Identity rerolled");
    } finally {
      setTimeout(() => setIsSpinning(false), 300);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAdminError("");
    const res = await activateAdmin(passkey);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Admin mode activated!");
      setIsAdminModalOpen(false);
      setPasskey("");
    } else {
      setAdminError(res.error || "Invalid passkey");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] animate-pulse">
        <div className="w-4 h-4 rounded-full bg-white/10" />
        <div className="w-20 h-3 rounded bg-white/10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
        <User className="w-3.5 h-3.5" />
        <span>Not connected</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111216] border border-white/[0.08] hover:border-white/[0.16] transition-all text-xs shadow-sm">
        <span className="text-sm leading-none select-none">{user.avatar}</span>

        <div className="flex items-center gap-1.5">
          <span className="font-medium text-zinc-200 tracking-tight select-none">
            {user.username}
          </span>
          {user.isAdmin ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold tracking-wide uppercase select-none">
              Admin
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
          )}
        </div>

        <div className="flex items-center gap-0.5 ml-1 border-l border-white/[0.08] pl-1">
          {!user.isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title="Admin access"
              className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}

          {showReroll && (
            <button
              onClick={handleReroll}
              title={user.isAdmin ? "Exit Admin mode & reroll" : "Generate new random identity"}
              className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin text-zinc-200" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="max-w-xs bg-[#111216] border border-white/[0.1] p-5 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-white/[0.08]">
            <DialogTitle className="flex items-center gap-2 text-white font-semibold text-xs text-left">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin authentication</span>
            </DialogTitle>
          </DialogHeader>

          {adminError && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mt-3">
              {adminError}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-3 mt-3">
            <div>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter admin passkey..."
                autoFocus
                required
                className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdminModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
              >
                {isSubmitting ? "Verifying..." : "Authenticate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
