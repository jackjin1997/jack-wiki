export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error') {
    super(message, 'INTERNAL_SERVER_ERROR', 500)
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string = 'External service error', service?: string) {
    super(service ? `${service}: ${message}` : message, 'EXTERNAL_SERVICE_ERROR', 502)
  }
}
