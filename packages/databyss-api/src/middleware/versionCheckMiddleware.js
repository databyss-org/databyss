import { version } from './../../package.json'

export const versionChecker = (req, res, next) => {
  const databyssVersion = req.header('x-databyss-version')
  // header not sent, bail on checking version
  if (!databyssVersion) {
    return next()
  }
  if (databyssVersion !== version) {
    return res.status(409).json({ msg: 'update version' })
  }

  return next()
}
