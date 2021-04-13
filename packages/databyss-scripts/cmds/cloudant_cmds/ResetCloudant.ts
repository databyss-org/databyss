import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'
import { SysUser } from '@databyss-org/data/interfaces'
import { Document, Group } from '@databyss-org/services/interfaces'

class ResetCloudant extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, `cloudant.${argv.email ? 'delete-user' : 'reset-instance'}`)
  }
  async run() {
    if (!this.args.email && this.args.envName === 'production') {
      throw new Error('Cannot run on production env')
    }
    const _dbs = await cloudant.current.db.list()
    if (this.args.email) {
      // get the user
      this.user = await getUser(this.args.email)
    }
    for (const _db of _dbs) {
      if (this.user && !(await dbBelongsToUser(_db, this.user))) {
        continue
      }
      await cloudant.current.db.destroy(_db)
      // dont exceed cloudant rate limit
      await sleep(100)
      this.logInfo('🧽', `destroyed - ${_db}`)
    }

    if (this.args.init) {
      // re-initialize the database
      await initiateDatabases()
      this.logSuccess('created admin dbs')
      await updateDesignDocs()
      this.logSuccess('added design docs to admin dbs')
    }
  }
}

export async function getUser(email: string) {
  const _res = await cloudant.models.Users.find({
    selector: {
      email,
    },
  })
  if (!_res.docs?.length) {
    return null
  }
  if (_res.docs.length > 1) {
    throw new Error(
      `[getUser] found more than one user matching email ${email}`
    )
  }
  return _res.docs[0]
}

export async function dbBelongsToUser(dbName: string, user: SysUser) {
  if (dbName === user.defaultGroupId) {
    return true
  }
  // look for Group document in database to check ownership
  const _groupDb = await cloudant.current.db.use<Group & Document>(dbName)
  const _group = await _groupDb.tryGet(dbName)
  if (!_group) {
    throw new Error(`Cannot find Group doc in db ${dbName}`)
  }
  return _group.belongsToGroup === dbName
}

export default ResetCloudant

exports.command = 'reset-instance [options]'
exports.desc = 'Delete all databases on Cloudant and re-initialize'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.describe('init', 'Leave instance clean (do not init admin dbs)')

exports.handler = (argv: ServerProcessArgs) => {
  new ResetCloudant(argv).runCli()
}
