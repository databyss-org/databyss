import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { updateDesignDocs, initiateDatabases } from '@databyss-org/data/couchdb'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { uid } from '@databyss-org/data/lib/uid'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, EnvDict } from '../lib/util'

interface JobArgs {
  envName: string
  email: string
}

class DeleteAccount extends ServerProcess {
  args: JobArgs
  env: EnvDict

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
  }
  async run() {
    this.emit('stdout', `Migrating user "${this.args.email}" to cloudant`)
    try {
      // STEP 1: connect to Mongo and Cloudant
      connectDB(this.env.API_MONGO_URI)
      // (cloudant connects when the file is imported)

      // STEP 1a: Get User record from mongo and save the defaultAccountId
      const _mongoUser = await User.findOne({ email: this.args.email })
      if (!_mongoUser) {
        throw new Error('User not found')
      }
      const _defaultAccountId = _mongoUser.defaultAccount
      console.log(`Mongo accountId to migrate: ${_defaultAccountId}`)

      // STEP 2: Create the user's default group database
      const _defaultGroupId = uid()
      cloudant.db.use(`g_${_defaultGroupId}`)

      // STEP 3: Add design docs to group db
      updateDesignDocs()

      // STEP 4: Move all Pages, Blocks, Selections and BlockRelations belonging to the user to the group db

      // STEP 5: Create documents in the Users and Groups dbs for the new user and group

      // STEP 6: Migrate pages shared by this user by creating a new group db for each page
      //   and updating the page.groups array with the new group id

      this.emit('stdout', `✅ User migrated.`)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      closeDB()
    }
  }
}

export default DeleteAccount
