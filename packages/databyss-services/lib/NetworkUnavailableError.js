export class NetworkUnavailableError extends Error {
  constructor(message) {
    super()
    this.message = message
  }
}
