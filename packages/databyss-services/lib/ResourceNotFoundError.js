export class ResourceNotFoundError extends Error {
  constructor(message) {
    super()
    this.message = message
  }
}
