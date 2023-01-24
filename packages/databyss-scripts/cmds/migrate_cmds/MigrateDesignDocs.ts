import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { updateGroupDesignDocs } from '@databyss-org/data/cloudant/util'
import { DesignDoc } from '@databyss-org/data/interfaces'

export async function groupIdForUser(email: string) {
  const _usersRes = await cloudant.models.Users.find({
    selector: {
      email,
    },
  })
  if (!_usersRes.docs.length) {
    console.log(`User not found: ${email}`)
    return null
  }
  return _usersRes.docs[0].defaultGroupId!
}

export class MigrateGroupDesignDocs extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'migrate.design-docs')
  }
  async updateDesignDoc(dbName: string) {
    const _db = await cloudant.current.db.use<DesignDoc>(dbName)
    await updateGroupDesignDocs(_db)
    this.log(`⬆️  migrated: ${dbName}`)
  }
  async run() {
    if (this.args.email) {
      const _dbName = await groupIdForUser(this.args.email)
      if (_dbName) {
        await this.updateDesignDoc(_dbName)
      }
      return
    }
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update groups (which start with "g_" or "p_")
      if (!_dbName.startsWith('g_') && !_dbName.startsWith('p_')) {
        continue
      }
      await this.updateDesignDoc(_dbName)
      // dont exceed cloudant rate limit
      await sleep(100)
    }
  }
}

exports.command = 'design-docs [email]'
exports.desc = 'Update design docs on group databases'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.describe('email', 'Only migrate user with this email')
exports.handler = (argv: ServerProcessArgs) => {
  new MigrateGroupDesignDocs(argv).runCli()
}
