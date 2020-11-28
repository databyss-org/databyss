import chokidar from 'chokidar'
import path from 'path'
import http from 'http'

const watchPath = path.resolve(process.cwd(), 'packages/databyss-pdf-api/src')
let httpServer = null

const start = () =>
  require('./src/app')
    .default()
    .then((app) => {
      const PORT = process.env.PORT || 5005

      httpServer = http.createServer(app)
      httpServer.listen(PORT, () => {
        console.log(`⚙️ Started annotations parsing webservice on port ${PORT}`)
      })
    })

const restart = async () => {
  console.log('Reloading', watchPath)
  Object.keys(require.cache).forEach((id) => {
    if (id.startsWith(watchPath)) {
      delete require.cache[id]
    }
  })

  console.log('Shutting down server...')
  httpServer.close(() => {
    console.log('Restarting server...')
    start()
  })
}

start().then(() => {
  // watch for changes
  const watcher = chokidar.watch(watchPath)
  watcher.on('ready', () => {
    console.log('👁  Watching for changes in', watchPath)
    watcher.on('all', (event, at) => {
      console.log(`❗️ Detected ${event}: ${at}`)
      restart()
    })
  })
})
