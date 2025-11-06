"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/app/_lib/supabase/client";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }: { data: { session: { user: { email?: string } } | null } }) => {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        try {
          subscription?.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
      };
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/log", label: "Public Log" },
    { href: "/apply", label: "Apply" },
  ];

  return (
    <header className="border-b border-white/10 glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
            Castaway Council
          </Link>
          <nav className="hidden md:flex gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
