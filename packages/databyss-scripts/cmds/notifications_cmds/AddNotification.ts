import fs from 'fs'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { UserPreference } from '@databyss-org/data/pouchdb/interfaces'

export class AddNotification extends ServerProcess {
  constructor(argv) {
    super(argv, 'notifications.add')
  }
  async run() {
    const _notification = JSON.parse(fs.readFileSync(this.args.file).toString())

    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update primary groups (which start with "g_")
      if (!_dbName.startsWith('g_')) {
        continue
      }
      const _db = cloudant.current.db.use<UserPreference>(_dbName)

      const _prefs = await _db.tryGet('user_preference')
      // console.log(_prefs)
      if (!_prefs) {
        continue
      }
      if (!_prefs.notifications) {
        _prefs.notifications = []
      }
      _prefs.notifications.push(_notification)
      await _db.insert(_prefs)
      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`✅ ${_dbName}`)
    }
  }
}

exports.command = 'add <file>'
exports.desc = 'Add a notification from a file'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new AddNotification(argv)
  run(_job)
}
