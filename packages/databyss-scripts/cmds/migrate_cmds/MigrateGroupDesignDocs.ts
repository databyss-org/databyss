import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { updateDesignDocs } from '@databyss-org/data/couchdb'

export class MigrateGroupDesignDocs extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.group-schemas')
  }
  async run() {
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update groups (which start with "g_" or "p_")
      if (!_dbName.startsWith('g_') && !_dbName.startsWith('p_')) {
        continue
      }
      await updateDesignDocs()
      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`⬆️  migrated: ${_dbName}`)
    }
  }
}

exports.command = 'group-schemas'
exports.desc = 'Update design docs on all group databases'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new MigrateGroupDesignDocs(argv)
  run(_job)
}
