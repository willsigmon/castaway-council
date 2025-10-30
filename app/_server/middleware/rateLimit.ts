import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/auth";
import { logger } from "@/server/logger";

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

// In-memory store - TODO: Replace with Redis for production serverless
const store: RateLimitStore = {};

const RATE_LIMIT = 10; // messages per window
const WINDOW_MS = 30 * 1000; // 30 seconds

/**
 * Rate limit check - uses in-memory store
 * NOTE: This won't work across serverless instances. For production,
 * use Redis (e.g., @upstash/ratelimit) for distributed rate limiting.
 */
export function rateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store[key];

  // Clean up expired entries periodically (simple approach)
  if (Object.keys(store).length > 1000) {
    const expired = Object.keys(store).filter(
      (k) => store[k].resetAt < now
    );
    expired.forEach((k) => delete store[k]);
  }

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

/**
 * Rate limit middleware for API routes
 * Extracts user ID from session for authenticated users,
 * falls back to IP address for anonymous users
 */
export async function rateLimitMiddleware(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const channelId = request.nextUrl.searchParams.get("channel") || "default";
    
    // Use user ID if authenticated, otherwise use IP address
    // In production, consider using a combination for better tracking
    const identifier = userId || request.ip || request.headers.get("x-forwarded-for") || "anonymous";
    const key = `${identifier}:${channelId}`;

    const result = rateLimit(key);

    if (!result.allowed) {
      logger.warn("Rate limit exceeded", { userId, channelId, ip: request.ip });
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
  } catch (error) {
    // If rate limiting fails, log but don't block the request
    // This prevents rate limiting from breaking the app
    logger.error("Rate limit check failed", { error });
    return null;
  }
}
