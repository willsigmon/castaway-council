import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Mock client type for when Supabase is not configured
type MockSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { user: { email?: string } } | null }; error: null }>;
    signOut: () => Promise<{ error: null }>;
    signInWithPassword: () => Promise<{ data: { session: null }; error: Error }>;
    signUp: () => Promise<{ data: { session: null }; error: Error }>;
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } };
  };
  channel: () => {
    on: (
      _type: string,
      _filter: unknown,
      _callback: (payload: { new: { id: string; from_player_id: string; body: string; created_at: string } }) => void
    ) => { subscribe: () => void };
  };
  removeChannel: () => void;
};

let mockClient: MockSupabaseClient | null = null;

function getMockClient(): MockSupabaseClient {
  if (!mockClient) {
    mockClient = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error("Not configured") }),
        signUp: async () => ({ data: { session: null }, error: new Error("Not configured") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => ({
        on: (
          _type: string,
          _filter: unknown,
          _callback?: (payload: { new: { id: string; from_player_id: string; body: string; created_at: string } }) => void
        ) => ({ subscribe: () => {} }),
      }),
      removeChannel: () => {},
    };
  }
  return mockClient;
}

export function getSupabaseClient(): ReturnType<typeof createClientComponentClient<Database>> | MockSupabaseClient {
  // Check if Supabase env vars are available (client-side)
  // NEXT_PUBLIC_ vars are injected at build time and available in browser
  if (typeof window !== "undefined") {
    // In browser - check if we have the required env vars
    // We can't directly check process.env in runtime, but we can try-catch the client creation
    if (!supabaseClient) {
      try {
        supabaseClient = createClientComponentClient<Database>();
      } catch {
        // Return a mock client that won't crash
        console.warn("Supabase not configured, using fallback");
        return getMockClient();
      }
    }
    return supabaseClient;
  }
  
  // Server-side: always try to create client
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient<Database>();
    } catch {
      return getMockClient();
    }
  }
  return supabaseClient;
}
