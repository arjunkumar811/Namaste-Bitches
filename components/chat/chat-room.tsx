"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { RoomWithDistance } from "@/types/location";
import { getRoomMessagesAction } from "@/actions/chat.actions";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { ShareModal } from "@/components/chat/share-modal";
import { useRealtime } from "@/hooks/use-realtime";
import { Users, Radio, Share2, Shield, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatRoomProps {
  room: RoomWithDistance;
}

export function ChatRoom({ room }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Load initial messages
  const loadMessages = async () => {
    setIsLoading(true);
    const res = await getRoomMessagesAction(room.id);
    if (res.success && res.messages) {
      setMessages(res.messages);
    }
    setIsLoading(false);
    setTimeout(() => scrollToBottom(false), 100);
  };

  useEffect(() => {
    loadMessages();
  }, [room.id]);

  // Realtime subscription
  useRealtime(`room:${room.id}`, (data, ev) => {
    if (ev.event === "message:new") {
      const newMsg = data as ChatMessage;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom(true), 50);
    } else if (ev.event === "message:reaction") {
      const updatedMsg = data as ChatMessage;
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
    } else if (ev.event === "message:delete") {
      const { messageId } = data as { messageId: string };
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: "[Message Deleted]" } : m))
      );
    } else if (ev.event === "typing:start") {
      const { username } = data as { username: string };
      setTypingUsers((prev) => (prev.includes(username) ? prev : [...prev, username]));
    } else if (ev.event === "typing:stop") {
      const { username } = data as { username: string };
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    }
  });

  const handleShare = () => {
    setIsShareOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto rounded-3xl bg-black/40 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden my-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#111216]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white tracking-tight">{room.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] font-medium text-zinc-300">
                {room.category}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Users className="w-3.5 h-3.5" />
                {room.userCount || 1} online
              </span>
              <span>•</span>
              <span className="text-zinc-400">
                {room.formattedDistance}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IdentityBadge />
          
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Share room"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500 text-xs">
            <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center my-12 p-8 rounded-2xl bg-[#111216] border border-white/[0.08] max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-white">No messages yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You are the first person in <span className="text-zinc-200 font-medium">{room.name}</span>. Say hello to start the conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onReactionUpdate={loadMessages}
                onDeleteUpdate={loadMessages}
              />
            ))}
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Section */}
      <div className="p-4 border-t border-white/[0.08] bg-[#111216]">
        <TypingIndicator typingUsers={typingUsers} />
        <ChatInput roomId={room.id} onMessageSent={(newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(true), 50);
        }} />
        <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-zinc-500">
          <span>Messages disappear when timers expire or when rooms empty.</span>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        roomName={room.name}
        roomId={room.id}
        geohash={room.geohash}
      />
    </div>
  );
}
