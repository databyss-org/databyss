export class ApiError extends Error {
  constructor(message, status) {
    super()
    this.message = message
    this.status = status
  }
}
export class BadRequestError extends ApiError {
  constructor(message, status = 500) {
    const _message = `Invalid request. ${message}`
    super(_message, status)
  }
}
export class ResourceNotFoundError extends ApiError {
  constructor(message, status = 404) {
    const _message = `Resource not found. ${message}`
    super(_message, status)
  }
}
export class UnauthorizedError extends ApiError {
  constructor(message, status = 401) {
    const _message = `Not authorized. ${message}`
    super(_message, status)
  }
}

export class InsufficientPermissionError extends ApiError {
  constructor(message, status = 403) {
    const _message = `Not authorized. ${message}`
    super(_message, status)
  }
}
