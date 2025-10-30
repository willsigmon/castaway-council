import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

const RATE_LIMIT = 10; // messages per window
const WINDOW_MS = 30 * 1000; // 30 seconds

export function rateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store[key];

  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

export function rateLimitMiddleware(request: NextRequest) {
  // TODO: Extract user ID from session
  const userId = request.headers.get("x-user-id") || "anonymous";
  const channelId = request.nextUrl.searchParams.get("channel") || "default";
  const key = `${userId}:${channelId}`;

  const result = rateLimit(key);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.resetAt),
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
