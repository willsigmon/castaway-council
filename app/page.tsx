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

  // Show splash screen if no user and no loading
  if (!user && !loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Splash */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full border border-white/10 mb-6">
              <span className="text-2xl">🏝️</span>
              <span className="text-sm font-semibold">Survival meets strategy</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 gradient-text leading-tight">
              Castaway Council
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-300 max-w-3xl mx-auto mb-8 font-light">
              Compete, survive, and outsmart your way to become the sole survivor
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                Start Playing →
              </Link>
              <Link
                href="/log"
                className="px-8 py-4 glass rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold text-lg border border-white/20"
              >
                Watch Live
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 glass rounded-2xl border border-blue-500/30 card-hover">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold mb-3">Daily Challenges</h3>
              <p className="text-gray-300">
                Compete in randomized challenges with provably fair outcomes. Every roll is verifiable and transparent.
              </p>
            </div>
            <div className="p-8 glass rounded-2xl border border-purple-500/30 card-hover">
              <div className="text-5xl mb-4">🗳️</div>
              <h3 className="text-2xl font-bold mb-3">Tribal Council</h3>
              <p className="text-gray-300">
                Vote out players using anonymous ballots. Alliances form, break, and reform in real-time.
              </p>
            </div>
            <div className="p-8 glass rounded-2xl border border-pink-500/30 card-hover">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-3">Real-time Chat</h3>
              <p className="text-gray-300">
                Strategize with your tribe, form DMs with allies, or confess to the audience. Every message matters.
              </p>
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
                  <p className="text-gray-400 text-sm">{step.desc}</p>
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
                    <p className="text-gray-300">
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
                    <p className="text-gray-300">
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
                    <p className="text-gray-300">
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
                    <p className="text-gray-300">
                      Find and play immunity idols to save yourself from elimination. Use them wisely—once played, they&apos;re gone forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center glass rounded-3xl p-16 border border-purple-500/30">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Ready to Survive?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
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
                  } catch {
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
