import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess } from '@databyss-org/scripts/lib'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

class ResetCloudantInstance extends ServerProcess {
  constructor(argv) {
    super(argv, 'cloudant.reset-instance')
  }
  async run() {
    try {
      if (this.args.envName === 'production') {
        throw new Error('Cannot run on production env')
      }
      const _dbs = await cloudant.db.list()
      // console.log(_dbs)
      if (_dbs.length) {
        for (const _db of _dbs) {
          await cloudant.db.destroy(_db)
          // dont exceed cloudant rate limit
          await sleep(100)
          console.log(`🗑  destroyed - ${_db}`)
        }
      }

      // re-initialize the database
      await initiateDatabases()
      console.log('✅ created admin dbs')
      await updateDesignDocs()
      console.log('✅ added design docs to admin dbs')
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

export default ResetCloudantInstance

exports.command = 'reset-instance'
exports.desc = 'Delete all databases on Cloudant and re-initialize'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new ResetCloudantInstance(argv)
  run(_job)
}
