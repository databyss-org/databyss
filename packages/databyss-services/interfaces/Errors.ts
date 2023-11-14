type DatabyssErrorName =
  | 'NetworkUnavailableError'
  | 'UnexpectedServerError'
  | 'NotAuthorizedError'
  | 'ResourceNotFoundError'
  | 'InvalidRequestError'
  | 'InsufficientPermissionError'
  | 'VersionConflictError'
  | 'UnauthorizedDatabaseReplication'

class DatabyssError extends Error {
  name: DatabyssErrorName

  constructor(message: string, name: DatabyssErrorName) {
    super()
    this.message = message
    this.name = name
  }
}

export class NetworkUnavailableError extends DatabyssError {
  constructor(message = 'Network Unavailable') {
    super(message, 'NetworkUnavailableError')
  }
}

export class UnexpectedServerError extends DatabyssError {
  info: any

  constructor(message = 'Unexpected Server Error', response: any) {
    super(message, 'UnexpectedServerError')
    this.info = response
  }
}

export class NotAuthorizedError extends DatabyssError {
  constructor(message = 'Not Authorized') {
    super(message, 'NotAuthorizedError')
  }
}

export class ResourceNotFoundError extends DatabyssError {
  constructor(message = 'Resource Not Found') {
    super(message, 'ResourceNotFoundError')
  }
}

export class InvalidRequestError extends DatabyssError {
  constructor(message = 'InvalidRequest') {
    super(message, 'InvalidRequestError')
  }
}

export class InsufficientPermissionError extends DatabyssError {
  constructor(message = 'Not Authorized') {
    super(message, 'InsufficientPermissionError')
  }
}

export class VersionConflictError extends DatabyssError {
  constructor(message = 'Version Conflict') {
    super(message, 'VersionConflictError')
  }
}

export class UnauthorizedDatabaseReplication extends DatabyssError {
  constructor(message = '[Error]') {
    super(message, 'UnauthorizedDatabaseReplication')
  }
}
