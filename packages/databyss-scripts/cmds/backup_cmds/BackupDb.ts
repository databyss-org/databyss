import fs from 'fs'
import { backup } from '@cloudant/couchbackup'
import {
  cloudantUrl,
  ServerProcess,
  ServerProcessArgs,
  run,
} from '@databyss-org/scripts/lib'

export class BackupDb extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'backup.database')
  }
  run() {
    return new Promise((resolve, reject) => {
      backup(
        `${cloudantUrl(this.args.env)}/${this.args.dbName}`,
        fs.createWriteStream(this.args.path),
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
}

exports.command = 'database <dbName> [options]'
exports.desc = 'Backup data from a single couch db'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.example(
    '$0 backup database groups --path ../backups/groups.json',
    'Backup `groups` database to `../backups/groups.json`'
  )
exports.handler = (argv: ServerProcessArgs) => {
  run(new BackupDb(argv))
}
