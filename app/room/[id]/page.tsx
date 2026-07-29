import React from "react";
import { getRoomById } from "@/actions/room.actions";
import { Navbar } from "@/components/layout/navbar";
import { ChatRoom } from "@/components/chat/chat-room";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Radio, AlertCircle } from "lucide-react";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const room = await getRoomById(resolvedParams.id);

  if (!room) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Frequency Not Found</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-6 font-sans">
            The radar frequency <strong className="text-white">{resolvedParams.id}</strong> has expired, been burned, or never existed in this sector.
          </p>
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs uppercase font-mono tracking-wider shadow-lg">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Radar Hub</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="my-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Radar Grid</span>
          </Link>
        </div>
        <ChatRoom room={room} />
      </main>
    </div>
  );
}
