import fs from 'fs'
import { restore } from '@cloudant/couchbackup'
import {
  cloudantUrl,
  ServerProcess,
  ServerProcessArgs,
} from '@databyss-org/scripts/lib'
import { cloudant, DocumentScope } from '@databyss-org/data/cloudant'
import { setSecurity } from '@databyss-org/api/src/lib/createUserDatabase'
import { Group } from '@databyss-org/services/interfaces'

export class RestoreDb extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'restore.database')
  }
  async run() {
    let _db
    try {
      _db = await this.createOrResetDatabase(this.args.dbName)
    } catch (err) {
      this.logFailure(
        `Cannot create database ${this.args.dbName}, aborting restore operation.`
      )
      this.logError(err)
      return
    }
    try {
      await this.restore()
      this.logSuccess('Database restored', this.args.dbName)
      if (this.args.dbName.startsWith('p_') || this.dbIsPublic(_db)) {
        this.logInfo('Database is public')
        await setSecurity({ groupId: this.args.dbName, isPublic: true })
        this.logSuccess('Add public access credentials')
      }
    } catch (err) {
      this.logFailure(`Restore failed`)
      this.logError(err)
    }
  }
  async restore() {
    this.logInfo('Restoring from file', this.args.path)
    return new Promise((resolve, reject) => {
      restore(
        fs.createReadStream(this.args.path),
        `${cloudantUrl(this.args.env)}/${this.args.dbName}`,
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            reject(err)
          } else {
            this.logSuccess(this.args.dbName)
            resolve(data)
          }
        }
      )
    })
  }
  async dbIsPublic(db: DocumentScope<Group>) {
    const _group = await db.tryGet(this.args.dbName)
    if (!_group) {
      return false
    }
    return _group!.public
  }
  async createOrResetDatabase(id: string) {
    try {
      await cloudant.current.db.get(id)
      await cloudant.current.db.use<any>(id)

      // if we get here, the db exists
      if (!this.args.replace) {
        throw new Error('Database exists and --replace is not set.')
      }
      await cloudant.current.db.destroy(id)
    } catch (err: any) {
      if (err.error !== 'not_found') {
        throw err
      }
    }
    await cloudant.current.db.create(id)
    return cloudant.current.db.use<any>(id)
  }
}

exports.command = 'database <dbName> [options]'
exports.desc = 'Restore a single database'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.example(
    '$0 restore database g_8sozwot4jo1azq --path g_8sozwot4jo1azq.json',
    'Restore `g_8sozwot4jo1azq` database from `g_8sozwot4jo1azq.json`'
  )
exports.handler = (argv: ServerProcessArgs) => {
  new RestoreDb(argv).runCli()
}
