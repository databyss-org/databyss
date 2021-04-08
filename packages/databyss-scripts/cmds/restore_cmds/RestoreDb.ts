import fs from 'fs'
import { DocumentScope } from 'nano'
import { restore } from '@cloudant/couchbackup'
import {
  cloudantUrl,
  ServerProcess,
  ServerProcessArgs,
} from '@databyss-org/scripts/lib'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { setSecurity } from '@databyss-org/api/src/lib/createUserDatabase'
import { Group } from '@databyss-org/services/interfaces'

export class RestoreDb extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'restore.single-database')
  }
  async run() {
    let _db
    try {
      _db = await this.createOrResetDatabase(this.args.dbName)
    } catch (err) {
      await this.restore()
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
    return new Promise((resolve, reject) => {
      restore(
        this.args.file ? fs.createReadStream(this.args.file) : process.stdout,
        `${cloudantUrl(this.args.env)}/${this.args.dbName}`,
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            reject(err)
          } else {
            this.log(data)
            resolve(data)
          }
        }
      )
    })
  }
  async dbIsPublic(db: DocumentScope<Group>) {
    let _group = await db.tryGet(this.args.dbName)
    if (!_group) {
      _group = await db.tryGet(this.args.dbName.substr(2))
    }
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
    } catch (err) {
      if (err.error !== 'not_found') {
        throw err
      }
    }
    await cloudant.current.db.create(id)
    return cloudant.current.db.use<any>(id)
  }
}

exports.command = 'single-database <dbName> [options]'
exports.desc = 'Restore data to a single couch db'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs
    .describe('f', 'Input from a file')
    .alias('f', 'file')
    .nargs('f', 1)
    .example(
      '$0 users -f users.json',
      'Restore "users" database from "users.json"'
    )
    .example('$0 users', 'Stream restore of "users" database from stdin')
    .describe(
      'reset',
      'Replace the database if it exists. If "false" and database exists, job will quit with an error.'
    )
    .boolean('replace')
    .example(
      '$0 users --replace',
      'Restore "users" database, replacing if necessary'
    )
exports.handler = (argv: ServerProcessArgs) => {
  new RestoreDb(argv).runCli()
}
