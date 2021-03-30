import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { updateDesignDoc } from '@databyss-org/data/couchdb'
import { DesignDoc } from '@databyss-org/data/interfaces'

export class MigrateGroupDesignDocs extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.group-schemas')
  }
  async run() {
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update primary groups (which start with "g_")
      if (!_dbName.startsWith('g_')) {
        continue
      }
      const _db = cloudant.current.db.use<DesignDoc>(_dbName)
      await updateDesignDoc({ db: _db })
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
