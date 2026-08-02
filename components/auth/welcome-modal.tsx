"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, EyeOff, Radio, MapPin, ArrowRight } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { useAuth } from "@/components/providers/auth-provider";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"promise" | "gps">("promise");
  const { requestLocation } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const seen = localStorage.getItem("nb_onboarding_seen_v2");
    if (!seen && user) {
      setIsOpen(true);
    }
  }, [user]);

  const handleGrantGps = () => {
    requestLocation();
    localStorage.setItem("nb_onboarding_seen_v2", "true");
    setIsOpen(false);
  };

  const handleSkipGps = () => {
    localStorage.setItem("nb_onboarding_seen_v2", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-[#111216] border border-white/[0.1] shadow-2xl p-6 sm:p-7 text-left"
      >
        <AnimatePresence mode="wait">
          {step === "promise" ? (
            <motion.div
              key="promise"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>namaste-chat</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Welcome. Let&apos;s keep this simple.
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  We built a location-based chat app that doesn&apos;t ask for your personal information.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <Shield className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-white">No sign-up required</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      No emails, phone numbers, or passwords. You were assigned <span className="text-zinc-200 font-medium">{user?.avatar} {user?.username}</span> for this session.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <EyeOff className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-white">Nothing is saved</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      Messages disappear when timers expire or when rooms empty. We don&apos;t store your chat logs.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep("gps")}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="gps"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <MapPin className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Enable location
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  We need your browser location to calculate distance to chat rooms around you.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                <h4 className="text-xs font-medium text-white">How we handle location</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your coordinates are processed in temporary browser memory to calculate distance. We never store your GPS location on our servers.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleGrantGps}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Allow location access</span>
                </button>

                <button
                  onClick={handleSkipGps}
                  className="w-full py-2 rounded-lg bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
                >
                  Skip for now (use default San Francisco hub)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
