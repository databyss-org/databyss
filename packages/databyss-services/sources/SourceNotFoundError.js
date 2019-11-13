export default class SourceNotFoundError extends Error {
  constructor(message, sourceId) {
    super()
    this.message = message
    this.sourceId = sourceId
  }
}

// class SourceNotFoundError extends Error {
//   constructor(message, status) {
//     super()
//     this.message = message
//     this.status = status
//   }
// }

// module.exports = SourceNotFoundError
