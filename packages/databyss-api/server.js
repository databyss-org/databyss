import chokidar from 'chokidar'
import path from 'path'
import http from 'http'
import mongoose from 'mongoose'
import { onShutdown } from 'node-graceful-shutdown'
import '../../config/env'
import { closeDB } from './src/lib/db'

const watchPath = path.resolve(process.cwd(), 'packages/databyss-api/src')
let httpServer = null

const start = () =>
  require('./src/app')
    .default()
    .then(app => {
      const PORT = process.env.PORT || 5000
      httpServer = http.createServer(app)
      httpServer.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`)
      })
    })

const restart = async () => {
  console.log('closing database connections...')
  await closeDB()

  console.log('clearing mongoose caches...')
  mongoose.connection.models = {}
  mongoose.models = {}

  console.log('Reloading', watchPath)
  Object.keys(require.cache).forEach(id => {
    if (id.startsWith(watchPath)) {
      delete require.cache[id]
    }
  })

  console.log('shutting down server...')
  httpServer.close(() => {
    console.log('restarting server...')
    start()
  })
}

onShutdown('database', async () => {
  console.log('closing database connections...')
  await closeDB()
})

start().then(() => {
  // watch for changes
  const watcher = chokidar.watch(watchPath)
  watcher.on('ready', () => {
    console.log('watching for changes in', watchPath)
    watcher.on('all', (event, at) => {
      console.log(`detected ${event}: ${at}`)
      restart()
    })
  })
})
