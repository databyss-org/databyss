import fs from 'fs'
import path from 'path'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import yargs from 'yargs'
import findRemoveSync from '@databyss-org/find-remove'
import { BackupDb } from './BackupDb'
import { fileFriendlyDateTime } from '../../lib/ServerProcess'

const SECONDS_PER_DAY = 86400

export class Backup extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'backup.instance')
  }
  async run() {
    if (this.args.clean) {
      this.logInfo('Cleaning old directories')
      const _cleanRes = findRemoveSync(this.args.path, {
        dir: '^instance_',
        regex: true,
        age: {
          seconds: this.args.clean * SECONDS_PER_DAY,
        },
      })
      this.logSuccess(
        `Cleanup removed ${Object.keys(_cleanRes).length} instance directories`
      )
    }

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
      const _backup = new BackupDb({
        ...this.args,
        dbName: _db,
        path: path.join(outputPath, `${_db}.json`),
        spinner: this.spinner,
        outputLogFs: this.outputLogFs,
        errorLogFs: this.errorLogFs,
      })
      await _backup.run()
      await sleep(100)
    }
  }
}

exports.command = 'instance [options]'
exports.desc = 'Backup all dbs in a cloudant instance'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.describe(
    'clean',
    'Remove instance backups from output path directory that are older than N days'
  )
yargs.example(
  '$0 backup --clean=7',
  'Removes backups older than 7 days before running the backup'
)
yargs.number('clean')
exports.handler = (argv: ServerProcessArgs) => {
  new Backup(argv).runCli()
}
