import tmp from 'tmp'
import { run, ServerProcess } from '@databyss-org/scripts/lib'

class CopyDatabase extends ServerProcess {
  tmpDir: { name: string; removeCallback: Function }

  constructor(argv) {
    super(argv, 'mongo.copy-database')
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

exports.command = 'copy-database <fromDb> <toDb>'
exports.desc = 'Migrate Mongo user to Cloudant'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new CopyDatabase(argv)
  run(_job)
}
