export default class SourceNotFoundError extends Error {
  constructor(message, sourceId) {
    super()
    this.message = message
    this.sourceId = sourceId
  }
}
