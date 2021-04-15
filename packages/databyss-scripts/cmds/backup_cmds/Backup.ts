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

export class Backup extends ServerProcess {
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
exports.builder = {}
exports.handler = (argv: ServerProcessArgs) => {
  new Backup(argv).runCli()
}
