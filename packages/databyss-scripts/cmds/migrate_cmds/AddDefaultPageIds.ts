import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { updateDesignDoc } from '@databyss-org/data/couchdb'
import { DesignDoc } from '@databyss-org/data/interfaces'

export class AddDefaultPageIds extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.public-default-pages')
  }
  async run() {
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update groups (which start with "g_" or "p_")
      if (!_dbName.startsWith('g_') && !_dbName.startsWith('p_')) {
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

exports.command = 'group-default-pages'
exports.desc =
  'Ensure defaultPageId on all public groups. If it is not set, set it to first page in group.'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new AddDefaultPageIds(argv)
  run(_job)
}
