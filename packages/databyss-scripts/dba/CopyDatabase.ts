import tmp from 'tmp'
import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

interface EnvDict {
  [key: string]: string
}

interface JobArgs {
  envName: string
  fromDb: string
  toDb: string
}

class CopyDatabase extends ServerProcess {
  args: JobArgs
  env: EnvDict
  tmpDir: { name: string; removeCallback: Function }

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
    this.tmpDir = tmp.dirSync({ unsafeCleanup: true })
  }
  async run() {
    if (this.args.toDb === 'production') {
      throw new Error('Cannot overwrite production database')
    }
    this.emit(
      'stdout',
      `Copying database "${this.args.fromDb}" to "${this.args.toDb}"`
    )
    this.emit('stdout', `temp dir: ${this.tmpDir.name}`)

    const dumpCmd = `mongodump --ssl --db=${this.args.fromDb} --out=${this.tmpDir.name} ${this.env.API_MONGO_URI}`
    const restoreCmd = `mongorestore --ssl --drop --nsFrom='${this.args.fromDb}.*' --nsTo='${this.args.toDb}.*' '${this.env.API_MONGO_URI}' '${this.tmpDir.name}'`

    try {
      this.emit('stdout', '🔄 DUMPING DATA...')
      await this.exec(dumpCmd)
      this.emit('stdout', '🔄 RESTORING DATA...')
      await this.exec(restoreCmd)
      this.emit('stdout', `✅ Database copied.`)
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
