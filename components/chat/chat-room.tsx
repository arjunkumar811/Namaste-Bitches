"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { RoomWithDistance } from "@/types/location";
import { getRoomMessagesAction } from "@/actions/chat.actions";
import { joinPrivateRoomAction } from "@/actions/room.actions";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { ShareModal } from "@/components/chat/share-modal";
import { useRealtime } from "@/hooks/use-realtime";
import { Users, Radio, Share2, Shield, Sparkles, MapPin, Lock, ArrowRight } from "lucide-react";
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
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Load initial messages
  const loadMessages = async () => {
    setIsLoading(true);
    const res = await getRoomMessagesAction(room.id);
    if (res.isUnauthorized) {
      setIsUnauthorized(true);
      setIsLoading(false);
      return;
    }
    if (res.success && res.messages) {
      setMessages(res.messages);
      setHasMore(res.messages.length === 50);
    }
    setIsLoading(false);
    setTimeout(() => scrollToBottom(false), 100);
  };

  const loadOlderMessages = async () => {
    if (!messages.length || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const oldestId = messages[0].id;
    const res = await getRoomMessagesAction(room.id, oldestId);
    if (res.success && res.messages) {
      setMessages((prev) => [...res.messages!, ...prev]);
      setHasMore(res.messages.length === 50);
    }
    setIsLoadingMore(false);
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");
    const res = await joinPrivateRoomAction(room.id, passwordInput);
    if (res.success) {
      setIsUnauthorized(false);
      loadMessages();
    } else {
      setJoinError(res.error || "Incorrect password");
    }
    setIsJoining(false);
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
      <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">
        {isUnauthorized ? (
          <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Private Room</h2>
            <p className="text-sm text-zinc-400 text-center mb-8 leading-relaxed">
              This room is password protected. Please enter the password to join the conversation.
            </p>
            <form onSubmit={handleJoinPrivate} className="w-full space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  disabled={isJoining}
                />
                {joinError && <p className="text-xs text-red-400 mt-1">{joinError}</p>}
              </div>
              <button
                type="submit"
                disabled={isJoining || !passwordInput}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isJoining ? "Joining..." : "Join Room"}</span>
                {!isJoining && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        ) : isLoading ? (
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
          <div className="space-y-2">
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={loadOlderMessages}
                  disabled={isLoadingMore}
                  className="px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-colors"
                >
                  {isLoadingMore ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}
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
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Section */}
      {!isUnauthorized && (
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
      )}

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
