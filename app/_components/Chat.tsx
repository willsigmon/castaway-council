"use client";

import { useState, useEffect, useRef } from "react";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Connect to Supabase Realtime channel
    // const channel = supabase
    //   .channel(`${channelType}:${tribeId || seasonId}`)
    //   .on('postgres_changes', ...)
    //   .subscribe();
  }, [channelType, seasonId, tribeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType,
          tribeId,
          toPlayerId,
          body: input,
        }),
      });

      if (response.ok) {
        setInput("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
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
