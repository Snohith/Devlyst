export class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL_ERROR", details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Request validation failed", details) {
    super(message, { status: 422, code: "VALIDATION_ERROR", details });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { status: 401, code: "UNAUTHENTICATED" });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, { status: 404, code });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", code = "CONFLICT") {
    super(message, { status: 409, code });
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, { status: 429, code: "RATE_LIMITED" });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "An external service failed", details) {
    super(message, { status: 502, code: "EXTERNAL_SERVICE_ERROR", details });
  }
}
