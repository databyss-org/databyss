import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'

class ResetCloudantInstance extends ServerProcess {
  constructor(argv) {
    super(argv, 'cloudant.reset-instance')
  }
  async run() {
    try {
      if (this.args.envName === 'production') {
        throw new Error('Cannot run on production env')
      }
      const _dbs = await cloudant.current.db.list()
      if (_dbs.length) {
        for (const _db of _dbs) {
          await cloudant.current.db.destroy(_db)
          // dont exceed cloudant rate limit
          await sleep(100)
          console.log(`🗑  destroyed - ${_db}`)
        }
      }

      if (!this.args.clean) {
        // re-initialize the database
        await initiateDatabases()
        console.log('✅ created admin dbs')
        await updateDesignDocs()
        console.log('✅ added design docs to admin dbs')
      }
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

export default ResetCloudantInstance

exports.command = 'reset-instance [options]'
exports.desc = 'Delete all databases on Cloudant and re-initialize'
exports.builder = (yargs) =>
  yargs.describe('clean', 'Leave instance clean (do not init admin dbs)')

exports.handler = (argv) => {
  const _job = new ResetCloudantInstance(argv)
  run(_job)
}
