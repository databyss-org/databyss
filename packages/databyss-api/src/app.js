import express from 'express'
import cors from 'cors'
import http from 'http'
import Bugsnag from '@bugsnag/js'
import {
  updateSysDesignDocs,
  initiateDatabases,
} from '@databyss-org/data/cloudant'
import { startBugsnag } from '@databyss-org/services/lib/bugsnag'
import BugsnagPluginExpress from '@bugsnag/plugin-express'
import { ApiError } from './lib/Errors'

// routes
import usersRoute from './routes/api/users'
import authRoute from './routes/api/auth'
import cloudantRoute from './routes/api/cloudant'
import versionRoute from './routes/api/version'
import errorRoute from './routes/api/error'
import mediaRoute from './routes/api/media'
import logRoute from './routes/api/log'
// middleware
import { versionChecker } from './middleware/versionCheckMiddleware'
import { createRateController } from './middleware/rateControlMiddleware'

let app = null

const run = async () => {
  if (app) {
    return app
  }

  app = express()

  // couchdb routines
  await initiateDatabases()
  await updateSysDesignDocs()

  // bugsnag middleware must go first
  startBugsnag({
    plugins: [BugsnagPluginExpress],
    autoTrackSessions: false,
  })
  const bugsnagMiddleware = Bugsnag.getPlugin('express')
  app.use(bugsnagMiddleware.requestHandler)

  // rate limiter must go near the top of the chain
  if (process.env.NODE_ENV !== 'test') {
    const rateController = await createRateController(app)
    if (rateController) {
      app.use(rateController)
    } else {
      console.error('[app] 👎 falling back to no rate control')
    }
  }

  // Init Middleware
  app.use(cors())

  // set the max limit to 50mb
  app.use(express.json({ extended: false, limit: '50mb' }))

  app.get('/', (_req, res) => {
    res.redirect('https://app.databyss.org')
  })

  app.get('/api', (_req, res) => {
    res.status(200).send('👍')
  })

  // Define Routes
  app.use('/api/users', versionChecker, usersRoute)
  app.use('/api/auth', versionChecker, authRoute)
  app.use('/api/cloudant', versionChecker, cloudantRoute)
  app.use('/api/version', versionRoute)
  app.use('/api/error', errorRoute)
  app.use('/api/media', mediaRoute)
  app.use('/api/log', logRoute)
  // deprecated routes
  app.use('/api/pages', versionChecker)
  app.use('/api/accounts', versionChecker)
  app.use('/api/ping', versionChecker)
  app.use('/api/entries', versionChecker)
  app.use('/api/sources', versionChecker)
  app.use('/api/topics', versionChecker)
  app.use('/api/echo', versionChecker)

  // Bugsnag middleware must go before other error handler middleware
  app.use(bugsnagMiddleware.errorHandler)

  // Global error handler
  app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
      console.error('API error', err)
      res.status(err.status).json({ error: err })
    } else {
      console.error('Unexpected error', err)
      res.status(500).json({ error: { message: err.message } })
    }
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
