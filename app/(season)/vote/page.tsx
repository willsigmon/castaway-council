"use client";

import { useState } from "react";
import { Countdown } from "@/components/Countdown";

export default function VotePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // TODO: Fetch eligible players for voting
  const players = [
    { id: "1", name: "Player 1" },
    { id: "2", name: "Player 2" },
    { id: "3", name: "Player 3" },
  ];

  const handleVote = async () => {
    if (!selected) return;

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: 1,
          targetPlayerId: selected,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">✓ Vote Submitted</h2>
          <p>Your vote has been recorded. Wait for results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Tribal Council</h1>
      <div className="mb-4">
        <Countdown closesAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()} />
      </div>
      <div className="max-w-md mx-auto space-y-2">
        <p className="mb-4">Vote for who should be eliminated:</p>
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelected(player.id)}
            className={`w-full p-4 rounded border-2 ${
              selected === player.id
                ? "border-blue-500 bg-blue-900"
                : "border-gray-700 bg-gray-800"
            }`}
          >
            {player.name}
          </button>
        ))}
        <button
          onClick={handleVote}
          disabled={!selected}
          className="w-full mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Submit Vote
        </button>
      </div>
    </div>
  );
}
