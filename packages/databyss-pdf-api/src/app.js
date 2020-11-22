import express from 'express'
import cors from 'cors'
import http from 'http'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { ApiError } from '@databyss-org/api/src/lib/Errors'

// routes
import parseRoute from './routes/pdf-api/parse'

let app = null

const run = async () => {
  if (app) {
    return app
  }

  app = express()

  // Init Bugsnag
  if (process.env.NODE_ENV !== 'test') {
    Bugsnag.init()
  }

  // Init Middleware
  app.use(cors())

  app.get('/', (_req, res) => {
    res.redirect('https://app.databyss.org')
  })

  // Define Routes
  app.use('/api/pdf/parse', parseRoute)

  app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
      // TODO: log error on bugsnag
      return res.status(err.status).json({ error: err })
    }
    console.error('ERR', err)
    Bugsnag.client.notify(err)
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
