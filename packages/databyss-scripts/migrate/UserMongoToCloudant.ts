import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import Page from '@databyss-org/api/src/models/Page'
import Block from '@databyss-org/api/src/models/Block'
import { Page as PageInterface } from '@databyss-org/services/interfaces/Page'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  createGroupId,
  createGroupDatabase,
  addCredentialsToUser,
} from '@databyss-org/api/src/lib/createUserDatabase'
import { uid } from '@databyss-org/data/lib/uid'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, EnvDict } from '../lib/util'

interface JobArgs {
  envName: string
  email: string
}

class UserMongoToCloudant extends ServerProcess {
  args: JobArgs
  env: EnvDict
  static importEnv: string[]

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
  }
  async run() {
    this.emit('stdout', `Migrating user "${this.args.email}" to cloudant`)
    try {
      // STEP 1: connect to Mongo
      connectDB(this.env.API_MONGO_URI)
      // (cloudant connects when the lib functions are called below)

      // STEP 1a: Get User record from mongo and save the defaultAccountId
      const _mongoUser = await User.findOne({ email: this.args.email })
      if (!_mongoUser) {
        throw new Error('User not found')
      }
      const _defaultAccountId = _mongoUser.defaultAccount
      console.log(`Mongo accountId to migrate: ${_defaultAccountId}`)

      // STEP 2: Create the user's default group database and add design docs
      const _defaultGroupId = await createGroupId()
      const _couchGroupName = `g_${_defaultGroupId}`
      console.log(`⏳ Create group: ${_couchGroupName}`)
      await createGroupDatabase(_defaultGroupId)
      console.log(`✅ Group created: ${_defaultGroupId}`)
      const _groupDb = await cloudant.db.use<PageInterface>(_couchGroupName)
      const _mongoAccount = await Account.findOne({ _id: _defaultAccountId })
      console.log(`ℹ️  Old defaultPageId: ${_mongoAccount.defaultPage}`)

      // STEP 3: Copy all Pages, Blocks, Selections and BlockRelations belonging to the user
      //   to the group db

      // get all Blocks for account
      const _mongoBlocks = await Block.find({
        account: _defaultAccountId,
      })

      // insert the pages in couch, generating new ids and keeping a map
      const _blockIdMap = {}
      for (const _mongoBlock of _mongoBlocks) {
        const _couchBlockId = uid()
        _blockIdMap[_mongoBlock._id] = _couchBlockId
        console.log(_mongoBlock)
        await _groupDb.insert({
          $type: DocumentType.Block,
          _id: _couchBlockId,
          type: _mongoBlock.type,
          text: _mongoBlock.text,
        })
      }

      // get all Pages for account
      const _mongoPages = await Page.find({
        account: _defaultAccountId,
      })

      // insert the pages in couch, generating new ids and keeping a map of old => new id
      const _pageIdMap = {}
      for (const _mongoPage of _mongoPages) {
        const _couchPageId = uid()
        _pageIdMap[_mongoPage._id] = _couchPageId
        await _groupDb.insert({
          $type: DocumentType.Page,
          _id: _couchPageId,
          blocks: _mongoPage.blocks.map((_mongoBlock) => ({
            ..._mongoBlock,
            _id: _blockIdMap[_mongoBlock._id],
          })),
        })
      }

      // STEP 4: Add the userPreferences doc to the default group database
      //   with the defaultPageId

      // STEP 5: Create documents in the Users db for the new user so they can login

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

UserMongoToCloudant.importEnv = ['CLOUDANT_USERNAME', 'CLOUDANT_PASSWORD']

export default UserMongoToCloudant
