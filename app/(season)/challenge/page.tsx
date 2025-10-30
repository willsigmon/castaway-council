"use client";

import { useState } from "react";
import { Countdown } from "@/components/Countdown";
import { hashClientSeed } from "@game-logic";

export default function ChallengePage() {
  const [clientSeed, setClientSeed] = useState("");
  const [committed, setCommitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommit = async () => {
    if (!clientSeed.trim()) {
      setError("Please enter a client seed");
      return;
    }

    try {
      const seedHash = hashClientSeed(clientSeed);
      const response = await fetch("/api/challenge/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientSeedHash: seedHash }),
      });

      if (response.ok) {
        setCommitted(true);
        setError(null);
      } else {
        setError("Failed to commit seed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Challenge</h1>
      <div className="mb-4">
        <Countdown closesAt={new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()} />
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block mb-2">Enter your client seed:</label>
          <input
            type="text"
            value={clientSeed}
            onChange={(e) => setClientSeed(e.target.value)}
            disabled={committed}
            className="w-full px-3 py-2 bg-gray-800 rounded"
            placeholder="Any random string"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {committed ? (
          <div className="p-4 bg-green-900 rounded">
            <p className="font-semibold">✓ Seed committed!</p>
            <p className="text-sm mt-2">Wait for challenge resolution...</p>
          </div>
        ) : (
          <button
            onClick={handleCommit}
            className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Commit Seed
          </button>
        )}
      </div>
    </div>
  );
}
