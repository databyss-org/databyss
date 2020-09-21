import { version } from './../../package.json'
import { ApiError, BadRequestError } from '../lib/Errors'

export const versionChecker = (req, res, next) => {
  const databyssVersion = req.header('x-databyss-version')
  // bail on checking version if asking for version
  if (req.path === '/api/version') {
    return next()
  }
  if (!databyssVersion) {
    return next(new BadRequestError(`missing version in header`))
  }
  if (databyssVersion !== version) {
    return next(
      new ApiError(
        `request version (${databyssVersion}) does not match API version (${version})`,
        409
      )
    )
  }

  return next()
}
