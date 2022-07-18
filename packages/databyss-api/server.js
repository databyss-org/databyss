import chokidar from 'chokidar'
import path from 'path'
import http from 'http'
import '../../config/env'

const watchPaths = [
  path.resolve(process.cwd(), 'packages/databyss-api/src'),
  path.resolve(process.cwd(), 'packages/databyss-services'),
]
let httpServer = null

const start = () =>
  require('./src/app')
    .default()
    .then((app) => {
      const PORT = process.env.PORT || 5050
      httpServer = http.createServer(app)
      httpServer.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`)
      })
    })

const restart = async () => {
  console.log('closing database connections...')

  console.log('Reloading...')
  Object.keys(require.cache).forEach((id) => {
    watchPaths.forEach((path) => {
      if (id.startsWith(path)) {
        delete require.cache[id]
      }
    })
  })

  console.log('shutting down server...')
  httpServer.close(() => {
    console.log('restarting server...')
    start()
  })
}

start().then(() => {
  // watch for changes
  const watcher = chokidar.watch(watchPaths)
  watcher.on('ready', () => {
    console.log('watching for changes in', watchPaths)
    watcher.on('all', (event, at) => {
      console.log(`detected ${event}: ${at}`)
      restart()
    })
  })
})
