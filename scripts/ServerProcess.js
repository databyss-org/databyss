const EventEmitter = require('events')
const { exec } = require('child_process')

class ServerProcess extends EventEmitter {
  log(...msgs) {
    this.stdOut(...msgs)
  }
  stdOut(...msgs) {
    this.emit('stdout', msgs.join(' '))
  }
  stdErr(...msgs) {
    this.emit('stderr', msgs.join(' '))
  }
  exec(cmd) {
    return new Promise((resolve, reject) => {
      this.stdOut(cmd)
      const child = exec(cmd)
      child.stdout.on('data', data => {
        this.stdOut(data)
      })
      child.stderr.on('data', data => {
        this.stdErr(data)
      })
      child.on('close', () => {
        resolve()
      })
      child.on('error', data => {
        reject(data)
      })
    })
  }
}

module.exports = ServerProcess
