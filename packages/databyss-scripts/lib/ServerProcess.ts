import ora from 'ora'
import { EnvDict } from './util'

const spawnd = require('spawnd')
const EventEmitter = require('events')
const { exec } = require('child_process')

export interface ServerProcessArgs {
  env: EnvDict
  envName: string
}

export function shortTimeString(date?: Date) {
  return (date ?? new Date()).toISOString().split('T')[1].substr(0, 11)
}

class ServerProcess extends EventEmitter {
  args
  name: string
  spinner?: ora.Ora

  constructor(args: ServerProcessArgs, name: string) {
    super()
    this.exec = this.exec.bind(this)
    this.spawn = this.spawn.bind(this)
    this.args = args
    this.name = name
  }
  log(...msgs: any) {
    this.stdOut(...msgs)
  }
  logError(...msgs: any) {
    this.stdErr(...msgs)
  }
  logInfo(...msgs: any) {
    let symbol = 'ℹ️ '
    let text = msgs.join(' ')
    if (Array.isArray(msgs) && msgs.length > 1 && msgs[0].length <= 2) {
      symbol = msgs[0]
      text = msgs.slice(1).join(' ')
    }
    return (
      this.spinner
        ?.stopAndPersist({
          symbol,
          text,
          prefixText: `[${shortTimeString()}|${this.name}]`,
        })
        .start() || this.stdOut(`${symbol} ${text}`)
    )
  }
  logWarning(...msgs: any) {
    return this.logInfo('⚠️', ...msgs)
  }
  logFailure(...msgs: any) {
    return this.logInfo('❌', ...msgs)
  }
  logSuccess(...msgs: any) {
    return this.logInfo('✅', ...msgs)
  }
  stdOut(...msgs: any) {
    this.emit('stdout', msgs.join(' '))
  }
  stdErr(...msgs: any) {
    this.emit('stderr', `[${shortTimeString()}|${this.name}] ${msgs.join(' ')}`)
  }
  /**
   * Run the job with CLI output
   */
  runCli() {
    this.spinner = ora({
      stream: process.stdout,
    })
    this.on('end', (success) => {
      this.spinner!.stop()
      process.exit(success ? 0 : 1)
    })
    this.on('stdout', (msg) => {
      console.log(msg)
    })
    this.on('stderr', (msg) => {
      console.error(msg)
    })
    this.spinner!.start()
    this.run()
      .then(() => process.exit())
      .catch((err) => {
        this.stdErr(err)
        process.exit(1)
      })
  }
  /**
   * Run a server command with `exec` and capture its output
   * @param cmd command string
   */
  exec(cmd: any) {
    return new Promise<void>((resolve, reject) => {
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
  /**
   * Run a server command with `spawnd` and capture its output
   * @param cmd command string
   */
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
