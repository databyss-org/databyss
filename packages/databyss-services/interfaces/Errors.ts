export class NetworkUnavailableError extends Error {
  constructor(message = 'Network Unavailable') {
    super()
    this.message = message
  }
}

export class UnexpectedServerError extends Error {
  info: any

  constructor(message = 'Unexpected Server Error', response: any) {
    super()
    this.message = message
    this.info = response
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

export class InvalidRequestError extends Error {
  constructor(message = 'InvalidRequest') {
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

export class VersionConflictError extends Error {
  constructor(message = 'Version Conflict') {
    super()
    this.message = message
  }
}

export class UnauthorizedDatabaseReplication extends Error {
  constructor(message = '[Error]') {
    super()
    this.message = `${message} Unauthorized Database Replication`
  }
}
