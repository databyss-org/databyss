import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { Group } from '@databyss-org/services/interfaces'

export class AddDefaultPageIds extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.default-page')
  }
  async run() {
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update groups (which start with "g_")
      if (!_dbName.startsWith('g_')) {
        continue
      }
      const _db = await cloudant.current.db.use<Group>(_dbName)

      // group document should have same name as database
      const _group = await _db.tryGet(_dbName)
      if (!_group) {
        // this should mean we're on a primary group, which has a user_preference
        //   instead of a group doc
        continue
      }

      await _db.upsert(_dbName, (oldDoc) => {
        if (oldDoc.pages.length) {
          oldDoc.defaultPageId = oldDoc.pages[0]
        } else {
          // group has no pages in it, remove defaultPageId
          delete oldDoc.defaultPageId
        }
        return oldDoc
      })

      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`⬆️  migrated: ${_dbName}`)
    }
  }
}

exports.command = 'default-page'
exports.desc = 'Add default page ids to all groups'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new AddDefaultPageIds(argv)
  run(_job)
}
