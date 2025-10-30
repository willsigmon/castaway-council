"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSeason } from "./_components/SeasonContext";
import { getSupabaseClient } from "@/lib/supabase";

interface Season {
  id: string;
  name: string;
  status: "planned" | "active" | "complete";
  dayIndex: number;
}

export default function Home() {
  const { currentSeason, currentPlayer } = useSeason();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      try {
        const response = await fetch("/api/season/list");
        if (response.ok) {
          const data = await response.json();
          setSeasons(data.seasons || []);
        }
      } catch (error) {
        console.error("Failed to load seasons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activeSeasons = seasons.filter((s) => s.status === "active");
  const plannedSeasons = seasons.filter((s) => s.status === "planned");
  const completedSeasons = seasons.filter((s) => s.status === "complete");

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Castaway Council</h1>
          <p className="text-lg text-gray-400">Real-time slow-burn social survival RPG</p>
        </div>

        {currentSeason && currentPlayer && (
          <div className="mb-8 p-6 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Welcome back, {currentPlayer.displayName}!</h2>
            <p className="text-gray-300 mb-4">You&apos;re currently playing in {currentSeason.name}</p>
            <div className="flex gap-3">
              <Link
                href="/tribe"
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Tribe
              </Link>
              <Link
                href="/challenge"
                className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              >
                View Challenge
              </Link>
              <Link
                href="/vote"
                className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              >
                Tribal Council
              </Link>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Get Started</h2>
            <p className="text-gray-400 mb-4">Sign in or create an account to join a season</p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-gray-800 rounded animate-pulse" />
            <div className="h-32 bg-gray-800 rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-8">
            {activeSeasons.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Active Seasons</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeSeasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/season/${season.id}`}
                      className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-600 transition-colors"
                    >
                      <h3 className="text-xl font-semibold mb-2">{season.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">Day {season.dayIndex}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-green-600 rounded">Active</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {plannedSeasons.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Upcoming Seasons</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plannedSeasons.map((season) => (
                    <div
                      key={season.id}
                      className="p-6 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <h3 className="text-xl font-semibold mb-2">{season.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-600 rounded">Planned</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completedSeasons.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Completed Seasons</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedSeasons.map((season) => (
                    <div
                      key={season.id}
                      className="p-6 bg-gray-800 rounded-lg border border-gray-700 opacity-60"
                    >
                      <h3 className="text-xl font-semibold mb-2">{season.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">Day {season.dayIndex}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-600 rounded">Complete</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {seasons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No seasons available yet.</p>
                {user && (
                  <p className="text-gray-500 mt-2">Check back soon for new seasons!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
