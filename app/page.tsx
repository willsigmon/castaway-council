"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSeason } from "./_components/SeasonContext";
import { createClient } from "./_lib/supabase/client";
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
        createClient()
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
      <main className="min-h-screen relative">
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          {/* Hero */}
          <div className="mb-32 relative">

            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="text-sm uppercase tracking-widest text-amber-600/80 font-tribal font-bold mb-2">
                  Outwit • Outplay • Outlast
                </div>
              </div>
              <h1 className="text-6xl sm:text-8xl font-adventure mb-8 torch-glow drop-shadow-[0_0_30px_rgba(255,107,53,0.5)]">
                CASTAWAY COUNCIL
              </h1>
              <p className="text-2xl sm:text-4xl text-amber-200 max-w-2xl mx-auto mb-3 font-tribal font-bold">
                Outlast 18 players for 15 days. Become the sole survivor.
              </p>
              <p className="text-lg sm:text-xl text-amber-300/70 max-w-2xl mx-auto mb-12">
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
            <h2 className="text-3xl font-adventure text-amber-200 uppercase mb-12">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="torch-panel rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-5xl">🏕️</span>
                  <div>
                    <h3 className="text-xl font-tribal text-amber-100 font-bold mb-3">Three Phases Daily</h3>
                    <div className="space-y-2 text-base text-amber-200/80">
                      <div><span className="font-bold text-orange-400">Camp</span> (8hrs) — Forage, find idols, scheme with allies</div>
                      <div><span className="font-bold text-orange-400">Challenge</span> (8hrs) — Fight for immunity</div>
                      <div><span className="font-bold text-orange-400">Council</span> (6hrs) — Vote someone out</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="torch-panel rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-5xl">👑</span>
                  <div>
                    <h3 className="text-xl font-tribal text-amber-100 font-bold mb-3">Sole Survivor</h3>
                    <p className="text-base text-amber-200/80 leading-relaxed">
                      Survive 15 days and 14 eliminations. On Day 15, the final 4 compete in one last challenge. The winner picks 2 rivals to battle 1v1. The final 3 plead their case to the jury of merged players.
                    </p>
                  </div>
                </div>
              </div>

              <div className="torch-panel rounded-lg p-6 md:col-span-2">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-5xl">⚔️</span>
                  <div>
                    <h3 className="text-xl font-tribal text-amber-100 font-bold mb-3">Character Classes</h3>
                    <p className="text-base text-amber-200/80 leading-relaxed">
                      Choose your archetype with unique active and passive abilities. Click below to see all 6 classes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="torch-panel rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-5xl">🎲</span>
                  <div>
                    <h3 className="text-xl font-tribal text-amber-100 font-bold mb-3">No Cheating</h3>
                    <p className="text-base text-amber-200/80 leading-relaxed">
                      All RNG uses cryptographic seeds. Server commits before you choose. Every roll is verifiable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Character Classes Detail */}
          <div className="mb-24 border-t border-amber-900/30 pt-16">
            <h2 className="text-3xl font-adventure text-amber-200 uppercase mb-12 text-center">Choose Your Archetype</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hunter */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">🪓</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Hunter</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Provider / Resource Gatherer</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Forage Boost:</span> 25% higher chance of finding food/materials</li>
                      <li>• <span className="font-semibold">Track Game:</span> Guarantee 1 food item every 3 days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Loses energy faster in challenges due to physical strain</p>
                  </div>
                </div>
              </div>

              {/* Strategist */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">🧠</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Strategist</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Mastermind / Social Manipulator</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Insight:</span> See hints about vote intentions each round</li>
                      <li>• <span className="font-semibold">Predict Outcome:</span> Cancel 1 twist event before merge</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Gains less comfort from tribe upgrades (seen as detached)</p>
                  </div>
                </div>
              </div>

              {/* Builder */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">💪</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Builder</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Camp Sustainer / Craftsman</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Engineer:</span> Shelter and fire last 1 day longer</li>
                      <li>• <span className="font-semibold">Construct Tool:</span> Craft random items every 3 days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Weaker in mental challenges</p>
                  </div>
                </div>
              </div>

              {/* Medic */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">🩹</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Medic</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Caregiver / Morale Booster</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Tend Wounds:</span> Restore +15% Energy/Comfort to others daily</li>
                      <li>• <span className="font-semibold">Medical Check:</span> 10% reduced evacuation risk</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Consumes more hunger and thirst daily (focuses on others)</p>
                  </div>
                </div>
              </div>

              {/* Leader */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">🔥</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Leader</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Motivator / Social Powerhouse</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Inspire Tribe:</span> Increase tribe Energy/Comfort at camp</li>
                      <li>• <span className="font-semibold">Command:</span> Decide tied votes (lose 25% comfort)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Attracts more suspicion; can't go idle (social pressure penalty)</p>
                  </div>
                </div>
              </div>

              {/* Scout */}
              <div className="wood-panel rounded-lg p-6 border-2 border-amber-700/40 hover:border-amber-600/60 transition-all">
                <div className="text-center mb-4">
                  <span className="text-6xl mb-3 block">🕵️</span>
                  <h3 className="text-2xl font-tribal text-amber-100 font-bold">The Scout</h3>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Observant / Explorer</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide">Abilities</h4>
                    <ul className="space-y-1 text-amber-200/80">
                      <li>• <span className="font-semibold">Pathfinder:</span> 10% chance to find hidden advantages</li>
                      <li>• <span className="font-semibold">Spy Mission:</span> View rival tribe chat every 2 days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide">Weakness</h4>
                    <p className="text-amber-200/70">Energy drops faster when exploring (exhaustion risk)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current stats */}
          {publicStats && (
            <div className="mb-24 border-t border-amber-900/30 pt-16">
              <h2 className="text-3xl font-adventure text-amber-200 uppercase mb-12">The Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-tribal font-bold text-amber-100 mb-2">
                    <AnimatedCounter end={publicStats.activePlayers} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-amber-600 uppercase tracking-wide font-tribal">Castaways</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-tribal font-bold text-amber-100 mb-2">
                    <AnimatedCounter end={publicStats.totalSeasons} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-amber-600 uppercase tracking-wide font-tribal">Seasons</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-tribal font-bold text-amber-100 mb-2">
                    <AnimatedCounter end={publicStats.totalVotes} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-amber-600 uppercase tracking-wide font-tribal">Votes Cast</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-tribal font-bold text-amber-100 mb-2">
                    <AnimatedCounter end={publicStats.messagesToday} formatValue={formatNumber} />
                  </div>
                  <div className="text-sm text-amber-600 uppercase tracking-wide font-tribal">Today</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent winners */}
          {winners.length > 0 && (
            <div className="mb-24 border-t border-amber-900/30 pt-16">
              <h2 className="text-3xl font-adventure text-amber-200 uppercase mb-8">Sole Survivors</h2>
              <div className="wood-panel rounded-lg p-6">
                <div className="space-y-4">
                  {winners.map((champ) => (
                    <div key={champ.seasonId} className="flex items-center justify-between py-3 border-b border-amber-900/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👑</span>
                        <div>
                          <div className="text-amber-100 font-bold text-lg">{champ.winnerDisplayName}</div>
                          {champ.tribeName && (
                            <div className="text-amber-600 text-sm">Tribe: {champ.tribeName}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-amber-700 text-sm font-tribal font-bold">{champ.seasonName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mb-24 border-t border-amber-900/30 pt-16">
            <h2 className="text-3xl font-adventure text-amber-200 uppercase mb-8">Questions</h2>
            <FAQAccordion
              faqs={[
                {
                  q: "How long does a season take?",
                  a: "15 in-game days = about 4-5 real weeks. Each phase lasts 6-8 hours, so you can play at your own pace.",
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
                  a: "18 players split into 3 tribes of 6. Tribes merge when 11 players remain (typically Day 9). One player is eliminated daily for the first 14 days. Day 15 is the epic 4-person finale.",
                },
              ]}
            />
          </div>

          {/* Final CTA */}
          <div className="border-t border-amber-900/30 pt-16 pb-8">
            <div className="torch-panel rounded-lg p-10 relative overflow-hidden">
              <div className="relative text-center">
                <h3 className="text-4xl font-adventure text-amber-100 mb-4 uppercase">
                  The Tribe Has Spoken
                </h3>
                <p className="text-xl text-amber-200/90 mb-8 max-w-xl mx-auto">
                  Think you have what it takes? New seasons launch every few weeks.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg font-bold text-xl transition-all shadow-xl shadow-orange-900/50 border border-amber-700/40 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 focus-visible:outline-none"
                >
                  Apply for Next Season
                </Link>
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
              <h2 className="text-2xl font-bold">Welcome to Castaway Council!</h2>
            </div>
            {user ? (
              <>
                <p className="text-white/90 mb-2">You're signed in as <span className="font-semibold text-amber-400">{user.email}</span></p>
                <p className="text-white/80 mb-4">No seasons are currently active. Seasons are created by admins and will appear here when available.</p>
                <div className="wood-panel rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-bold text-amber-100 mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-amber-200/80">
                    <li>• Seasons are announced via email when they launch</li>
                    <li>• You'll be able to join and compete with other players</li>
                    <li>• Check back here to see when new seasons are available</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/log"
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                  >
                    Watch Previous Seasons
                  </Link>
                  <button
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      window.location.reload();
                    }}
                    className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold border border-white/20"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/90 mb-4">There are no active seasons right now.</p>
                <p className="text-sm text-white/60">Sign in to get notified when new seasons launch!</p>
              </>
            )}
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
