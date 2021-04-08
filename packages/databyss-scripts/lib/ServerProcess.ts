import ora from 'ora'
import yargs from 'yargs'
import fs from 'fs'
import path from 'path'
import { EnvDict } from './util'

const spawnd = require('spawnd')
const EventEmitter = require('events')
const { exec } = require('child_process')

export interface ServerProcessArgs extends Omit<yargs.Argv, 'env'> {
  env: EnvDict
  envName: string
  [name: string]: any
}

export function shortTimeString(date?: Date) {
  return (date ?? new Date()).toISOString().split('T')[1].substr(0, 11)
}

export function fileFriendlyDateTime(date?: Date) {
  return (date ?? new Date()).toISOString().replace(/[^a-zA-Z0-9]/g, '-')
}

class ServerProcess extends EventEmitter {
  args
  name: string
  spinner?: ora.Ora
  errorLogFs?: fs.WriteStream
  outputLogFs?: fs.WriteStream

  constructor(args: ServerProcessArgs, name: string) {
    super()
    this.exec = this.exec.bind(this)
    this.spawn = this.spawn.bind(this)
    this._shutdown = this._shutdown.bind(this)
    this.args = args
    this.name = name

    // create log streams if `--logs` was supplied
    if (this.args.logs) {
      this.initLogFiles()
    }
    this._patchConsole()
  }
  initLogFiles() {
    const logPath = path.join(this.args.logs, this.name.replace('.', '_'))
    fs.mkdirSync(logPath, {
      recursive: true,
    })
    console.log('Created log directory', logPath)
    this.errorLogFs = fs.createWriteStream(
      path.join(logPath, `errors_${fileFriendlyDateTime()}.log`)
    )
    this.outputLogFs = fs.createWriteStream(
      path.join(logPath, `output_${fileFriendlyDateTime()}.log`)
    )
  }
  closeLogFiles() {
    return Promise.allSettled([
      new Promise<void>(
        (resolve) => this.errorLogFs?.end(resolve) ?? resolve()
      ),
      new Promise<void>(
        (resolve) => this.outputLogFs?.end(resolve) ?? resolve()
      ),
    ])
  }
  _log(...msgs: any) {
    let symbol = '⬜️'
    let text = msgs.join(' ')
    if (Array.isArray(msgs) && msgs.length > 1 && msgs[0].length <= 2) {
      symbol = msgs[0]
      text = msgs.slice(1).join(' ')
    }
    const prefixText = `[${shortTimeString()}|${this.name}]`
    const msg = `${prefixText} ${symbol} ${text}`

    if (this.spinner) {
      this.spinner.stopAndPersist({ prefixText, symbol, text }).start()
    } else {
      console.log(msg)
    }
    return msg
  }
  log(...msgs: any) {
    this.logInfo(...msgs)
  }
  logError(...msgs: any) {
    this.writeErrorLog(`${this._log('🟥', ...msgs)}\n`)
  }
  logInfo(...msgs: any) {
    this.writeLog(`${this._log(...msgs)}\n`)
  }
  logWarning(...msgs: any) {
    return this.logInfo('🔶', ...msgs)
  }
  logFailure(...msgs: any) {
    return this.logInfo('❌', ...msgs)
  }
  logSuccess(...msgs: any) {
    return this.logInfo('✅', ...msgs)
  }
  writeLog(msg: string) {
    if (this.outputLogFs) {
      this.outputLogFs.write(msg)
      return true
    }
    return false
  }
  writeErrorLog(msg: string) {
    if (this.errorLogFs) {
      this.errorLogFs.write(msg)
      return true
    }
    return false
  }

  /**
   * Run the job with CLI output
   */
  async runCli() {
    this.spinner = ora({
      stream: process.stdout,
    })
    this.on('end', async (success: boolean) => {
      this.spinner!.stop()
      await this.closeLogFiles()
      process.exit(success ? 0 : 1)
    })
    this.spinner!.start()
    this.run().then(this._shutdown).catch(this._shutdown)
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
      this.outputLogFs?.write(data)
    })
    proc.stderr.on('data', (data: any) => {
      this.stdErr(data)
    })
  }
  async _shutdown(err?: Error) {
    if (err) {
      this.stdErr(err)
    }
    await this.closeLogFiles()
    process.exit(err ? 1 : 0)
  }
  _patchConsole() {
    console.log = (...msgs: any[]) => this.writeLog(this._log('⬛️', ...msgs))
    console.error = (...msgs: any[]) =>
      this.writeErrorLog(this._log('🟥', ...msgs))
  }
}

export default ServerProcess
