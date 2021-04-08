import fs from 'fs'
import path from 'path'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { BackupDb } from './BackupDb'
import { fileFriendlyDateTime } from '../../lib/ServerProcess'

export class BackupInstance extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'backup.instance')
  }
  async run() {
    const outputPath = path.join(
      this.args.path,
      `instance_${fileFriendlyDateTime()}`
    )
    await fs.mkdirSync(outputPath, {
      recursive: true,
    })
    this.logSuccess('Created output directory', outputPath)
    const _dbs = await cloudant.current.db.list()
    for (const _db of _dbs) {
      this.logInfo('💾', _db)
      const _backup = new BackupDb({
        dbName: _db,
        file: `${outputPath}/${_db}.json`,
        ...this.args,
      })
      await _backup.run()
      await sleep(100)
    }
  }
}

exports.command = 'instance [options]'
exports.desc = 'Backup all dbs in a cloudant instance'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs
    .describe('path', 'Output path for db files')
    .nargs('path', 1)
    .demandOption('path')
    .example(
      '$0 --path ../backups/production',
      'Backup instance to "../backups/production'
    )
    .example('$0', 'Stream backup of instance to stdout')
exports.handler = (argv: ServerProcessArgs) => {
  new BackupInstance(argv).runCli()
}
