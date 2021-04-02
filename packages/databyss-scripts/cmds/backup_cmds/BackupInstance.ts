import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { BackupDb } from './BackupDb'

export class BackupInstance extends ServerProcess {
  constructor(argv) {
    super(argv, 'backup.instance')
  }
  async run() {
    try {
      const _dbs = await cloudant.current.db.list()
      for (const _db of _dbs) {
        this.log('💾', _db)
        const _backup = new BackupDb({
          dbName: _db,
          file: `${this.args.path}/${_db}.json`,
          ...this.args,
        })
        await _backup.run()
        await sleep(100)
      }
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

exports.command = 'instance [options]'
exports.desc = 'Backup all dbs in a cloudant instance'
exports.builder = (yargs) =>
  yargs
    .describe('path', 'Output path for db files')
    .nargs('path', 1)
    .demandOption('path')
    .example(
      '$0 --path ../backups/production',
      'Backup instance to "../backups/production'
    )
    .example('$0', 'Stream backup of instance to stdout')
exports.handler = (argv) => {
  const _job = new BackupInstance(argv)
  run(_job)
}
