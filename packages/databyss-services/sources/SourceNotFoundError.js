export class ResourceNotFoundError extends Error {
  constructor(message, sourceId) {
    super()
    this.message = message
    this.sourceId = sourceId
  }
}
