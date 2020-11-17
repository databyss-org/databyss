const spawnd = require('spawnd')
const EventEmitter = require('events')
const { exec } = require('child_process')

class ServerProcess extends EventEmitter {
  constructor() {
    super()
    this.exec = this.exec.bind(this)
    this.spawn = this.spawn.bind(this)
  }
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
      this._bindProcEvents(child)
      child.on('close', () => {
        resolve()
      })
      child.on('error', (data) => {
        reject(data)
      })
    })
  }
  spawn(cmd) {
    const proc = spawnd(cmd, {
      shell: true,
      env: process.env,
    })
    this._bindProcEvents(proc)
    return proc
  }
  _bindProcEvents(proc) {
    proc.stdout.on('data', (data) => {
      this.stdOut(data)
    })
    proc.stderr.on('data', (data) => {
      this.stdErr(data)
    })
  }
}

export default ServerProcess
