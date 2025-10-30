"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/log", label: "Public Log" },
  ];

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition-colors">
            Castaway Council
          </Link>
          <nav className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded transition-colors ${
                  pathname === link.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-6 bg-gray-800 rounded animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

