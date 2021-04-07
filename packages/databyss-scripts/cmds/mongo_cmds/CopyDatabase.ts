import tmp from 'tmp'
import { ServerProcess, ServerProcessArgs } from '@databyss-org/scripts/lib'

class CopyDatabase extends ServerProcess {
  tmpDir: { name: string; removeCallback: Function }

  constructor(argv: ServerProcessArgs) {
    super(argv, 'mongo.copy-database')
    this.tmpDir = tmp.dirSync({ unsafeCleanup: true })
  }

  async run() {
    if (this.args.toDb === 'production') {
      throw new Error('Cannot overwrite production database')
    }
    this.logInfo(
      `Copying database "${this.args.fromDb}" to "${this.args.toDb}"`
    )
    this.logInfo(`temp dir: ${this.tmpDir.name}`)

    const dumpCmd = `mongodump --ssl --db=${this.args.fromDb} --out=${this.tmpDir.name} ${this.args.env.API_MONGO_URI}`
    const restoreCmd = `mongorestore --ssl --drop --nsFrom='${this.args.fromDb}.*' --nsTo='${this.args.toDb}.*' '${this.args.env.API_MONGO_URI}' '${this.tmpDir.name}'`

    this.logInfo('🔄', 'DUMPING DATA...')
    await this.exec(dumpCmd)
    this.logInfo('🔄', 'RESTORING DATA...')
    await this.exec(restoreCmd)
    this.logSuccess('Database copied.')
    this.tmpDir.removeCallback()
  }
}

export default CopyDatabase

exports.command = 'copy-database <fromDb> <toDb>'
exports.desc = 'Migrate Mongo user to Cloudant'
exports.builder = {}
exports.handler = (argv) => {
  new CopyDatabase(argv).runCli()
}
