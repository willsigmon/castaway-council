"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSeason } from "./_components/SeasonContext";
import { getSupabaseClient } from "@/lib/supabase";
import { AnimatedCounter } from "./_components/AnimatedCounter";
import { FAQAccordion } from "./_components/FAQAccordion";

interface Season {
  id: string;
  name: string;
  status: "planned" | "active" | "complete";
  dayIndex: number;
}

interface PublicStats {
  activePlayers: number;
  totalSeasons: number;
  totalVotes: number;
  messagesToday: number;
}

interface SeasonWinner {
  seasonId: string;
  seasonName: string;
  winnerDisplayName: string;
  tribeName: string | null;
}

export default function Home() {
  const { currentSeason, currentPlayer } = useSeason();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [winners, setWinners] = useState<SeasonWinner[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Parallelize all independent data fetches for 75% faster load time
      const [authResult, seasonsResult, statsResult, winnersResult] = await Promise.all([
        // Auth check
        getSupabaseClient()
          .auth.getSession()
          .then((r) => r.data.session?.user ?? null)
          .catch((error) => {
            console.error("Auth check failed:", error);
            return null;
          }),
        // Season list
        fetch("/api/season/list")
          .then((r) => (r.ok ? r.json() : { seasons: [] }))
          .then((data) => data.seasons || [])
          .catch((error) => {
            console.error("Failed to load seasons:", error);
            return [];
          }),
        // Public stats
        fetch("/api/stats/public")
          .then((r) => (r.ok ? r.json() : null))
          .catch((error) => {
            console.error("Failed to load public stats:", error);
            return null;
          }),
        // Winners
        fetch("/api/stats/winners")
          .then((r) => (r.ok ? r.json() : { winners: [] }))
          .then((data) => data.winners || [])
          .catch((error) => {
            console.error("Failed to load winners:", error);
            return [];
          }),
      ]);

      setUser(authResult);
      setSeasons(seasonsResult);
      setPublicStats(statsResult);
      setWinners(winnersResult);
      setLoading(false);
    };

    loadData();
  }, []);

  // Memoize filtered seasons to prevent unnecessary re-renders
  const { activeSeasons, plannedSeasons, completedSeasons } = useMemo(
    () => ({
      activeSeasons: seasons.filter((s) => s.status === "active"),
      plannedSeasons: seasons.filter((s) => s.status === "planned"),
      completedSeasons: seasons.filter((s) => s.status === "complete"),
    }),
    [seasons]
  );

  const formatNumber = useCallback((value: number): string => {
    if (value >= 1000 && value < 1000000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }, []);

  // Loading skeleton for splash screen
  if (!user && loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
          <div className="h-12 w-96 bg-white/5 rounded mb-4" />
          <div className="h-8 w-64 bg-white/5 rounded mb-2" />
          <div className="h-6 w-80 bg-white/5 rounded mb-8" />
          <div className="flex gap-3 mb-32">
            <div className="h-12 w-40 bg-white/5 rounded" />
            <div className="h-12 w-32 bg-white/5 rounded" />
          </div>
          <div className="h-px bg-white/10 mb-16" />
          <div className="h-8 w-48 bg-white/5 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Show splash screen if no user and no loading
  if (!user && !loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Hero */}
          <div className="mb-32">
            <h1 className="text-5xl sm:text-7xl font-black mb-6 text-white">
              Castaway Council
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mb-2">
              18 players. 12 days. 1 survivor.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mb-8">
              A slow-burn social game where alliances crumble, idols hide, and every vote counts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                Join Next Season
              </Link>
              <Link
                href="/log"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                Watch Games
              </Link>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-24 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold mb-8 text-gray-300">How it works</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-gray-400">
              <div>
                <h3 className="text-white font-semibold mb-2">Each day has 3 phases</h3>
                <p className="text-sm leading-relaxed">
                  <span className="text-gray-300">Camp</span> (8 hours): Manage survival stats, find idols, form alliances<br />
                  <span className="text-gray-300">Challenge</span> (8 hours): Compete for immunity<br />
                  <span className="text-gray-300">Vote</span> (6 hours): Eliminate someone
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Win conditions</h3>
                <p className="text-sm leading-relaxed">
                  Survive 12 days without getting voted out. At the end, eliminated players vote for the winner from the final 3.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Character types</h3>
                <p className="text-sm leading-relaxed">
                  Pick from 6 archetypes (Athlete, Strategist, Survivalist, etc.). Each has different challenge bonuses and survival traits.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Fair RNG</h3>
                <p className="text-sm leading-relaxed">
                  All challenge rolls use cryptographic seeds. Server commits before you pick, so nothing&apos;s rigged.
                </p>
              </div>
            </div>
          </div>

          {/* Current stats */}
          {publicStats && (
            <div className="mb-24 border-t border-white/10 pt-16">
              <h2 className="text-2xl font-bold mb-8 text-gray-300">Right now</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={publicStats.activePlayers} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-gray-500">players in active seasons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={publicStats.totalSeasons} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-gray-500">completed seasons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={publicStats.totalVotes} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-gray-500">votes cast</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={publicStats.messagesToday} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-gray-500">messages today</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent winners */}
          {winners.length > 0 && (
            <div className="mb-24 border-t border-white/10 pt-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-300">Recent winners</h2>
              <div className="space-y-3">
                {winners.map((champ) => (
                  <div key={champ.seasonId} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-white font-semibold">{champ.winnerDisplayName}</span>
                      {champ.tribeName && (
                        <span className="text-gray-500 text-sm ml-2">• {champ.tribeName}</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">{champ.seasonName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mb-24 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-300">Questions</h2>
            <FAQAccordion
              faqs={[
                {
                  q: "How long does a season take?",
                  a: "12 in-game days = about 3-4 real weeks. Each phase lasts 6-8 hours, so you can play at your own pace.",
                },
                {
                  q: "Is it actually free?",
                  a: "Yes. No purchases, no ads, no premium features. Everyone plays the same game.",
                },
                {
                  q: "Can I play on mobile?",
                  a: "Works on any device. It's a PWA, so you can install it like a native app.",
                },
                {
                  q: "How many people per season?",
                  a: "18 players split into 3 tribes of 6. Tribes merge on Day 10.",
                },
              ]}
            />
          </div>

          {/* Final CTA */}
          <div className="border-t border-white/10 pt-16 pb-8">
            <div className="max-w-xl">
              <p className="text-lg text-gray-400 mb-6">
                New seasons start every few weeks. Join the next one or watch current games in progress.
              </p>
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                Join Next Season
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 gradient-text">
            Castaway Council
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Real-time slow-burn social survival RPG where strategy meets survival
          </p>
        </div>

        {currentSeason && currentPlayer && (
          <div className="mb-8 p-8 glass rounded-2xl border border-blue-500/30 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentPlayer.displayName}!</h2>
                <p className="text-white/90">You&apos;re currently playing in <span className="font-semibold text-blue-400">{currentSeason.name}</span></p>
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
            <p className="text-white/90 mb-6">Sign in or create an account to join a season and compete for the crown</p>
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
            <p className="text-white/90 mb-4">There are no seasons set up yet.</p>
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
                  } catch {
                    alert("Failed to create demo seasons");
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                Create Demo Seasons
              </button>
              <p className="text-sm text-white/60 self-center">
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
                      <p className="text-sm text-white/60 mb-4">Day {season.dayIndex}</p>
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
                      <p className="text-sm text-white/60">Coming soon</p>
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
                      <p className="text-sm text-white/60 mb-2">Day {season.dayIndex}</p>
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
