import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import Page from '@databyss-org/api/src/models/Page'
import Block from '@databyss-org/api/src/models/Block'
import Selection from '@databyss-org/api/src/models/Selection'
import BlockRelation from '@databyss-org/api/src/models/BlockRelation'
import { Page as PageInterface } from '@databyss-org/services/interfaces/Page'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  createGroupId,
  createGroupDatabase,
} from '@databyss-org/api/src/lib/createUserDatabase'
import { uid } from '@databyss-org/data/lib/uid'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, EnvDict } from '../lib/util'
import { Role } from '@databyss-org/data/interfaces'

interface JobArgs {
  envName: string
  email: string
}

const getTimestamps = (doc) => ({
  createdAt: doc.createdAt
    ? new Date(doc.createdAt).getTime()
    : new Date().getTime(),
  modifiedAt: doc.updatedAt
    ? new Date(doc.updatedAt).getTime()
    : new Date().getTime(),
})

class UserMongoToCloudant extends ServerProcess {
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
      const _groupDb = await cloudant.db.use<any>(_couchGroupName)
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
        await _groupDb.insert({
          $type: DocumentType.Block,
          _id: _couchBlockId,
          type: _mongoBlock.type,
          text: {
            textValue: _mongoBlock.text.textValue,
            ranges: _mongoBlock.text.ranges.map((r) => ({
              marks: r.marks,
              offset: r.offset,
              length: r.length,
            })),
          },
          ...getTimestamps(_mongoBlock),
        })
      }
      console.log(`➡️  Migrated ${Object.keys(_blockIdMap).length} Blocks`)

      // get all Pages for account
      const _mongoPages = await Page.find({
        account: _defaultAccountId,
      })

      // insert the Pages in couch, generating new ids and keeping a map of old => new id
      const _pageIdMap = {}
      for (const _mongoPage of _mongoPages) {
        const _couchPageId = uid()
        _pageIdMap[_mongoPage._id] = _couchPageId

        // get the Selection from mongo
        const _mongoSelection = await Selection.findOne({
          _id: _mongoPage.selection._id,
        })
        // generate a new id for the Selection
        const _couchSelectionId = uid()
        // insert the Selection in couch
        await _groupDb.insert({
          $type: DocumentType.Selection,
          _id: _couchSelectionId,
          // TODO: why dosen't tv4 validation work for these fields?
          focus: {
            index: _mongoSelection.focus.index,
            offset: _mongoSelection.focus.offset,
          },
          anchor: {
            index: _mongoSelection.focus.index,
            offset: _mongoSelection.focus.offset,
          },
          ...getTimestamps(_mongoPage),
        })

        await _groupDb.insert({
          $type: DocumentType.Page,
          _id: _couchPageId,
          name: _mongoPage.name,
          blocks: _mongoPage.blocks.map((_mongoBlock) => ({
            type: _mongoBlock.type,
            _id: _blockIdMap[_mongoBlock._id],
          })),
          selection: _couchSelectionId,
          ...getTimestamps(_mongoPage),
        })
      }

      console.log(`➡️  Migrated ${Object.keys(_pageIdMap).length} Pages`)

      // get all BlockRelations for account
      const _mongoRelations = await BlockRelation.find({
        account: _defaultAccountId,
      })

      // insert the BlockRelations in couch
      let _relationsCount = 0
      for (const _mongoRelation of _mongoRelations) {
        const _couchRelationId = uid()

        await _groupDb.insert({
          $type: DocumentType.BlockRelation,
          _id: _couchRelationId,
          block: _blockIdMap[_mongoRelation.block],
          relatedBlock: _blockIdMap[_mongoRelation.relatedBlock],
          relatedBlockType: _mongoRelation.relatedBlockType,
          relationshipType: _mongoRelation.relationshipType,
          page: _mongoRelation.page,
          blockIndex: _mongoRelation.blockIndex,
          blockText: _mongoRelation.blockText,
          ...getTimestamps(_mongoRelation),
        })
        _relationsCount += 1
      }
      console.log(`➡️  Migrated ${_relationsCount} BlockRelations`)

      // STEP 4: Add the userPreferences doc to the default group database
      //   with the defaultPageId

      // generate a userId for the user
      const _couchUserId = uid()

      await _groupDb.insert({
        $type: DocumentType.UserPreferences,
        userId: _couchUserId,
        defaultGroupId: _defaultGroupId,
        groups: [
          {
            groupId: _defaultGroupId,
            role: Role.GroupAdmin,
            defaultPageId: _pageIdMap[_mongoAccount.defaultPage],
          },
        ],
        ...getTimestamps({}),
      })
      console.log(`➡️  Migrated userPreferences`)

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

export default UserMongoToCloudant
