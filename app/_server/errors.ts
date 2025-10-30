import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for debugging (in production, use structured logging)
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: (error as { issues: unknown[] }).issues,
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Structured logging utility
 * In production, this should integrate with logging service (e.g., Sentry, DataDog)
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  } else {
    console.error("Error:", errorDetails);
  }
}

/**
 * Wrapper for API route handlers that automatically handles errors
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error);
      return handleApiError(error);
    }
  };
}
