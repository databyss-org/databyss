import express from 'express'
import cors from 'cors'
import http from 'http'
import Bugsnag from '@bugsnag/js'
import ExpressSlowDown from 'express-slow-down'
import RedisStore from 'rate-limit-redis'
import { startBugsnag } from '@databyss-org/services/lib/bugsnag'
import BugsnagPluginExpress from '@bugsnag/plugin-express'
import { ApiError } from './lib/Errors'
import { connectDB } from './lib/db'

// routes
import usersRoute from './routes/api/users'
import authRoute from './routes/api/auth'
import pagesRoute from './routes/api/pages'
import accountsRoute from './routes/api/accounts'
import pingRoute from './routes/api/ping'
import versionRoute from './routes/api/version'
import echoRoute from './routes/api/echo'
import errorRoute from './routes/api/error'
import entriesRoute from './routes/api/entries'
import sourcesRoute from './routes/api/sources'
import topicsRoute from './routes/api/topics'
import { versionChecker } from './middleware/versionCheckMiddleware'

let app = null

const run = async () => {
  if (app) {
    return app
  }

  app = express()

  // Connect Database
  let dbURI = process.env.MONGO_URI
  if (process.env.LOCAL_ENV) {
    dbURI = process.env.LOCAL_MONGO_URI
  }

  await connectDB(dbURI)

  // Start Bugsnag
  startBugsnag({
    plugins: [BugsnagPluginExpress],
  })
  const bugsnagMiddleware = Bugsnag.getPlugin('express')
  app.use(bugsnagMiddleware.requestHandler)

  // Init Middleware
  app.use(cors())

  // set the max limit to 50mb
  app.use(express.json({ extended: false, limit: '50mb' }))

  app.get('/', (_req, res) => {
    res.redirect('https://app.databyss.org')
  })

  // configure rate limiting
  if (process.env.NODE_ENV !== 'test') {
    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // see https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', 1)

    // limit to 50 req / min / IP
    const limiterConfig = {
      windowMs: 1 * 60 * 1000,
      delayAfter: 20,
      delayMs: 500,
    }

    // store to REDIS on production environments
    if (process.env.NODE_ENV === 'production') {
      limiterConfig.store = new RedisStore({
        redisURL: process.env.REDIS_URL,
      })
    }

    const limiter = ExpressSlowDown(limiterConfig)

    // apply limiter to all requests
    app.use(limiter)
  }

  // Define Routes
  app.use('/api/users', versionChecker, usersRoute)
  app.use('/api/auth', versionChecker, authRoute)
  app.use('/api/pages', versionChecker, pagesRoute)
  app.use('/api/accounts', versionChecker, accountsRoute)
  app.use('/api/ping', versionChecker, pingRoute)
  app.use('/api/entries', versionChecker, entriesRoute)
  app.use('/api/sources', versionChecker, sourcesRoute)
  app.use('/api/topics', versionChecker, topicsRoute)
  app.use('/api/echo', versionChecker, echoRoute)
  app.use('/api/version', versionRoute)
  app.use('/api/error', errorRoute)

  // Bugsnag middleware must go before other error handler middleware
  app.use(bugsnagMiddleware.errorHandler)

  // Global error handler
  app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ error: err })
    }
    console.error('Unexpected error', err)
    return res.status(500).json({ error: { message: err.message } })
  })

  return app
}

export default run

// run as script in production
if (process.env.NODE_ENV === 'production') {
  const PORT = process.env.PORT
  // validate port
  if (!PORT) {
    console.error('The PORT environment variable must be set')
    process.exit()
  }
  // start server on port from env
  run().then((app) => {
    const httpServer = http.createServer(app)
    httpServer.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  })
}
