"use client";

import { Chat } from "@/components/Chat";
import { StatHUD } from "@/components/StatHUD";

export default function DMPage() {
  // TODO: Get seasonId and toPlayerId from route/context
  const seasonId = "season-1";
  const toPlayerId = "player-2";

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Direct Messages</h1>
        <Chat channelType="dm" seasonId={seasonId} toPlayerId={toPlayerId} />
      </div>
      <StatHUD energy={75} hunger={60} thirst={80} social={65} />
    </div>
  );
}
