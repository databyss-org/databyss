class BadRefIdError extends Error {
  constructor(refId, status) {
    super()
    this._id = refId
    this.message = `Bad Ref Id for: ${refId}`
    this.status = status
  }
}

export default BadRefIdError
