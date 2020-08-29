import tmp from 'tmp'
import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

interface EnvDict {
  [key: string]: string
}

interface JobArgs {
  fromEnv: string
  toEnv: string
}

class CopyDatabase extends ServerProcess {
  args: JobArgs
  fromEnv: EnvDict
  toEnv: EnvDict
  tmpDir: { name: string, removeCallback: Function }
  fromDb: string | undefined
  toDb: string | undefined

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.fromEnv = getEnv(args.fromEnv)
    this.toEnv = getEnv(args.toEnv)
    this.fromDb = this.fromEnv.API_MONGO_URI.match(/\/([^/]+?)\?/)?.[1]
    this.toDb = this.toEnv.API_MONGO_URI.match(/\/([^/]+?)\?/)?.[1]
    this.tmpDir = tmp.dirSync({ unsafeCleanup: true })
  }
  async run() {
    this.emit(
      'stdout',
      `Copying from ENV "${this.args.fromEnv}" to "${this.args.toEnv}"`
    )
    this.emit('stdout', `${this.fromDb} => ${this.fromDb}`)
    this.emit('stdout', `temp dir: ${this.tmpDir.name}`)

    const dumpCmd = `mongodump --ssl --db=${this.fromDb} --out=${this.tmpDir.name} ${this.fromEnv.API_MONGO_URI}`
    const restoreCmd = `mongorestore --ssl --drop --nsFrom='${this.fromDb}.*' --nsTo='${this.toDb}.*' ${this.toEnv.API_MONGO_URI} ${this.tmpDir.name}`

    try {
      this.emit('stdout', 'DUMPING DATA...')
      await this.exec(dumpCmd)
      this.emit('stdout', 'RESTORING DATA...')
      await this.exec(restoreCmd)
      this.emit('end', true)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      this.tmpDir.removeCallback()
    }
  }
}

export default CopyDatabase
