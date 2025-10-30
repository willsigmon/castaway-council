/**
 * Centralized error handling for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  this.code = "UNAUTHORIZED";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    public fields?: Record<string, string[]>
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Format error for API response
 */
export function formatError(error: unknown): {
  error: string;
  code?: string;
  fields?: Record<string, string[]>;
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      ...(error instanceof ValidationError && error.fields
        ? { fields: error.fields }
        : {}),
    };
  }

  if (error instanceof Error) {
    // Don't leak internal error messages in production
    if (process.env.NODE_ENV === "production") {
      return {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      };
    }
    return {
      error: error.message,
      code: "ERROR",
    };
  }

  return {
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}

/**
 * Handle errors in API routes and return appropriate response
 */
export function handleApiError(error: unknown): {
  response: Response;
  logMessage?: string;
} {
  if (error instanceof AppError) {
    return {
      response: Response.json(formatError(error), {
        status: error.statusCode,
      }),
      logMessage:
        error.statusCode >= 500 ? error.message : undefined, // Only log server errors
    };
  }

  // Log unexpected errors
  const logMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    response: Response.json(formatError(error), { status: 500 }),
    logMessage,
  };
}
