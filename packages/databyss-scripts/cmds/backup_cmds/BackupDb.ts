import fs from 'fs'
import { backup } from '@cloudant/couchbackup'
import {
  cloudantUrl,
  ServerProcess,
  ServerProcessArgs,
} from '@databyss-org/scripts/lib'

export class BackupDb extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'backup.single-database')
  }
  run() {
    return new Promise((resolve, reject) => {
      backup(
        `${cloudantUrl(this.args.env)}/${this.args.dbName}`,
        this.args.file ? fs.createWriteStream(this.args.file) : process.stdout,
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            reject(err)
          } else {
            // this.log(data)
            resolve(data)
          }
        }
      )
    })
  }
}

exports.command = 'single-database <dbName> [options]'
exports.desc = 'Backup data from a single couch db'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs
    .describe('f', 'Output to a file')
    .alias('f', 'file')
    .nargs('f', 1)
    .example(
      '$0 users -f users.json',
      'Backup "users" database to "users.json"'
    )
    .example('$0 users', 'Stream backup of "users" database to stdout')
exports.handler = (argv: ServerProcessArgs) => {
  new BackupDb(argv).runCli()
}
