"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { RoomWithDistance } from "@/types/location";
import { getRoomMessagesAction } from "@/actions/chat.actions";
import { joinPrivateRoomAction, deleteRoomAction } from "@/actions/room.actions";
import { subscribeToRoomAction, unsubscribeFromRoomAction } from "@/actions/push.actions";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { IdentityBadge } from "@/components/auth/identity-badge";
import { ShareModal } from "@/components/chat/share-modal";
import { useRealtime } from "@/hooks/use-realtime";
import { useAuth } from "@/components/providers/auth-provider";
import { urlBase64ToUint8Array, safeStorage } from "@/lib/utils";
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

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
  const [showDisablePrompt, setShowDisablePrompt] = useState(false);
  const [pushState, setPushState] = useState<"loading" | "unsupported" | "enabled" | "disabled" | "blocked">("loading");

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

    async function checkPush() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setPushState("blocked");
        return;
      }
      
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const sub = await reg.pushManager.getSubscription();
        const roomPref = safeStorage.getItem(`room_push_${room.id}`);
        
        if (sub && roomPref === "true") {
          setPushState("enabled");
        } else {
          setPushState("disabled");
        }
      } catch (e) {
        console.error("SW registration failed", e);
        setPushState("unsupported");
      }
    }
    
    checkPush();
    
    // Also trigger prompt if they haven't explicitly chosen before and not denied
    const pref = safeStorage.getItem(`room_push_${room.id}`);
    if (!pref && Notification.permission !== "denied" && "serviceWorker" in navigator) {
      setShowNotificationPrompt(true);
    }
  }, [room.id]);

  const enablePushNotifications = async () => {
    try {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setPushState("blocked");
          setShowNotificationPrompt(false);
          return;
        }
      } else if (Notification.permission === "denied") {
        setPushState("blocked");
        setShowNotificationPrompt(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          throw new Error("VAPID public key is missing");
        }
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      const subJSON = sub.toJSON();
      if (subJSON.endpoint && subJSON.keys) {
        const res = await subscribeToRoomAction(room.id, {
          endpoint: subJSON.endpoint,
          keys: {
            p256dh: subJSON.keys.p256dh,
            auth: subJSON.keys.auth
          }
        });
        if (!res.success) throw new Error(res.error || "Failed to save subscription on server");
      }
      
      safeStorage.setItem(`room_push_${room.id}`, "true");
      setPushState("enabled");
      setShowNotificationPrompt(false);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to enable notifications: ${e.message || "Unknown error"}`);
    }
  };

  const disablePushNotifications = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const subJSON = sub.toJSON();
        if (subJSON.endpoint) {
          await unsubscribeFromRoomAction(room.id, subJSON.endpoint);
        }
      }
      safeStorage.setItem(`room_push_${room.id}`, "false");
      setPushState("disabled");
      setShowDisablePrompt(false);
    } catch (e) {
      console.error(e);
    }
  };

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

              <IconButton 
                color="inherit" 
                onClick={() => {
                  if (pushState === "disabled") setShowNotificationPrompt(true);
                  else if (pushState === "enabled") setShowDisablePrompt(true);
                  else if (pushState === "blocked") alert("Notifications are blocked in your browser settings. Please unblock them to enable this feature.");
                }}
                disabled={pushState === "loading" || pushState === "unsupported"}
                title={
                  pushState === "enabled" ? "Notifications enabled" :
                  pushState === "disabled" ? "Enable notifications" :
                  pushState === "blocked" ? "Notifications blocked" : "Notifications unsupported"
                }
              >
                {pushState === "enabled" ? <NotificationsActiveIcon color="primary" /> : 
                 pushState === "disabled" ? <NotificationsIcon /> :
                 <NotificationsOffIcon color="disabled" />}
              </IconButton>

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
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {!isUnauthorized && (
          <Paper elevation={4} sx={{ p: 2, pb: 'calc(16px + env(safe-area-inset-bottom))', bgcolor: 'background.paper', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
            safeStorage.setItem(`room_push_${room.id}`, "false");
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
                safeStorage.setItem(`room_push_${room.id}`, "false");
                setShowNotificationPrompt(false);
              }}
            >
              No, thanks
            </Button>
            <Button 
              variant="contained"
              onClick={enablePushNotifications}
            >
              Enable
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showDisablePrompt}
          onClose={() => setShowDisablePrompt(false)}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsOffIcon color="error" />
            Disable Notifications?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary' }}>
              You will no longer receive push notifications for messages in <strong>{room.name}</strong>.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              color="inherit"
              onClick={() => setShowDisablePrompt(false)}
            >
              Cancel
            </Button>
            <Button 
              color="error"
              variant="contained"
              onClick={disablePushNotifications}
            >
              Disable
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </ThemeProvider>
  );
}
