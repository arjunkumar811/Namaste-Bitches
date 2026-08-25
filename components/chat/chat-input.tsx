"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Flame, Smile, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageAction, broadcastTypingAction } from "@/actions/chat.actions";
import { ChatMessage } from "@/types/chat";

interface ChatInputProps {
  roomId: string;
  onMessageSent?: (msg: ChatMessage) => void;
}

const BURN_OPTIONS = [
  { label: "Permanent", seconds: undefined, icon: null },
  { label: "Burn in 60s", seconds: 60, icon: "🔥" },
  { label: "Burn in 5m", seconds: 300, icon: "⚡" },
];

const EMOJI_GRID = [
  "😀", "😂", "🚀", "🔥", "❤️", "✨", "👀", "🙌", "💀", "🎉",
  "💯", "🙏", "😭", "😍", "🥺", "😎", "🤩", "🤔", "🤫", "🍿",
];

export function ChatInput({ roomId, onMessageSent }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [burnIdx, setBurnIdx] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setContent(val);
      setError(null);
    }

    // Broadcast typing indicator
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      broadcastTypingAction(roomId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      broadcastTypingAction(roomId, false);
    }, 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      broadcastTypingAction(roomId, false);
    }

    setIsSubmitting(true);
    setError(null);
    const selectedBurn = BURN_OPTIONS[burnIdx].seconds;

    const res = await sendMessageAction({
      roomId,
      content: content.trim(),
      expiresInSeconds: selectedBurn,
    });

    setIsSubmitting(false);

    if (res.success && res.message) {
      setContent("");
      setShowEmojis(false);
      onMessageSent?.(res.message);
      inputRef.current?.focus();
    } else {
      setError(res.error || "Failed to send");
    }
  };

  const toggleBurn = () => {
    setBurnIdx((prev) => (prev + 1) % BURN_OPTIONS.length);
  };

  const addEmoji = (emoji: string) => {
    if (content.length + emoji.length <= 500) {
      setContent((prev) => prev + emoji);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full">
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-10 left-0 right-0 flex items-center justify-between px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono backdrop-blur-md"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full mb-3 left-0 p-3 rounded-2xl bg-zinc-900/95 border border-white/20 shadow-2xl backdrop-blur-xl z-30 w-72 max-h-60 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10 text-xs text-zinc-400 font-mono">
              <span>Quick Emojis</span>
              <button onClick={() => setShowEmojis(false)} className="hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_GRID.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 hover:scale-125 transition-all text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl focus-within:border-white/30 transition-all"
      >
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`p-2 rounded-xl transition-all ${
            showEmojis ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Emoji Picker"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Burn Toggle Button */}
        <button
          type="button"
          onClick={toggleBurn}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
            burnIdx > 0
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          }`}
          title="Toggle Ephemeral Burning Message"
        >
          <Flame className={`w-3.5 h-3.5 ${burnIdx > 0 ? "animate-bounce text-amber-400" : ""}`} />
          <span className="hidden sm:inline">{BURN_OPTIONS[burnIdx].label}</span>
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={handleContentChange}
          placeholder="namaste-chat anonymously to nearby people..."
          disabled={isSubmitting}
          className="flex-1 bg-transparent px-2 py-1.5 text-base text-white placeholder-zinc-500 focus:outline-none font-sans"
        />

        {/* Char Counter */}
        <span className={`text-[10px] font-mono pr-1 hidden md:inline ${
          content.length > 450 ? "text-amber-400 font-bold" : "text-zinc-600"
        }`}>
          {content.length}/500
        </span>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
}
