import { ResourceNotFoundError } from '../interfaces/Errors'

export const asyncErrorHandler = (fn: Function) => async (...args) => {
  try {
    return await fn(...args)
  } catch (err) {
    return new ResourceNotFoundError('database error')
  }
}
