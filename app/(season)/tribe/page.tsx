"use client";

import { Chat } from "@/components/Chat";
import { StatHUD } from "@/components/StatHUD";
import { useSeason } from "@/components/SeasonContext";
import { useEffect, useState } from "react";

export default function TribePage() {
  const { currentSeason, currentPlayer } = useSeason();
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSeason || !currentPlayer) {
      setLoading(false);
      return;
    }

    // Fetch tribe ID for player
    fetch(`/api/player/tribe?seasonId=${currentSeason.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTribeId(data.tribeId || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentSeason, currentPlayer]);

  if (!currentSeason || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not in a Season</h2>
          <p className="text-gray-400 mb-4">Join a season to access tribe chat.</p>
          <a href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!tribeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Tribe Assigned</h2>
          <p className="text-gray-400">You haven&apos;t been assigned to a tribe yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Tribe Chat</h1>
        <Chat channelType="tribe" seasonId={currentSeason.id} tribeId={tribeId} />
      </div>
      <StatHUD energy={75} hunger={60} thirst={80} social={65} />
    </div>
  );
}
