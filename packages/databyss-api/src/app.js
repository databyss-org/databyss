import express from 'express'
import cors from 'cors'
import http from 'http'
import bugsnag from './middleware/bugsnag'
import ApiError from './lib/ApiError'
import { connectDB } from './lib/db'

// routes
import usersRoute from './routes/api/users'
import authRoute from './routes/api/auth'
import profileRoute from './routes/api/profile'
import pagesRoute from './routes/api/pages'
import accountsRoute from './routes/api/accounts'
import sourcesRoute from './routes/api/sources'
import topicsRoute from './routes/api/topics'
import pingRoute from './routes/api/ping'
import errorRoute from './routes/api/error'

let app = null
let bugsnagMiddleware

const run = async () => {
  if (app) {
    return app
  }

  app = express()

  // Connect Database
  await connectDB()

  // This must be the first piece of middleware in the stack.
  // It can only capture errors in downstream middleware
  if (process.env.NODE_ENV !== 'test') {
    bugsnagMiddleware = await bugsnag()
    app.use(bugsnagMiddleware.requestHandler)
  }

  // Init Middleware
  app.use(cors())
  app.use(express.json({ extended: false }))

  // Define Routes
  app.use('/api/users', usersRoute)
  app.use('/api/auth', authRoute)
  app.use('/api/profile', profileRoute)
  app.use('/api/pages', pagesRoute)
  app.use('/api/accounts', accountsRoute)
  app.use('/api/sources', sourcesRoute)
  app.use('/api/topics', topicsRoute)
  app.use('/api/ping', pingRoute)
  app.use('/api/error', errorRoute)

  // global error middleware
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res) => {
    if (err instanceof ApiError) {
      res.status(err.status).send(err.message)
    } else {
      throw err
    }
  })

  // This handles any errors that Express catches and must be the last middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(bugsnagMiddleware.errorHandler)
  }

  app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
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
