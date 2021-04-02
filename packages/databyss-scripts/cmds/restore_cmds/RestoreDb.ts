import fs from 'fs'
import { restore } from '@cloudant/couchbackup'
import { cloudantUrl, run, ServerProcess } from '@databyss-org/scripts/lib'

export class RestoreDb extends ServerProcess {
  constructor(argv) {
    super(argv, 'restore.single-database')
  }
  async run() {
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
}

exports.command = 'single-database <dbName> [options]'
exports.desc = 'Restore data to a single couch db'
exports.builder = (yargs) =>
  yargs
    .describe('f', 'Input from a file')
    .alias('f', 'file')
    .nargs('f', 1)
    .example(
      '$0 users -f users.json',
      'Restore "users" database from "users.json"'
    )
    .example('$0 users', 'Stream restore of "users" database from stdin')
exports.handler = (argv) => {
  const _job = new RestoreDb(argv)
  run(_job)
}
