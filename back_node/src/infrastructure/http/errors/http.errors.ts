export interface IHttpError extends Error {
  readonly status: number;
  readonly message: string;
  readonly details?: unknown;
  readonly cause?: unknown;
  readonly timestamp: string;
}

export class HttpError extends Error implements IHttpError {
  public readonly status: number;
  public readonly details?: unknown;
  public readonly cause?: unknown;
  public readonly timestamp: string;

  constructor(status: number, message: string, details?: unknown, cause?: unknown) {
    super(message);

    this.name = new.target.name;
    this.status = status;
    this.details = details;
    this.cause = cause;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details?: unknown, cause?: unknown) {
    super(400, message, details, cause);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', details?: unknown, cause?: unknown) {
    super(401, message, details, cause);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', details?: unknown, cause?: unknown) {
    super(403, message, details, cause);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', details?: unknown, cause?: unknown) {
    super(404, message, details, cause);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', details?: unknown, cause?: unknown) {
    super(409, message, details, cause);
  }
}

export class InternalServerError extends HttpError {
  constructor(
    message = 'Internal Server Error',
    details?: unknown,
    cause?: unknown,
  ) {
    super(500, message, details, cause);
  }
}
