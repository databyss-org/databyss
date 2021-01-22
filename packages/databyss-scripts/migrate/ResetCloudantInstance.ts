import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'
import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

interface JobArgs {
  envName: string
}

class ResetCloudantInstance extends ServerProcess {
  args: JobArgs

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
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
          console.log(`destroyed - ${_db}`)
        }
      }

      // re-initialize the database
      await initiateDatabases()
      await updateDesignDocs()
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    }
  }
}

export default ResetCloudantInstance
