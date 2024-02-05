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
  spinner?: ora.Ora
  outputLogFs?: fs.WriteStream
  errorLogFs?: fs.WriteStream
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
    this.args = args
    this.name = name
    this.outputLogFs = args.outputLogFs
    this.errorLogFs = args.errorLogFs

    if (this.args.spinner) {
      this.spinner = this.args.spinner
    }

    // create log streams if `--logs` was supplied
    if (this.args.logs && !this.outputLogFs) {
      this.initLogFiles()
    }
    this._patchConsole()
  }
  initLogFiles = () => {
    const logPath = path.join(this.args.logs, this.name.replace('.', '_'))
    fs.mkdirSync(logPath, {
      recursive: true,
    })
    this.logInfo('Created log directory', logPath)
    const _timestamp = fileFriendlyDateTime()
    this.errorLogFs = fs.createWriteStream(
      path.join(logPath, `errors_${_timestamp}.log`)
    )
    this.outputLogFs = fs.createWriteStream(
      path.join(logPath, `output_${_timestamp}.log`)
    )
  }
  closeLogFiles = () =>
    Promise.allSettled([
      new Promise<void>(
        (resolve) => this.errorLogFs?.end(resolve) ?? resolve()
      ),
      new Promise<void>(
        (resolve) => this.outputLogFs?.end(resolve) ?? resolve()
      ),
    ])
  _logRaw = (msg: string, oraPersistOptions?: ora.PersistOptions) => {
    if (this.spinner) {
      this.spinner
        .stopAndPersist(
          oraPersistOptions ?? {
            text: msg,
          }
        )
        .start()
    } else {
      this.stdout(`${msg}\n`)
    }
    return msg
  }
  _log = (...msgs: any) => {
    const _text = msgs.slice(1).join(' ')
    const _symbol = msgs[0]
    const _prefixText = `[${shortTimeString()}|${this.name}]`
    const _msg = `${_prefixText} ${_symbol} ${_text}`

    return this._logRaw(_msg, {
      prefixText: _prefixText,
      symbol: _symbol,
      text: _text,
    })
  }
  _format = (msgs: any[], symbol: string) => {
    let _symbol = symbol
    let _msgs = msgs
    if (Array.isArray(msgs) && msgs.length > 1 && msgs[0].length <= 2) {
      _symbol = msgs[0]
      _msgs = msgs.slice(1)
    }
    return [_symbol, ..._msgs]
  }
  logRaw = (msg: string) => this._logRaw(msg)
  log = (...msgs: any) => {
    this.logInfo(...this._format(msgs, '⬜️'))
  }
  logError = (...msgs: any) => {
    const _msgs = msgs.map((_m) => (_m instanceof Error ? _m.stack : _m))
    this.writeErrorLog(`${this._log(...this._format(_msgs, '🟥'))}\n`)
  }
  logInfo = (...msgs: any) => {
    this.writeLog(`${this._log(...msgs)}\n`)
  }
  logWarning = (...msgs: any) => this.logInfo(...this._format(msgs, '🔶'))
  logFailure = (...msgs: any) => this.logInfo(...this._format(msgs, '❌'))
  logSuccess = (...msgs: any) => this.logInfo(...this._format(msgs, '✅'))
  writeLog = (msg: string) => {
    if (this.outputLogFs) {
      this.outputLogFs.write(msg)
    }
  }
  writeErrorLog = (msg: string) => {
    if (this.errorLogFs) {
      this.errorLogFs.write(msg)
    }
  }

  /**
   * Run the job with CLI output
   */
  runCli = async () => {
    this.spinner = ora({
      stream: process.stdout,
    })
    this.on('end', async (success: boolean) => {
      this.spinner?.stop()
      await this.closeLogFiles()
      process.exit(success ? 0 : 1)
    })
    this.spinner?.start()
    this.run().then(this._shutdown).catch(this._shutdown)
  }
  /**
   * Run a server command with `exec` and capture its output
   * @param cmd command string
   */
  exec = (cmd: any) =>
    new Promise<void>((resolve, reject) => {
      this.logInfo(cmd)
      const child = exec(cmd)
      this._bindProcEvents(child)
      child.on('close', () => {
        resolve()
      })
      child.on('error', (data: any) => {
        reject(data)
      })
    })

  stdout = (msg: string) => process.stdout.write(msg)

  stderr = (msg: string | Error) => process.stderr.write(msg.toString())

  /**
   * Run a server command with `spawnd` and capture its output
   * @param cmd command string
   */
  spawn = (cmd: any) => {
    const proc = spawnd(cmd, {
      shell: true,
      env: process.env,
    })
    this._bindProcEvents(proc)
    return proc
  }
  _bindProcEvents = (proc: any) => {
    proc.stdout.on('data', (data: any) => {
      this.stdout(data)
      this.outputLogFs?.write(data)
    })
    proc.stderr.on('data', (data: any) => {
      this.stderr(data)
      this.errorLogFs?.write(data)
    })
  }
  _shutdown = async (err?: Error) => {
    if (err) {
      this.logFailure('Unhandled exception, see error log for details')
      this.logError(err)
    }
    await this.closeLogFiles()
    process.exit(err ? 1 : 0)
  }
  _patchConsole = () => {
    this._originalConsoleLog = console.log
    this._originalConsoleError = console.error
    console.log = (...msgs: any[]) => this.writeLog(this._log('⬛️', ...msgs))
    console.error = (...msgs: any[]) =>
      this.writeErrorLog(this._log('🟥', ...msgs))
  }
  _unpatchConsole = () => {
    console.log = this._originalConsoleLog
    console.error = this._originalConsoleError
  }
}

export default ServerProcess
