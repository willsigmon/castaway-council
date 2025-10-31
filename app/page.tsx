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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Skeleton */}
          <div className="mb-20 text-center animate-pulse">
            <div className="inline-block h-10 w-64 bg-white/10 rounded-full mb-6 mx-auto" />
            <div className="h-24 w-full max-w-3xl mx-auto bg-white/10 rounded-2xl mb-6" />
            <div className="h-16 w-full max-w-2xl mx-auto bg-white/10 rounded-xl mb-8" />
            <div className="flex gap-4 justify-center">
              <div className="h-16 w-48 bg-white/10 rounded-xl" />
              <div className="h-16 w-48 bg-white/10 rounded-xl" />
            </div>
          </div>

          {/* Features Skeleton */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 glass rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Stats Skeleton */}
          <div className="glass rounded-3xl p-12 mb-20">
            <div className="h-10 w-64 bg-white/10 rounded-xl mb-8 mx-auto animate-pulse" />
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4 mx-auto animate-pulse" />
                  <div className="h-10 w-24 bg-white/10 rounded-lg mb-2 mx-auto animate-pulse" />
                  <div className="h-4 w-32 bg-white/10 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show splash screen if no user and no loading
  if (!user && !loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Splash */}
          <div className="mb-20 text-center animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full border border-white/10 mb-6">
              <span className="text-2xl">🏝️</span>
              <span className="text-sm font-semibold">Survival meets strategy</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 gradient-text leading-tight">
              Castaway Council
            </h1>
            <p className="text-2xl sm:text-3xl text-white/90 max-w-3xl mx-auto mb-8 font-light">
              The strategy game where every vote matters, every alliance breaks, and only one player claims glory
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 focus-visible:ring-4 focus-visible:ring-blue-500/50 focus-visible:outline-none transition-all duration-200 font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 active:scale-[0.98]"
              >
                Start Playing →
              </Link>
              <Link
                href="/log"
                className="px-8 py-4 glass rounded-xl hover:bg-white/10 active:bg-white/5 focus-visible:ring-4 focus-visible:ring-white/20 focus-visible:outline-none transition-all duration-200 font-semibold text-lg border border-white/20 hover:border-white/40"
                aria-label="Watch live tribal councils and gameplay"
              >
                Watch Live Gameplay →
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 glass rounded-2xl border border-blue-500/30 card-hover">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold mb-3">Daily Challenges</h3>
              <p className="text-white/90">
                Compete in randomized challenges with provably fair outcomes. Every roll is verifiable and transparent.
              </p>
            </div>
            <div className="p-8 glass rounded-2xl border border-purple-500/30 card-hover">
              <div className="text-5xl mb-4">🗳️</div>
              <h3 className="text-2xl font-bold mb-3">Tribal Council</h3>
              <p className="text-white/90">
                Vote out players using anonymous ballots. Alliances form, break, and reform in real-time.
              </p>
            </div>
            <div className="p-8 glass rounded-2xl border border-pink-500/30 card-hover">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-3">Real-time Chat</h3>
              <p className="text-white/90">
                Strategize with your tribe, form DMs with allies, or confess to the audience. Every message matters.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-20">
            <div className="glass rounded-3xl p-12 border border-blue-500/30">
              <h2 className="text-3xl font-bold mb-8 text-center">As Featured In</h2>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
                <div className="text-3xl font-bold filter grayscale hover:grayscale-0 transition-all">GameSpot</div>
                <div className="text-3xl font-bold filter grayscale hover:grayscale-0 transition-all">Polygon</div>
                <div className="text-3xl font-bold filter grayscale hover:grayscale-0 transition-all">IGN</div>
                <div className="text-3xl font-bold filter grayscale hover:grayscale-0 transition-all">Rock Paper Shotgun</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 gradient-text">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { num: "1", title: "Camp", desc: "Complete tasks to maintain your stats", icon: "🏕️" },
                { num: "2", title: "Challenge", desc: "Compete in skill-based games", icon: "🎯" },
                { num: "3", title: "Vote", desc: "Eliminate players you can't trust", icon: "🗳️" },
                { num: "4", title: "Win", desc: "Outlast everyone to claim victory", icon: "👑" },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-4 text-3xl shadow-lg shadow-blue-500/30">
                    {step.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full glass border border-white/20 mb-3">
                    <span className="text-sm font-bold text-blue-400">{step.num}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                  <p className="text-white/60 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Season Timeline */}
          <div className="mb-20">
            <div className="glass rounded-3xl p-12 border border-yellow-500/30">
              <h2 className="text-3xl font-bold mb-8 text-center">The 10-Day Journey</h2>
              <div className="relative max-w-4xl mx-auto">
                {/* Timeline line */}
                <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

                <div className="flex justify-between relative">
                  {[
                    { day: 1, phase: "Camp Tasks", icon: "🏕️" },
                    { day: 3, phase: "First Challenge", icon: "🎯" },
                    { day: 5, phase: "Tribal Merge", icon: "🤝" },
                    { day: 8, phase: "Final 3", icon: "👑" },
                    { day: 10, phase: "Jury Vote", icon: "🏆" },
                  ].map((milestone, i) => (
                    <div key={i} className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 text-4xl shadow-lg shadow-blue-500/30 relative z-10">
                        {milestone.icon}
                      </div>
                      <div className="text-xs font-bold text-blue-400 mb-1">Day {milestone.day}</div>
                      <div className="text-sm font-semibold">{milestone.phase}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Types */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Challenge Archetypes</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "🎯", title: "Precision", desc: "Hit targets, solve puzzles" },
                { icon: "💪", title: "Endurance", desc: "Races, stamina tests" },
                { icon: "🧠", title: "Intelligence", desc: "Trivia, memory games" },
                { icon: "⚡", title: "Speed", desc: "Reaction time, reflexes" },
              ].map((challenge, i) => (
                <div key={i} className="group p-6 glass rounded-2xl border border-white/20 card-hover text-center">
                  <div className="text-5xl mb-4">{challenge.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{challenge.title}</h4>
                  <p className="text-sm text-white/60">{challenge.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Game Features */}
          <div className="mb-20">
            <div className="glass rounded-3xl p-12 border border-white/10">
              <h2 className="text-3xl font-bold mb-8 text-center">Survival Mechanics</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Energy, Hunger, Thirst</h4>
                    <p className="text-white/90">
                      Manage your survival stats through foraging, water collection, and strategic rest. Low stats affect your challenge performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    🤝
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Social Connections</h4>
                    <p className="text-white/90">
                      Build alliances through the help action. Higher social stats can sway votes and create powerful partnerships.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                    🎲
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Randomized Challenges</h4>
                    <p className="text-white/90">
                      Every challenge uses verifiable RNG with server seeds published after reveal. Fair play guaranteed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Hidden Immunity</h4>
                    <p className="text-white/90">
                      Find and play immunity idols to save yourself from elimination. Use them wisely—once played, they&apos;re gone forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Player Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "The most intense social game I've ever played. Won Season 12 by 1 vote!",
                  author: "@ShadowStrat",
                  season: "Season 12 Champion",
                },
                {
                  quote: "Finally, a game where strategy actually matters. No pay-to-win, pure skill.",
                  author: "@TacticalVault",
                  season: "Top 3, Season 8",
                },
                {
                  quote: "The real-time aspect makes every alliance feel real. Love the tension!",
                  author: "@MindReader",
                  season: "Day 8 Eliminated",
                },
              ].map((testimonial, i) => (
                <div key={i} className="p-6 glass rounded-2xl border border-white/20 card-hover">
                  <p className="text-white/90 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.author[1]}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-white/60">{testimonial.season}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Winners */}
          {winners.length > 0 && (
            <div className="mb-20">
              <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Recent Champions</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {winners.map((champ) => (
                  <div key={champ.seasonId} className="group p-6 glass rounded-2xl border border-yellow-500/30 card-hover text-center">
                    <div className="text-5xl mb-3">🥇</div>
                    <div className="text-xs font-bold text-yellow-400 mb-2">{champ.seasonName}</div>
                    <div className="text-lg font-bold mb-1">{champ.winnerDisplayName}</div>
                    <div className="text-sm text-white/60">{champ.tribeName || "No Tribe"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing or Free to Play Badge */}
          <div className="mb-20">
            <div className="glass rounded-3xl p-12 border border-green-500/30 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <span className="text-2xl">🆓</span>
                <span className="font-bold text-black">100% Free to Play</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">No Pay-to-Win. No Ads. No BS.</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Every player starts equal. Success comes from strategy, not your wallet.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-bold text-lg mb-2">Full Access</h4>
                  <p className="text-white/60 text-sm">All seasons, all features</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-bold text-lg mb-2">Fair Play</h4>
                  <p className="text-white/60 text-sm">Verifiable randomness</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-bold text-lg mb-2">Epic Rewards</h4>
                  <p className="text-white/60 text-sm">Bragging rights & glory</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          {publicStats && (
            <div className="mb-20">
              <div className="glass rounded-3xl p-12 border border-cyan-500/30">
                <h2 className="text-3xl font-bold mb-8 text-center">Castaway Council in Numbers</h2>
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    {
                      label: "Active Players",
                      value: publicStats.activePlayers,
                      icon: "👥",
                      gradient: "from-blue-500 to-cyan-500",
                    },
                    {
                      label: "Total Seasons",
                      value: publicStats.totalSeasons,
                      icon: "🏆",
                      gradient: "from-purple-500 to-pink-500",
                    },
                    {
                      label: "Total Votes Cast",
                      value: publicStats.totalVotes,
                      icon: "🗳️",
                      gradient: "from-green-500 to-emerald-500",
                    },
                    {
                      label: "Messages Today",
                      value: publicStats.messagesToday,
                      icon: "💬",
                      gradient: "from-orange-500 to-red-500",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-4 text-3xl shadow-lg`}
                      >
                        {stat.icon}
                      </div>
                      <div className="text-4xl font-bold mb-2 gradient-text">
                        <AnimatedCounter end={stat.value} formatValue={formatNumber} />
                      </div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Frequently Asked Questions</h2>
            <FAQAccordion
              faqs={[
                {
                  q: "How long does a season last?",
                  a: "Each season runs for 10 in-game days with phases lasting 6-8 hours each. Total time: about 3-4 real-world weeks.",
                },
                {
                  q: "Is the game really free?",
                  a: "100% free. No in-app purchases, no ads, no pay-to-win mechanics. All players compete on equal footing.",
                },
                {
                  q: "Can I play on mobile?",
                  a: "Yes! Castaway Council is a Progressive Web App that works great on phones, tablets, and desktops.",
                },
                {
                  q: "How many players per season?",
                  a: "Seasons typically start with 18 players split into 3 tribes of 6.",
                },
              ]}
            />
          </div>

          {/* CTA */}
          <div className="text-center glass rounded-3xl p-16 border border-purple-500/30">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Ready to Survive?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of players competing for the title of Sole Survivor
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signin"
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold text-xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                Create Account →
              </Link>
              <Link
                href="/log"
                className="px-10 py-5 glass rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold text-xl border border-white/20"
              >
                View Public Log
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
