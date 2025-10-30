"use client";

import { useSeason } from "./SeasonContext";

export function PhaseIndicator() {
  const { currentSeason, currentPhase, loading } = useSeason();

  if (loading) {
    return null;
  }

  if (!currentSeason || !currentPhase) {
    return null;
  }

  const phaseColors = {
    camp: "bg-green-600",
    challenge: "bg-yellow-600",
    vote: "bg-red-600",
  };

  const phaseLabels = {
    camp: "Camp Tasks",
    challenge: "Challenge",
    vote: "Tribal Council",
  };

  return (
    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Season:</span>
          <span className="font-semibold">{currentSeason.name}</span>
        </div>
        <span className="text-gray-600">•</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Day:</span>
          <span className="font-semibold">{currentSeason.dayIndex}</span>
        </div>
        <span className="text-gray-600">•</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${phaseColors[currentPhase]}`}>
            {phaseLabels[currentPhase]}
          </span>
        </div>
      </div>
    </div>
  );
}

