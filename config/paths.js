const path = require('path')
const fs = require('fs')
const url = require('url')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

const envPublicUrl = process.env.PUBLIC_URL

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/')
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1)
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`
  }
  return inputPath
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson)
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/')
  return ensureSlash(servedUrl, true)
}

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  )

  if (extension) {
    return resolveFn(`${filePath}.${extension}`)
  }

  return resolveFn(`${filePath}.js`)
}

function getAppIndexJs(deployTarget) {
  switch (deployTarget) {
    case 'LOGIN_APP': {
      return resolveApp('packages/databyss-login/index.js')
    }
    case 'NOTES_APP': {
      return resolveApp('packages/databyss-notes/index.js')
    }
    case 'TEST':
    case 'API_SERVER':
    case 'PDF_API': {
      return null
    }
    default: {
      throw new Error(`Invalid deployTarget: ${deployTarget}`)
    }
  }
}

function getAppBuild(deployTarget) {
  switch (deployTarget) {
    case 'LOGIN_APP': {
      return resolveApp('build/login')
    }
    case 'NOTES_APP': {
      return resolveApp('build')
    }
    case 'API_SERVER':
    case 'PDF_API': {
      return resolveApp('build/api')
    }
    case 'TEST': {
      return null
    }
    default: {
      throw new Error(`Invalid deployTarget: ${deployTarget}`)
    }
  }
}

function getAppDevPublic(deployTarget) {
  switch (deployTarget) {
    case 'LOGIN_APP': {
      return resolveApp('public')
    }
    case 'NOTES_APP': {
      return resolveApp('build')
    }
    case 'TEST':
    case 'API_SERVER': {
      return null
    }
    default: {
      throw new Error(`Invalid deployTarget: ${deployTarget}`)
    }
  }
}

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: getAppBuild(process.env.NPM_BUILD_TARGET),
  appPublic: resolveApp('public'),
  appDevPublic: getAppDevPublic(process.env.NPM_BUILD_TARGET),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: getAppIndexJs(process.env.NPM_BUILD_TARGET),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('packages'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
}

module.exports.moduleFileExtensions = moduleFileExtensions
