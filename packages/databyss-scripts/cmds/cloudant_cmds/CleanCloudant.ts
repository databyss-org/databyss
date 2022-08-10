import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import {
  updateSysDesignDocs,
  initiateDatabases,
} from '@databyss-org/data/couchdb'
import { SysUser } from '@databyss-org/data/interfaces'
import { Document, Group } from '@databyss-org/services/interfaces'

export class CleanCloudant extends ServerProcess {
  user: (SysUser & { _rev: string }) | null = null

  constructor(argv: ServerProcessArgs) {
    super(argv, `cloudant.clean`)
  }
  async run() {
    if (!this.args.email && this.args.envName === 'production') {
      throw new Error('Cannot run on production env without --email arg')
    }
    if (this.args.email && this.args.init) {
      throw new Error('Cannot specify --init=true and --email')
    }

    if (this.args.email) {
      // get the user
      this.user = await getUser(this.args.email)
    }

    const _dbs = await cloudant.current.db.list()

    for (const _db of _dbs) {
      if (this.user && !(await dbBelongsToUser(_db, this.user))) {
        continue
      }
      // remove the db
      await cloudant.current.db.destroy(_db)
      this.logSuccess('🧽', 'db', _db)

      if (this.user) {
        // if we're not resetting the instance, remove the group document
        const _groupDoc = await cloudant.models.Groups.tryGet(_db)
        if (_groupDoc) {
          await cloudant.models.Groups.destroy(_db, _groupDoc._rev)
          this.logSuccess('🧽', 'group doc', _db)
        }
      }

      // dont exceed cloudant rate limit
      await sleep(100)
    }

    if (this.user) {
      // clean up the user document
      await cloudant.models.Users.destroy(this.user._id, this.user._rev)
      this.logSuccess('🧽', this.user._id)
    }

    if (this.args.init) {
      // re-initialize the database
      await initiateDatabases()
      this.logSuccess('created admin dbs')
      await updateSysDesignDocs()
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
    return false
  }
  return _group.belongsToGroup === user.defaultGroupId
}

exports.command = 'clean [options]'
exports.desc = 'Clean up (remove) users and databases on Cloudant'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs
    .describe('init', 'Initialize admin dbs')
    .describe('email', 'Remove a user and all their group dbs')
    .boolean('init')
    .default('init', false)
    .example(
      '$0 cloudant clean --init --env development',
      'Clean all dbs from development instance and re-initialize (full reset)'
    )
    .example(
      '$0 cloudant clean --email paul@hine.works',
      'Clean dbs belonging to `paul@hine.works` and remove user'
    )

exports.handler = (argv: ServerProcessArgs) => {
  new CleanCloudant(argv).runCli()
}
