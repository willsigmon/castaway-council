import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { UnauthorizedError } from "./errors";

export async function getServerSession() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Get the current user ID from the session
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}
