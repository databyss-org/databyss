export class NotAuthorizedError extends Error {
  constructor(message) {
    super()
    this.message = message
  }
}
