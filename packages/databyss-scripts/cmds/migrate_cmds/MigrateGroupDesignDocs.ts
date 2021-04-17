import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { updateDesignDoc } from '@databyss-org/data/couchdb/util'
import { groupSchema } from '@databyss-org/data/schemas'
import { DesignDoc } from '@databyss-org/data/interfaces'

export class MigrateGroupDesignDocs extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'migrate.group-schemas')
  }
  async run() {
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update groups (which start with "g_" or "p_")
      if (!_dbName.startsWith('g_') && !_dbName.startsWith('p_')) {
        continue
      }
      const _db = await cloudant.current.db.use<DesignDoc>(_dbName)
      await updateDesignDoc({ schema: groupSchema, db: _db })
      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`⬆️  migrated: ${_dbName}`)
    }
  }
}

exports.command = 'group-schemas'
exports.desc = 'Update design docs on all group databases'
exports.builder = {}
exports.handler = (argv: ServerProcessArgs) => {
  new MigrateGroupDesignDocs(argv).runCli()
}
