"use client";

import React, { useState, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { motion } from "framer-motion";
import { Flame, Smile, Trash2 } from "lucide-react";
import { toggleReactionAction, deleteMessageAction } from "@/actions/chat.actions";
import { useAuth } from "@/components/providers/auth-provider";

interface MessageBubbleProps {
  message: ChatMessage;
}

const QUICK_EMOJIS = ["🔥", "❤️", "🚀", "✨", "👀", "😂"];

export const MessageBubble = React.memo(function MessageBubble({ message }: MessageBubbleProps) {
  const { user: currentAuthUser } = useAuth();
  const [showEmojis, setShowEmojis] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const isSenderAdmin = message.user.isAdmin || message.user.username === "Admin";
  const canDelete = message.isOwn || currentAuthUser?.isAdmin;

  useEffect(() => {
    if (!message.expiresAt) return;
    const expires = new Date(message.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [message.expiresAt]);

  const handleReaction = async (emoji: string) => {
    setShowEmojis(false);
    await toggleReactionAction(message.id, emoji);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this message?")) return;
    await deleteMessageAction(message.id);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (timeLeft === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex gap-3 my-3 max-w-[85%] sm:max-w-[75%] transition-all duration-300 hover:scale-[1.01] hover:brightness-110 ${
        message.isOwn ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm border select-none ${
          isSenderAdmin
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-white/[0.04] border-white/[0.08]"
        }`}
      >
        <span>{message.user.avatar}</span>
      </div>

      {/* Message Content Container */}
      <div
        className={`flex flex-col ${
          message.isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Username & Time Header */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold tracking-tight ${isSenderAdmin ? "text-emerald-400" : "text-zinc-300"}`}
            >
              {message.user.username}
            </span>
            {isSenderAdmin && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-bold uppercase tracking-wider select-none">
                Admin
              </span>
            )}
          </div>
          <span className="text-zinc-500 text-[10px]">{formattedTime}</span>

          {/* Burn Timer Pill */}
          {timeLeft !== null && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
              <Flame className="w-3 h-3" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Bubble Box */}
        <div
          className={`relative px-3.5 py-2 rounded-xl text-xs leading-relaxed transition-all ${
            message.isOwn
              ? "bg-white/[0.1] border border-white/[0.15] text-white rounded-tr-none"
              : isSenderAdmin
              ? "bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-100 rounded-tl-none"
              : "bg-[#111216] border border-white/[0.08] text-zinc-200 rounded-tl-none"
          } ${message.isDeleted ? "italic text-zinc-500 border-dashed" : ""}`}
        >
          {message.content}

          {/* Hover Action Menu */}
          {!message.isDeleted && (
            <div
              className={`absolute -top-3 ${
                message.isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
              } hidden group-hover:flex items-center gap-1 z-10`}
            >
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-1 rounded-md bg-[#181a20] border border-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Add reaction"
              >
                <Smile className="w-3 h-3" />
              </button>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md bg-[#181a20] border border-white/[0.1] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Quick Emojis Popup */}
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`absolute -top-9 ${
                message.isOwn ? "right-0" : "left-0"
              } flex items-center gap-1 p-1 rounded-lg bg-[#111216] border border-white/[0.1] shadow-xl z-20`}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/[0.06] text-sm transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Reactions List */}
        {message.reactionsList.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
            {message.reactionsList.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] transition-colors border cursor-pointer ${
                  reaction.hasReacted
                    ? "bg-white/[0.1] border-white/[0.2] text-white font-medium"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});
