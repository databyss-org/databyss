import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'

class ResetCloudantInstance extends ServerProcess {
  constructor(argv) {
    super(argv, 'cloudant.reset-instance')
  }
  async run() {
    if (this.args.envName === 'production') {
      throw new Error('Cannot run on production env')
    }
    const _dbs = await cloudant.current.db.list()
    if (_dbs.length) {
      for (const _db of _dbs) {
        await cloudant.current.db.destroy(_db)
        // dont exceed cloudant rate limit
        await sleep(100)
        this.logInfo('🧽', `destroyed - ${_db}`)
      }
    }

    if (!this.args.clean) {
      // re-initialize the database
      await initiateDatabases()
      this.logSuccess('created admin dbs')
      await updateDesignDocs()
      this.logSuccess('added design docs to admin dbs')
    }
  }
}

export default ResetCloudantInstance

exports.command = 'reset-instance [options]'
exports.desc = 'Delete all databases on Cloudant and re-initialize'
exports.builder = (yargs) =>
  yargs.describe('clean', 'Leave instance clean (do not init admin dbs)')

exports.handler = (argv) => {
  new ResetCloudantInstance(argv).runCli()
}
