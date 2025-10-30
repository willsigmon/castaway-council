// Placeholder for Supabase types
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          handle: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          handle: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          handle?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
