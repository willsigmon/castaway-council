"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  kind: string;
  day: number;
  payloadJson: Record<string, unknown>;
  createdAt: string;
}

export default function PublicLogPage() {
  const [events, setEvents] = useState<Event[]>([]);
  
  // TODO: Use setEvents when implementing Realtime subscription
  void setEvents;

  useEffect(() => {
    // TODO: Subscribe to season:{id}:public channel
    // const channel = supabase
    //   .channel('season:1:public')
    //   .on('postgres_changes', { ... })
    //   .subscribe();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Public Log</h1>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No events yet. Events will appear here as the season progresses.
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-4 bg-gray-800 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">Day {event.day}</span>
                <span className="text-xs text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="font-semibold capitalize">{event.kind.replace(/_/g, " ")}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
