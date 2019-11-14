export class SourceNotFoundError extends Error {
  constructor(message, sourceId) {
    super()
    this.message = message
    this.sourceId = sourceId
  }
}

export class NotAuthorized extends Error {
  constructor(message, sourceId) {
    super()
    this.message = message
    this.sourceId = sourceId
  }
}
