import { version } from './../../package.json'
import { BadRequestError, VersionMismatchError } from '../lib/Errors'

export const versionChecker = (req, res, next) => {
  const databyssVersion = req.header('x-databyss-version')
  if (!databyssVersion) {
    return next(new BadRequestError(`missing version in header`))
  }
  if (databyssVersion !== version) {
    return next(new VersionMismatchError(databyssVersion))
  }

  return next()
}
