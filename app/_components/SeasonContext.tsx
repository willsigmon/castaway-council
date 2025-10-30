"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface Season {
  id: string;
  name: string;
  status: "planned" | "active" | "complete";
  dayIndex: number;
  startAt: string | null;
}

interface Player {
  id: string;
  displayName: string;
  tribeId?: string;
}

interface SeasonContextValue {
  currentSeason: Season | null;
  currentPlayer: Player | null;
  currentPhase: "camp" | "challenge" | "vote" | null;
  loading: boolean;
  refresh: () => void;
}

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"camp" | "challenge" | "vote" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSeasonData = async () => {
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch active season and player
      const response = await fetch("/api/season/current");
      if (response.ok) {
        const data = await response.json();
        setCurrentSeason(data.season || null);
        setCurrentPlayer(data.player || null);
        setCurrentPhase(data.phase || null);
      }
    } catch (error) {
      // Silently fail if Supabase not configured - page should still render
      console.error("Failed to fetch season data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonData();

    // Subscribe to phase changes
    try {
      const supabase = getSupabaseClient();
      const channelResult = supabase.channel("season-updates");
      if (channelResult && typeof channelResult.on === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (channelResult as any).on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "events",
            filter: "kind=eq.phase_open",
          },
          () => {
            fetchSeasonData();
          }
        ).subscribe();

        return () => {
          try {
            supabase.removeChannel(channel);
          } catch {
            // Ignore cleanup errors
          }
        };
      }
    } catch (error) {
      // Silently fail if Supabase not configured
      console.error("Failed to set up realtime subscription:", error);
    }
  }, []);

  return (
    <SeasonContext.Provider
      value={{
        currentSeason,
        currentPlayer,
        currentPhase,
        loading,
        refresh: fetchSeasonData,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    // Return default values if not in provider (for pages that don't need season context)
    return {
      currentSeason: null,
      currentPlayer: null,
      currentPhase: null,
      loading: false,
      refresh: () => {},
    };
  }
  return context;
}
