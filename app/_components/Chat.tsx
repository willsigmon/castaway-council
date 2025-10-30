"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  body: string;
  createdAt: string;
}

interface ChatProps {
  channelType: "tribe" | "dm" | "public";
  seasonId: string;
  tribeId?: string;
  toPlayerId?: string;
}

export function Chat({ channelType, seasonId, tribeId, toPlayerId }: ChatProps) {
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const params = new URLSearchParams({
          seasonId,
          channelType,
          limit: "50",
        });
        if (tribeId) params.set("tribeId", tribeId);
        if (toPlayerId) params.set("toPlayerId", toPlayerId);

        const response = await fetch(`/api/messages?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          // Fetch player names for messages
          const messagesWithNames = await Promise.all(
            data.messages.map(async (msg: { id: string; fromPlayerId: string; body: string; createdAt: string }) => {
              // Get player name (in real app, you'd fetch this or join in the query)
              // For now, we'll use a placeholder - ideally this would be handled server-side
              return {
                id: msg.id,
                fromPlayerId: msg.fromPlayerId,
                fromPlayerName: `Player ${msg.fromPlayerId.slice(0, 8)}`, // Placeholder
                body: msg.body,
                createdAt: msg.createdAt,
              };
            })
          );
          setMessagesList(messagesWithNames);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [seasonId, channelType, tribeId, toPlayerId]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    try {
      const supabase = getSupabaseClient();

      // Determine channel name based on channel type
      let channelName: string;
      if (channelType === "tribe" && tribeId) {
        channelName = `tribe:${tribeId}:chat`;
      } else if (channelType === "dm" && toPlayerId) {
        // Note: DM pair key should be created server-side with both player IDs
        // For now, use a simple identifier - this will be improved when we have current player ID
        channelName = `dm:${toPlayerId}`;
      } else {
        channelName = `season:${seasonId}:public`;
      }

      // Check if this is a real Supabase client (has proper channel API)
      const channelResult = supabase.channel(channelName);
      if (channelResult && typeof channelResult.on === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (channelResult as any).on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: channelType === "tribe"
              ? `tribe_id=eq.${tribeId}`
              : channelType === "dm"
              ? `to_player_id=eq.${toPlayerId}`
              : `season_id=eq.${seasonId}`,
          },
          (payload: { new: { id: string; from_player_id: string; body: string; created_at: string } }) => {
            const newMessage = payload.new;
            // Add new message to list
            setMessagesList((prev) => [
              ...prev,
              {
                id: newMessage.id,
                fromPlayerId: newMessage.from_player_id,
                fromPlayerName: `Player ${newMessage.from_player_id.slice(0, 8)}`, // Placeholder
                body: newMessage.body,
                createdAt: newMessage.created_at,
              },
            ]);
          }
        ).subscribe();

        channelRef.current = channel as RealtimeChannel;

        return () => {
          try {
            supabase.removeChannel(channel as RealtimeChannel);
          } catch {
            // Ignore cleanup errors
          }
        };
      }
    } catch (error) {
      console.error("Failed to set up realtime subscription:", error);
    }
  }, [channelType, seasonId, tribeId, toPlayerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId,
          channelType,
          tribeId,
          toPlayerId,
          body: input,
        }),
      });

      if (response.ok) {
        setInput("");
      } else {
        const error = await response.json();
        console.error("Failed to send message:", error);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messagesList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
        ) : (
          messagesList.map((msg) => (
            <div key={msg.id} className="p-2 rounded bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{msg.fromPlayerName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p>{msg.body}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-gray-800 rounded"
          aria-label="Message input"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
