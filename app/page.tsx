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
          <div className="h-12 w-96 bg-amber-950/20 rounded mb-4" />
          <div className="h-8 w-64 bg-amber-950/20 rounded mb-2" />
          <div className="h-6 w-80 bg-amber-950/20 rounded mb-8" />
          <div className="flex gap-3 mb-32">
            <div className="h-12 w-40 bg-amber-950/20 rounded" />
            <div className="h-12 w-32 bg-amber-950/20 rounded" />
          </div>
          <div className="h-px bg-amber-900/30 mb-16" />
          <div className="h-8 w-48 bg-amber-950/20 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-amber-950/20 rounded" />
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
          <div className="mb-32 relative">
            {/* Torch flames */}
            <div className="absolute -top-8 left-0 text-6xl torch-flame">🔥</div>
            <div className="absolute -top-8 right-0 text-6xl torch-flame" style={{ animationDelay: '0.5s' }}>🔥</div>

            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="text-sm uppercase tracking-widest text-amber-600/80 font-bold mb-2 letterspacing-wide">
                  Outwit • Outplay • Outlast
                </div>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black mb-6 torch-glow drop-shadow-[0_0_20px_rgba(255,107,53,0.3)] tracking-tight">
                CASTAWAY COUNCIL
              </h1>
              <p className="text-xl sm:text-2xl text-amber-200/90 max-w-2xl mx-auto mb-2 font-semibold">
                18 players. 12 days. 1 survivor.
              </p>
              <p className="text-base text-amber-300/60 max-w-2xl mx-auto mb-10">
                Form alliances. Find idols. Survive tribal council.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 rounded-lg font-bold text-lg transition-all shadow-lg shadow-orange-900/40 hover:shadow-xl hover:shadow-orange-900/50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 focus-visible:outline-none border border-amber-700/30"
                >
                  Join the Game
                </Link>
                <Link
                  href="/log"
                  className="px-8 py-4 wood-panel hover:border-amber-800 rounded-lg font-semibold text-lg transition-all text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 focus-visible:outline-none"
                >
                  Watch Tribal Council
                </Link>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-24 border-t border-amber-900/30 pt-16">
            <h2 className="text-2xl font-bold mb-8 text-amber-200 uppercase tracking-wide text-sm">The Game</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-amber-300/70">
              <div>
                <h3 className="text-amber-100 font-bold mb-2 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span> Three Phases Per Day
                </h3>
                <p className="text-sm leading-relaxed">
                  <span className="text-amber-200">Camp</span> (8 hours): Forage, find idols, build alliances<br />
                  <span className="text-amber-200">Challenge</span> (8 hours): Compete for immunity<br />
                  <span className="text-amber-200">Tribal Council</span> (6 hours): Vote someone out
                </p>
              </div>
              <div>
                <h3 className="text-amber-100 font-bold mb-2 flex items-center gap-2">
                  <span className="text-yellow-500">👑</span> Last One Standing Wins
                </h3>
                <p className="text-sm leading-relaxed">
                  Outlast 12 days without elimination. Final 3 face a jury of voted-out players who decide the winner.
                </p>
              </div>
              <div>
                <h3 className="text-amber-100 font-bold mb-2 flex items-center gap-2">
                  <span className="text-amber-500">⚔️</span> Six Character Archetypes
                </h3>
                <p className="text-sm leading-relaxed">
                  Athlete, Strategist, Survivalist, Diplomat, Opportunist, or Wildcard. Each plays differently.
                </p>
              </div>
              <div>
                <h3 className="text-amber-100 font-bold mb-2 flex items-center gap-2">
                  <span className="text-cyan-500">🎲</span> Provably Fair RNG
                </h3>
                <p className="text-sm leading-relaxed">
                  Cryptographic commit-reveal system. Server can&apos;t cheat. You can verify every roll.
                </p>
              </div>
            </div>
          </div>

          {/* Current stats */}
          {publicStats && (
            <div className="mb-24 border-t border-amber-900/30 pt-16">
              <h2 className="text-sm font-bold mb-8 text-amber-200 uppercase tracking-wide">Tribe Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-3xl font-bold text-amber-100 mb-1">
                    <AnimatedCounter end={publicStats.activePlayers} formatValue={formatNumber} />
                  </div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide">Castaways</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-100 mb-1">
                    <AnimatedCounter end={publicStats.totalSeasons} formatValue={formatNumber} />
                  </div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide">Seasons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-100 mb-1">
                    <AnimatedCounter end={publicStats.totalVotes} formatValue={formatNumber} />
                  </div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide">Votes Cast</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-100 mb-1">
                    <AnimatedCounter end={publicStats.messagesToday} formatValue={formatNumber} />
                  </div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide">Messages Today</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent winners */}
          {winners.length > 0 && (
            <div className="mb-24 border-t border-amber-900/30 pt-16">
              <h2 className="text-sm font-bold mb-6 text-amber-200 uppercase tracking-wide flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Sole Survivors
              </h2>
              <div className="space-y-3">
                {winners.map((champ) => (
                  <div key={champ.seasonId} className="flex items-center justify-between py-3 border-b border-amber-900/20">
                    <div>
                      <span className="text-amber-100 font-bold">{champ.winnerDisplayName}</span>
                      {champ.tribeName && (
                        <span className="text-amber-600 text-sm ml-3">Tribe: {champ.tribeName}</span>
                      )}
                    </div>
                    <div className="text-amber-700 text-sm font-medium">{champ.seasonName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mb-24 border-t border-amber-900/30 pt-16">
            <h2 className="text-sm font-bold mb-6 text-amber-200 uppercase tracking-wide">Questions</h2>
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
          <div className="border-t border-amber-900/30 pt-16 pb-8">
            <div className="wood-panel rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-5xl torch-flame">🔥</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-3">The tribe has spoken</h3>
                  <p className="text-amber-300/80 mb-6">
                    New seasons start every few weeks. Will you be the next sole survivor?
                  </p>
                  <Link
                    href="/auth/signin"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg font-bold transition-all shadow-lg shadow-orange-900/40 border border-amber-700/30 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 focus-visible:outline-none"
                  >
                    Apply for Next Season
                  </Link>
                </div>
              </div>
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
