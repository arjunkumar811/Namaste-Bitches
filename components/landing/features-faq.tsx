"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Clock, ChevronDown } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "No sign-up required",
    desc: "Start chatting immediately. No accounts, no emails, no phone numbers, and no passwords required.",
  },
  {
    icon: MapPin,
    title: "Approximate distance only",
    desc: "We calculate distance to nearby rooms in your browser. We never store or track your GPS coordinates on our servers.",
  },
  {
    icon: Clock,
    title: "Ephemeral messages",
    desc: "Messages automatically disappear when timers expire or when rooms empty. Chat logs aren't saved to permanent storage.",
  },
];

const FAQS = [
  {
    q: "How does distance calculation work without tracking me?",
    a: "When you allow location access, your coordinates are processed in your browser memory to calculate distance to nearby rooms. We don't save your location history or track your movement.",
  },
  {
    q: "What happens when I close my browser?",
    a: "Because your identity is temporary and tied only to your active browser session, closing your tab disconnects you immediately. You can generate a fresh identity anytime.",
  },
  {
    q: "Can other people see my exact location?",
    a: "No. Other users only see an approximate distance (e.g., '500m away') and your assigned random animal name (e.g., 'Cosmic Tiger 🐱').",
  },
  {
    q: "How do password-protected rooms work?",
    a: "When you create a private room with a password, users must enter the correct password before the server sends them any messages or participant lists.",
  },
];

export function FeaturesAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-16 space-y-16 max-w-6xl mx-auto px-4 sm:px-6 w-full border-t border-white/[0.08] mt-16">
      {/* Features Grid */}
      <div className="space-y-8">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            How it works
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">
            A simple, private way to connect with people around you without leaving a permanent footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#111216] border border-white/[0.08] space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl space-y-6 pt-4">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Everything you need to know about privacy and location.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#111216] border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-medium text-zinc-200 hover:text-white flex items-center justify-between gap-4 text-xs sm:text-sm cursor-pointer"
                  suppressHydrationWarning
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-zinc-200" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
