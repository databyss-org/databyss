import cloneDeep from 'clone-deep'
import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import Page from '@databyss-org/api/src/models/Page'
import Block from '@databyss-org/api/src/models/Block'
import Selection from '@databyss-org/api/src/models/Selection'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { Block as BlockInterface } from '@databyss-org/services/interfaces'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  createGroupId,
  createGroupDatabase,
} from '@databyss-org/api/src/lib/createUserDatabase'
import { uid } from '@databyss-org/data/lib/uid'
import { Role, User as UserInterface } from '@databyss-org/data/interfaces'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, EnvDict } from '../lib/util'

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

const fixDetail = (detail: any) => {
  if (!detail) {
    return detail
  }
  const _detail = cloneDeep(detail)
  // TODO: fix title in source modal
  if (_detail.title === '') {
    _detail.title = {
      textValue: '',
      ranges: [],
    }
  }
  // TODO: fix year in source modal
  if (_detail.year?.textValue) {
    _detail.year = {
      textValue: detail.year.textValue.toString(),
      ranges: detail.year.ranges || [],
    }
  }
  // TODO: fix journalTitle in source modal
  if (Array.isArray(_detail.journalTitle?.textValue)) {
    _detail.journalTitle = {
      textValue: detail.journalTitle.textValue[0],
      ranges: detail.journalTitle.ranges || [],
    }
  }
  return _detail
}

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
      const _mongoUser: any = await User.findOne({ email: this.args.email })
      if (!_mongoUser) {
        throw new Error('User not found')
      }
      const _defaultAccountId = _mongoUser.defaultAccount
      console.log(`Mongo accountId to migrate: ${_defaultAccountId}`)

      // STEP 2: Create the user's default group database and add design docs
      const _defaultGroupId = await createGroupId()
      const _couchGroupName = `g_${_defaultGroupId}`
      console.log(`⏳ Create group: ${_couchGroupName}`)
      await createGroupDatabase(`g_${_defaultGroupId}`)
      console.log(`✅ Group created: ${_defaultGroupId}`)
      const _groupDb = await cloudant.db.use<any>(_couchGroupName)
      const _mongoAccount: any = await Account.findOne({
        _id: _defaultAccountId,
      })
      console.log(`ℹ️  Old defaultPageId: ${_mongoAccount!.defaultPage}`)

      // STEP 3: Copy all Pages, Blocks, Selections and BlockRelations belonging to the user
      //   to the group db

      // get all Blocks for account
      const _mongoBlocks = await Block.find({
        account: _defaultAccountId,
      })

      /**
       * mongo block id => mongo block
       */
      const _mongoBlockDict = {}
      for (const _mongoBlock of _mongoBlocks) {
        _mongoBlockDict[_mongoBlock._id] = _mongoBlock
      }

      // get all Pages
      const _mongoPages = await Page.find({
        account: _defaultAccountId,
      })

      /**
       * mongo blockId => { mongo pageId => boolean }
       */
      const _relatedBlockMap = {}
      /**
       * mongo blockId => mongo pageId
       */
      const _blockToPageMap = {}
      _mongoPages.forEach((page) => {
        page.blocks.forEach((block) => {
          // aggregate all blocks into a Map so we don't write orphaned blocks
          _blockToPageMap[block._id] = page._id

          // if this is a topic or source block, also add the page into the related block map
          if (block.type && block.type.match(/^END_/)) {
            return
          }
          // lookup block type on block because it might be wrong on the page
          const _mongoBlock = _mongoBlockDict[block._id]
          if (!_mongoBlock) {
            console.log(`⚠️  Mongo block id not found: ${block.id}`)
            return
          }
          if (_mongoBlock.type !== 'ENTRY') {
            if (!_relatedBlockMap[block._id]) {
              _relatedBlockMap[block._id] = {}
            }
            _relatedBlockMap[block._id][page._id] = true
          }
        })
      })
      console.log(
        `ℹ️  Valid (non-orphaned) ENTRY count: ${
          Object.values(_blockToPageMap).length
        }`
      )
      console.log(
        `ℹ️  Block relation count: ${Object.keys(_relatedBlockMap).length}`
      )

      // insert the blocks in couch, generating new ids and keeping a map
      /**
       * mongo blockId => couch blockId
       */
      const _blockIdMap = {}
      /**
       * mongo blockId => block type
       */
      const _blockTypeMap = {}

      /**
       * Dict of couch docs to insert if they are referenced as related blocks
       * couch doc id => doc
       */
      const _maybeInsert = {}

      let _couchBlocksInserted = 0

      for (const _mongoBlock of _mongoBlocks) {
        // skip the block if it's an orphaned ENTRY (not in any pages)
        const _mongoBlockPage = _blockToPageMap[_mongoBlock._id]
        if (!_mongoBlockPage && _mongoBlock.type === 'ENTRY') {
          continue
        }
        const _couchBlockId = uid()

        // map the block id and type for reference later
        _blockIdMap[_mongoBlock._id] = _couchBlockId
        _blockTypeMap[_mongoBlock._id] = _mongoBlock.type

        const _couchBlock = {
          doctype: DocumentType.Block,
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
          detail: fixDetail(_mongoBlock.detail),
          ...getTimestamps(_mongoBlock),
        }

        // if the block isn't orphaned, insert it now
        if (_mongoBlockPage) {
          await _groupDb.insert(_couchBlock)
          _couchBlocksInserted += 1
        } else {
          // otherwise, store the couch doc and insert later if it's referenced as a related block
          _maybeInsert[_couchBlockId] = _couchBlock
        }

        // generate INLINE BlockRelations by scanning ranges for inline topics & sources
        for (const _range of _mongoBlock.text.ranges) {
          for (const _mark of _range.marks) {
            if (Array.isArray(_mark)) {
              if (!_relatedBlockMap[_mark[1]]) {
                _relatedBlockMap[_mark[1]] = {}
              }
              _relatedBlockMap[_mark[1]][_mongoBlockPage] = true
            }
          }
        }
      }
      console.log(`➡️  Migrated ${_couchBlocksInserted} Blocks`)
      console.log(
        `ℹ️  ${Object.values(_maybeInsert).length} maybe related blocks saved`
      )

      // update inline block ids

      // get all ENTRY blocks in couch
      const _couchBlocks = await _groupDb.find({
        selector: {
          type: { $eq: 'ENTRY' },
        },
      })

      let _inlineIdCount = 0
      let _deferredInsertCount = 0
      for (const _couchBlock of _couchBlocks.docs as BlockInterface[]) {
        let _hasInline = false
        for (const _range of _couchBlock.text.ranges) {
          for (const _mark of _range.marks) {
            if (Array.isArray(_mark)) {
              _hasInline = true
              let _couchInlineBlockId = _blockIdMap[_mark[1]]
              if (_couchInlineBlockId) {
                // save the related block to couch
                if (_maybeInsert[_couchInlineBlockId]) {
                  await _groupDb.upsert(
                    _couchInlineBlockId,
                    () => _maybeInsert[_couchInlineBlockId]
                  )
                  delete _maybeInsert[_couchInlineBlockId]
                  _deferredInsertCount += 1
                }
              } else {
                // related block missing in mongo, rebuild it
                _couchInlineBlockId = uid()
                const _textValue = _couchBlock.text.textValue.substr(
                  _range.offset + 1,
                  _range.length - 1
                )
                await _groupDb.insert({
                  doctype: DocumentType.Block,
                  _id: _couchInlineBlockId,
                  type: 'TOPIC',
                  text: {
                    textValue: _textValue,
                    ranges: [],
                  },
                  ...getTimestamps({}),
                })
                // map the new block and blockType so it can be used by the block relation step
                _blockIdMap[_mark[1]] = _couchInlineBlockId
                _blockTypeMap[_mark[1]] = 'TOPIC'
                console.log(
                  `ℹ️  created missing block for TOPIC: ${_textValue}`
                )
              }

              // update the blockId in the inline mark
              _mark[1] = _couchInlineBlockId
            }
          }
        }
        if (_hasInline) {
          await _groupDb.upsert(_couchBlock._id, () => _couchBlock)
          _inlineIdCount += 1
        }
      }
      console.log(`➡️  Updated ${_inlineIdCount} INLINE ids`)
      console.log(`➡️  Upserted ${_deferredInsertCount} related blocks`)

      // insert the Pages in couch, generating new ids and keeping a map of old => new id
      const _pageIdMap: { [mongoId: string]: string } = {}
      for (const _mongoPage of _mongoPages) {
        const _couchPageId = uid()
        _pageIdMap[_mongoPage._id] = _couchPageId

        // get the Selection from mongo
        const _mongoSelection = await Selection.findOne({
          _id: _mongoPage.selection._id,
        })
        let _couchSelectionId: string | null = null
        if (_mongoSelection) {
          // generate a new id for the Selection
          _couchSelectionId = uid()
          // insert the Selection in couch
          await _groupDb.insert({
            doctype: DocumentType.Selection,
            _id: _couchSelectionId,
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
        }

        await _groupDb.insert({
          doctype: DocumentType.Page,
          _id: _couchPageId,
          name: _mongoPage.name,
          archive: _mongoPage.archive,
          blocks: _mongoPage.blocks
            .map((_mongoBlock) => {
              const _pageBlockId = _blockIdMap[_mongoBlock._id]
              if (!_pageBlockId) {
                return null
              }
              let _pageBlockType = _mongoBlock.type
              if (!_pageBlockType) {
                console.log(
                  `⚠️  page.block missing type on page: ${_mongoPage.name}`
                )
                _pageBlockType = _blockTypeMap[_mongoBlock._id] || 'ENTRY'
              }
              return {
                type: _pageBlockType,
                _id: _pageBlockId,
              }
            })
            .filter((_b) => _b),
          ...(_couchSelectionId
            ? {
                selection: _couchSelectionId,
              }
            : {}),
          ...getTimestamps(_mongoPage),
        })
      }

      console.log(`➡️  Migrated ${Object.keys(_pageIdMap).length} Pages`)

      // generate BlockRelations using the _blockRelationMap
      let _relationsCount = 0
      for (const _relationBlockMongoId of Object.keys(_relatedBlockMap)) {
        // get the block id
        const _relationBlockId = _blockIdMap[_relationBlockMongoId]
        if (!_relationBlockId) {
          console.log(`⚠️  relation.block not found: ${_relationBlockMongoId}`)
          continue
        }

        // build the pages list by converting mongo pageId => couch pageId
        const _relationPageIds: string[] = []
        for (const _relationPageMongoId of Object.keys(
          _relatedBlockMap[_relationBlockMongoId]
        )) {
          const _relationPageId = _pageIdMap[_relationPageMongoId]
          if (!_relationPageId) {
            console.log(`⚠️  relation.page not found: ${_relationPageMongoId}`)
            continue
          }
          _relationPageIds.push(_relationPageId)
        }

        const _couchRelationId = `r_${_relationBlockId}`

        await _groupDb.insert({
          doctype: DocumentType.BlockRelation,
          _id: _couchRelationId,
          blockId: _relationBlockId,
          blockType: _blockTypeMap[_relationBlockMongoId],
          pages: _relationPageIds,
          ...getTimestamps({}),
        })
        _relationsCount += 1
      }
      console.log(`➡️  Migrated ${_relationsCount} BlockRelations`)

      // STEP 4: Add the userPreferences doc to the default group database
      //   with the defaultPageId

      // generate a userId for the user
      const _couchUserId = uid()

      await _groupDb.insert({
        _id: 'user_preference',
        doctype: DocumentType.UserPreferences,
        userId: _couchUserId,
        email: _mongoUser.email,
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

      // STEP 5: Create document in the Users db for the new user so they can login
      const _usersDb = await cloudant.db.use<UserInterface>('users')
      _usersDb.insert({
        _id: _couchUserId,
        email: _mongoUser.email,
        defaultGroupId: _defaultGroupId,
      })
      console.log(`👤 Created User document`)

      // TODO: STEP 6: Migrate pages shared by this user by creating a new group db for each page
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
