import { VersionMismatchError } from '../lib/Errors'

export const versionChecker = (req, _res, next) => {
  const databyssVersion = req.header('x-databyss-version')
  if (!databyssVersion) {
    return next()
  }
  if (databyssVersion.startsWith('1.')) {
    return next(new VersionMismatchError(databyssVersion))
  }

  return next()
}
