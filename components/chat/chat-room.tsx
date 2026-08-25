"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { RoomWithDistance } from "@/types/location";
import { getRoomMessagesAction } from "@/actions/chat.actions";
import { joinPrivateRoomAction, deleteRoomAction } from "@/actions/room.actions";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { ShareModal } from "@/components/chat/share-modal";
import { useRealtime } from "@/hooks/use-realtime";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Users, Radio, Share2, Shield, Sparkles, MapPin, Lock, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Typography, IconButton, Paper, Button, TextField, CircularProgress, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#111216',
    },
    primary: {
      main: '#10b981', // Emerald 500
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
});

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

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

    if (typeof window !== "undefined" && "Notification" in window) {
      const pref = localStorage.getItem(`room_notifications_${room.id}`);
      if (!pref && Notification.permission !== "denied") {
        setShowNotificationPrompt(true);
      }
    }
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

      const roomNotificationsEnabled = localStorage.getItem(`room_notifications_${room.id}`) === "true";

      if (
        roomNotificationsEnabled &&
        newMsg.userId !== user?.userId &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(`New message in ${room.name}`, {
          body: `${newMsg.user.username}: ${newMsg.content}`
        });
      }
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
    <ThemeProvider theme={darkTheme}>
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          borderRadius: 0, 
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        <AppBar position="static" color="transparent" elevation={1} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => router.push('/')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {room.name}
              </Typography>
              <Chip label={room.category} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {room.userCount || 1} online • {room.formattedDistance}
              </Typography>
              
              <IdentityBadge />

              {user?.isAdmin && (
                <IconButton 
                  color="error" 
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this room?")) return;
                    setIsDeleting(true);
                    const res = await deleteRoomAction(room.id);
                    if (res.success) router.push("/");
                    else { setIsDeleting(false); alert(res.error); }
                  }}
                  disabled={isDeleting}
                >
                  <DeleteIcon />
                </IconButton>
              )}

              <IconButton color="inherit" onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, sm: 3 }, position: 'relative' }}>
          {isUnauthorized ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.light', width: 64, height: 64, mb: 3 }}>
                <LockIcon fontSize="large" sx={{ color: 'warning.dark' }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>Private Room</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                This room is password protected. Please enter the password to join.
              </Typography>
              <form onSubmit={handleJoinPrivate} style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  variant="outlined"
                  disabled={isJoining}
                  error={!!joinError}
                  helperText={joinError}
                  sx={{ mb: 2 }}
                />
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  disabled={isJoining || !passwordInput}
                  size="large"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </Button>
              </form>
            </Box>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={30} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>No messages yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  You are the first person in {room.name}. Say hello!
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Button size="small" variant="outlined" onClick={loadOlderMessages} disabled={isLoadingMore}>
                    {isLoadingMore ? "Loading..." : "Load older messages"}
                  </Button>
                </Box>
              )}
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} onReactionUpdate={loadMessages} onDeleteUpdate={loadMessages} />
                ))}
              </AnimatePresence>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {!isUnauthorized && (
          <Paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <TypingIndicator typingUsers={typingUsers} />
            <ChatInput roomId={room.id} onMessageSent={(newMsg) => {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => scrollToBottom(true), 50);
            }} />
          </Paper>
        )}

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          roomName={room.name}
          roomId={room.id}
          geohash={room.geohash}
        />

        <Dialog
          open={showNotificationPrompt}
          onClose={() => {
            localStorage.setItem(`room_notifications_${room.id}`, "false");
            setShowNotificationPrompt(false);
          }}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon color="primary" />
            Enable Notifications?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary' }}>
              Would you like to be notified when someone sends a new message in <strong>{room.name}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              color="inherit"
              onClick={() => {
                localStorage.setItem(`room_notifications_${room.id}`, "false");
                setShowNotificationPrompt(false);
              }}
            >
              No, thanks
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                if (Notification.permission === "default") {
                  Notification.requestPermission().then((perm) => {
                    if (perm === "granted") {
                      localStorage.setItem(`room_notifications_${room.id}`, "true");
                    } else {
                      localStorage.setItem(`room_notifications_${room.id}`, "false");
                    }
                    setShowNotificationPrompt(false);
                  });
                } else if (Notification.permission === "granted") {
                  localStorage.setItem(`room_notifications_${room.id}`, "true");
                  setShowNotificationPrompt(false);
                } else {
                  localStorage.setItem(`room_notifications_${room.id}`, "false");
                  setShowNotificationPrompt(false);
                }
              }}
            >
              Enable
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </ThemeProvider>
  );
}
