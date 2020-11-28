const spawnd = require('spawnd')
const EventEmitter = require('events')
const { exec } = require('child_process')

class ServerProcess extends EventEmitter {
  constructor() {
    super()
    this.exec = this.exec.bind(this)
    this.spawn = this.spawn.bind(this)
  }
  log(...msgs: any) {
    this.stdOut(...msgs)
  }
  stdOut(...msgs: any) {
    this.emit('stdout', msgs.join(' '))
  }
  stdErr(...msgs: any) {
    this.emit('stderr', msgs.join(' '))
  }
  exec(cmd: any) {
    return new Promise((resolve, reject) => {
      this.stdOut(cmd)
      const child = exec(cmd)
      this._bindProcEvents(child)
      child.on('close', () => {
        resolve()
      })
      child.on('error', (data: any) => {
        reject(data)
      })
    })
  }
  spawn(cmd: any) {
    const proc = spawnd(cmd, {
      shell: true,
      env: process.env,
    })
    this._bindProcEvents(proc)
    return proc
  }
  _bindProcEvents(proc: any) {
    proc.stdout.on('data', (data: any) => {
      this.stdOut(data)
    })
    proc.stderr.on('data', (data: any) => {
      this.stdErr(data)
    })
  }
}

export default ServerProcess
