import { backup } from '@cloudant/couchbackup'
import { cloudantUrl, run, ServerProcess } from '@databyss-org/scripts/lib'

export class BackupDb extends ServerProcess {
  constructor(argv) {
    super(argv, 'backup.single-database')
  }
  async run() {
    try {
      backup(
        `${cloudantUrl(this.args.env)}/${this.args.dbName}`,
        process.stdout,
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            this.emit('stderr', err)
            this.emit('end', false)
          } else {
            this.emit('Backup successful', data)
            this.emit('end', false)
          }
        }
      )
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

exports.command = 'single-database <dbName>'
exports.desc = 'Backup data from a single couch db'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new BackupDb(argv)
  run(_job)
}
