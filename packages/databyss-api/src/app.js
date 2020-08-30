import express from 'express'
import cors from 'cors'
import http from 'http'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { ApiError } from './lib/Errors'
import { connectDB } from './lib/db'

// routes
import usersRoute from './routes/api/users'
import authRoute from './routes/api/auth'
import pagesRoute from './routes/api/pages'
import accountsRoute from './routes/api/accounts'
import pingRoute from './routes/api/ping'
import echoRoute from './routes/api/echo'
import errorRoute from './routes/api/error'
import entriesRoute from './routes/api/entries'
import sourcesRoute from './routes/api/sources'
import topicsRoute from './routes/api/topics'

let app = null

const run = async () => {
  if (app) {
    return app
  }

  app = express()

  // Connect Database
  await connectDB()

  // Init Bugsnag
  // if (process.env.NODE_ENV !== 'test') {
  Bugsnag.init()
  // }

  // Init Middleware
  app.use(cors())

  // set the max limit to 50mb
  app.use(express.json({ extended: false, limit: '50mb' }))

  app.get('/', (_req, res) => {
    res.redirect('https://app.databyss.org')
  })

  // Define Routes
  app.use('/api/users', usersRoute)
  app.use('/api/auth', authRoute)
  app.use('/api/pages', pagesRoute)
  app.use('/api/accounts', accountsRoute)
  app.use('/api/ping', pingRoute)
  app.use('/api/echo', echoRoute)
  app.use('/api/error', errorRoute)
  app.use('/api/entries', entriesRoute)
  app.use('/api/sources', sourcesRoute)
  app.use('/api/topics', topicsRoute)

  app.use((err, _req, res, _next) => {
    Bugsnag.client.notify(err)
    if (err instanceof ApiError) {
      return res.status(err.status).json({ error: err })
    }
    console.error('ERR', err)
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
  run().then(app => {
    const httpServer = http.createServer(app)
    httpServer.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  })
}
