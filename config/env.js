const fs = require('fs')
const path = require('path')
const paths = require('./paths')

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')]

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  )
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  paths.dotenv,
].filter(Boolean)

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    )
  }
})

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
// https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd())
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter)

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
let ENV_PREFIX = /^REACT_APP_/i
if (process.env.ENV_PREFIX) {
  ENV_PREFIX = new RegExp(`^${process.env.ENV_PREFIX}`, 'i')
}

// For more configurability, we customize the `env.js` script to
// remove the prefix from environment variables targets, so you only have
// to do `process.env.API_URL` instead of `process.env.REACT_APP_API_URL`
// This will emit a warning if the environment variable already exists
Object.keys(process.env)
  .filter(key => ENV_PREFIX.test(key))
  .forEach(key => {
    const nextKey = key.replace(ENV_PREFIX, '')
    if (process.env[nextKey]) {
      console.warn('Warning, rewriting existing environment variable', nextKey)
    }
    process.env[nextKey] = process.env[key]
  })

// If we are building for a review app, we have three variables at our disposal:
// HEROKU_APP_NAME, HEROKU_BRANCH, HEROKU_PR_NUMBER
// https://devcenter.heroku.com/articles/github-integration-review-apps#injected-environment-variables
// Look for these tokens in the `value` param and replace them with the current ENV
function replaceHerokuReviewAppTokens(value) {
  let _value = value
  ;['HEROKU_APP_NAME', 'HEROKU_BRANCH', 'HEROKU_PR_NUMBER'].forEach(key => {
    if (process.env[key]) {
      _value = _value.replace(`\${${key}}`, process.env[key])
    }
  })
  return _value
}

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => ENV_PREFIX.test(key))
    .reduce(
      (env, key) => {
        env[key.replace(ENV_PREFIX, '')] = replaceHerokuReviewAppTokens(
          process.env[key]
        )
        return env
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
      }
    )
  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

module.exports = getClientEnvironment
