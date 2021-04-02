import fs from 'fs'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { RestoreDb } from './RestoreDb'

export class RestoreInstance extends ServerProcess {
  constructor(argv) {
    super(argv, 'restore.instance')
  }
  async run() {
    try {
      const _dbs = fs.readdirSync(this.args.path)
      for (const _db of _dbs) {
        const _dbName = _db.replace('.json', '')
        this.log('💾', _db)
        await cloudant.current.db.create(_dbName)
        const _restore = new RestoreDb({
          dbName: _dbName,
          file: `${this.args.path}/${_db}`,
          ...this.args,
        })
        await _restore.run()
        await sleep(100)
      }
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

exports.command = 'instance [options]'
exports.desc = 'Restore all dbs to a cloudant instance'
exports.builder = (yargs) =>
  yargs
    .describe('path', 'Input path for db files')
    .nargs('path', 1)
    .demandOption('path')
    .example(
      '$0 --path ../backups/production',
      'Restore instance from "../backups/production'
    )
    .example('$0', 'Stream restore of instance from stdin')
exports.handler = (argv) => {
  const _job = new RestoreInstance(argv)
  run(_job)
}
