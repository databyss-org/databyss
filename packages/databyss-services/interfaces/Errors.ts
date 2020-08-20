export class NetworkUnavailableError extends Error {
  constructor(message = 'Network Unavailable') {
    super()
    this.message = message
  }
}

export class NotAuthorizedError extends Error {
  constructor(message = 'Not Authorized') {
    super()
    this.message = message
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message = 'Resource Not Found') {
    super()
    this.message = message
  }
}

export class InsufficientPermissionError extends Error {
  constructor(message = 'Not Authorized') {
    super()
    this.message = message
  }
}
