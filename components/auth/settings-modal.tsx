"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AVATARS, ACCENT_COLORS } from "@/constants/identities";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateIdentity } = useAuth();
  
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatar);
      setSelectedColor(user.accentColor);
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!selectedAvatar || !selectedColor) return;
    setIsSaving(true);
    try {
      await updateIdentity(selectedAvatar, selectedColor);
      toast.success("Settings updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0c] border border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Identity Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner transition-colors duration-300"
              style={{ backgroundColor: `${selectedColor}20`, border: `1px solid ${selectedColor}40` }}
            >
              {selectedAvatar}
            </div>
            <div>
              <p className="text-sm text-zinc-400">Current Identity</p>
              <h3 className="text-lg font-bold" style={{ color: selectedColor }}>{user.username}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">Choose Avatar</h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all duration-200 hover:bg-white/10",
                    selectedAvatar === avatar ? "bg-white/15 scale-110 shadow-lg" : "bg-transparent grayscale hover:grayscale-0"
                  )}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">Accent Color</h4>
            <div className="grid grid-cols-4 gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105",
                    selectedColor === color ? "ring-2 ring-white shadow-lg" : "ring-1 ring-white/10 opacity-70 hover:opacity-100"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check className="w-4 h-4 text-black" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 text-zinc-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || (selectedAvatar === user.avatar && selectedColor === user.accentColor)}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
