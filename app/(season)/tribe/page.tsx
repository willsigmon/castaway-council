"use client";

import { Chat } from "@/components/Chat";
import { StatHUD } from "@/components/StatHUD";

export default function TribePage() {
  // TODO: Get seasonId and tribeId from route/context
  const seasonId = "season-1";
  const tribeId = "tribe-1";

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Tribe Chat</h1>
        <Chat channelType="tribe" seasonId={seasonId} tribeId={tribeId} />
      </div>
      <StatHUD energy={75} hunger={60} thirst={80} social={65} />
    </div>
  );
}
