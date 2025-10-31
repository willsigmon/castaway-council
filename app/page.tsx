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
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        // Supabase not configured or error - continue without auth
        console.error("Auth check failed:", error);
      }

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
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 gradient-text">
            Castaway Council
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time slow-burn social survival RPG where strategy meets survival
          </p>
        </div>

        {currentSeason && currentPlayer && (
          <div className="mb-8 p-8 glass rounded-2xl border border-blue-500/30 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentPlayer.displayName}!</h2>
                <p className="text-gray-300">You&apos;re currently playing in <span className="font-semibold text-blue-400">{currentSeason.name}</span></p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-black">
                Active
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tribe"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Go to Tribe
              </Link>
              <Link
                href="/challenge"
                className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold border border-white/20"
              >
                View Challenge
              </Link>
              <Link
                href="/vote"
                className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold border border-white/20"
              >
                Tribal Council
              </Link>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-8 p-8 glass rounded-2xl border border-purple-500/30 card-hover">
            <h2 className="text-2xl font-bold mb-2 gradient-text">Get Started</h2>
            <p className="text-gray-300 mb-6">Sign in or create an account to join a season and compete for the crown</p>
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}

        {!loading && seasons.length === 0 && (
          <div className="mb-8 p-8 glass rounded-2xl border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏝️</span>
              <h2 className="text-2xl font-bold">No Seasons Available</h2>
            </div>
            <p className="text-gray-300 mb-4">There are no seasons set up yet.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/season/demo", { method: "POST" });
                    const data = await response.json();
                    if (response.ok) {
                      alert("Demo seasons created! Refresh to see them.");
                      window.location.reload();
                    } else {
                      alert(data.message || "Failed to create demo seasons");
                    }
                  } catch (error) {
                    alert("Failed to create demo seasons");
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                Create Demo Seasons
              </button>
              <p className="text-sm text-gray-400 self-center">
                {user
                  ? "Or contact an admin to create a real season."
                  : "Sign in to see available seasons or create a new one."}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 glass rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {activeSeasons.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-bold">Active Seasons</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeSeasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/season/${season.id}`}
                      className="group p-6 glass rounded-2xl border border-green-500/30 card-hover"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold group-hover:gradient-text transition-all">{season.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-black">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">Day {season.dayIndex}</p>
                      <div className="flex items-center gap-2 text-sm text-blue-400 font-medium">
                        Join Season
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {plannedSeasons.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
                  <h2 className="text-3xl font-bold">Upcoming Seasons</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {plannedSeasons.map((season) => (
                    <div
                      key={season.id}
                      className="p-6 glass rounded-2xl border border-yellow-500/30"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold">{season.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                          Planned
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completedSeasons.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full" />
                  <h2 className="text-3xl font-bold">Completed Seasons</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedSeasons.map((season) => (
                    <div
                      key={season.id}
                      className="p-6 glass rounded-2xl border border-gray-500/30 opacity-60"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold">{season.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-600 rounded-full">
                          Complete
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Day {season.dayIndex}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
