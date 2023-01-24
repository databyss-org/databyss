import cloneDeep from 'clone-deep'
import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import Page from '@databyss-org/api/src/models/Page'
import Block from '@databyss-org/api/src/models/Block'
import createSharedGroupDatabase from '@databyss-org/api/src/lib/createSharedGroupDatabase'
import Selection from '@databyss-org/api/src/models/Selection'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import {
  Block as BlockInterface,
  BlockRelation,
} from '@databyss-org/services/interfaces'
import { DocumentType, PageDoc } from '@databyss-org/data/pouchdb/interfaces'
import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import {
  createGroupId,
  createGroupDatabase,
} from '@databyss-org/api/src/lib/createUserDatabase'
import { uid, uidlc } from '@databyss-org/data/lib/uid'
import { Role, SysUser } from '@databyss-org/data/interfaces'
import { ServerProcess, ServerProcessArgs } from '@databyss-org/scripts/lib'

const fixDetail = (block: any) => {
  if (block.type !== 'SOURCE') {
    return {}
  }
  if (!block.detail) {
    return {}
  }
  const _detail = cloneDeep(block.detail)
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
      textValue: _detail.year.textValue.toString(),
      ranges: _detail.year.ranges || [],
    }
  }
  // TODO: fix journalTitle in source modal
  if (Array.isArray(_detail.journalTitle?.textValue)) {
    _detail.journalTitle = {
      textValue: _detail.journalTitle.textValue[0],
      ranges: _detail.journalTitle.ranges || [],
    }
  }
  return { detail: _detail }
}

class MongoToCloudant extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'migrate.mongo-to-cloudant')
  }

  async run() {
    // connect to Mongo
    connectDB(this.args.env.API_MONGO_URI)

    if (this.args.email) {
      await this.migrateUser(this.args.email)
    } else {
      await this.migrateAll()
    }
  }

  async migrateAll() {
    let _resumed = !this.args.resume
    // get all active user accounts in Mongo
    const _users: any[] = await User.find()
    for (const _user of _users) {
      if (_user.email === this.args.resume) {
        this.logInfo('Resuming migration at', _user.email)
        _resumed = true
      }
      if (!_resumed) {
        continue
      }
      if (this.args.skip?.includes(_user.email)) {
        continue
      }
      await this.migrateUser(_user.email)
    }
    closeDB()
  }

  async migrateUser(email: string) {
    try {
      this.logInfo('👤', `Migrating user "${email}" to cloudant`)
      // (cloudant connects when the lib functions are called below)

      // STEP 1a: Get User record from mongo and save the defaultAccountId
      const _mongoUser: any = await User.findOne({ email })
      if (!_mongoUser) {
        throw new Error('User not found')
      }
      const _defaultAccountId = _mongoUser.defaultAccount
      this.logInfo(`Mongo accountId to migrate: ${_defaultAccountId}`)

      /**------------------------------------------------------------------
       * DEFAULT GROUP
       */

      // generate a userId for the user
      const _couchUserId = uid()

      // generate a groupId for the default group
      const _defaultGroupId = `g_${uidlc()}`
      await createGroupId({ groupId: _defaultGroupId, userId: _couchUserId })

      /**
       * Populate fields required on all docs, like timestamps and belongsToGroup
       */
      const getDocFields = (doc: any) => ({
        belongsToGroup: _defaultGroupId,
        createdAt: doc.createdAt
          ? new Date(doc.createdAt).getTime()
          : new Date().getTime(),
        modifiedAt: doc.updatedAt
          ? new Date(doc.updatedAt).getTime()
          : new Date().getTime(),
      })

      // STEP 2: Create the user's default group database and add design docs
      this.logInfo('⏳', `Create group: ${_defaultGroupId}`)
      await createGroupDatabase(_defaultGroupId)
      this.logSuccess(`Group created: ${_defaultGroupId}`)
      const _groupDb = await cloudant.current.db.use<any>(_defaultGroupId)
      const _mongoAccount: any = await Account.findOne({
        _id: _defaultAccountId,
      })
      this.logInfo(`Old defaultPageId: ${_mongoAccount!.defaultPage}`)

      // STEP 3: Copy all Pages, Blocks, Selections and BlockRelations belonging to the user
      //   to the group db

      /**------------------------------------------------------------------
       * PREPARE AND FILTER
       */

      // get all Pages
      const _mongoPages = await Page.find({
        account: _defaultAccountId,
      })

      /**
       * mongo blockId => { mongo pageId => boolean }
       */
      const _relatedBlockMap: {
        [blockId: string]: { [pageId: string]: boolean }
      } = {}
      /**
       * mongo blockId => mongo pageId
       */
      const _blockToPageMap: { [blockId: string]: string } = {}
      _mongoPages.forEach((page) => {
        page.blocks.forEach((block) => {
          // aggregate all blocks into a Map so we don't write orphaned blocks
          _blockToPageMap[block._id] = page._id
        })
      })
      this.logInfo(
        `Valid (non-orphaned) ENTRY count: ${
          Object.values(_blockToPageMap).length
        }`
      )

      // get all Blocks for account
      const _mongoBlocks = await Block.find({
        account: _defaultAccountId,
      })

      /**------------------------------------------------------------------
       * BLOCKS
       */

      /**
       * mongo blockId => couch blockId
       */
      const _blockIdMap: { [blockId: string]: string } = {}
      /**
       * mongo blockId => block type
       */
      const _blockTypeMap: { [blockId: string]: string } = {}

      // insert the blocks in couch, generating new ids and keeping a map
      for (const _mongoBlock of _mongoBlocks) {
        // skip the block if it's an orphaned ENTRY (not in any pages)
        const _mongoBlockPage = _blockToPageMap[_mongoBlock._id]
        if (!_mongoBlockPage && _mongoBlock.type === 'ENTRY') {
          continue
        }
        const _couchBlockId = uid()
        _blockIdMap[_mongoBlock._id] = _couchBlockId
        await _groupDb.insert({
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
          ...fixDetail(_mongoBlock),
          ...getDocFields(_mongoBlock),
        })

        _blockTypeMap[_mongoBlock._id] = _mongoBlock.type

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
      this.logSuccess(`Migrated ${Object.keys(_blockIdMap).length} Blocks`)

      // update inline block ids

      // get all ENTRY blocks in couch
      const _couchBlocks = await _groupDb.find({
        selector: {
          type: { $eq: 'ENTRY' },
        },
      })

      let _inlineIdCount = 0
      for (const _couchBlock of _couchBlocks.docs as BlockInterface[]) {
        let _hasInline = false
        for (const _range of _couchBlock.text.ranges) {
          for (const _mark of _range.marks) {
            if (Array.isArray(_mark)) {
              _hasInline = true
              let _couchInlineBlockId = _blockIdMap[_mark[1]]
              if (!_couchInlineBlockId) {
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
                  ...getDocFields({}),
                })
                // map the new block and blockType so it can be used by the block relation step
                _blockIdMap[_mark[1]] = _couchInlineBlockId
                _blockTypeMap[_mark[1]] = 'TOPIC'
                this.logInfo(`created missing block for TOPIC: ${_textValue}`)
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
      this.logSuccess(`Updated ${_inlineIdCount} INLINE ids`)

      /**------------------------------------------------------------------
       * PAGES
       */

      /**
       * Map of mongo pageId => couchPageId
       */
      const _pageIdMap: { [mongoId: string]: string } = {}

      /**
       * Map of mongo accound id => couch shared group db name
       */
      const _sharedAccountMap: { [mongoAccountId: string]: string } = {}

      // insert the Pages in couch, generating new ids and keeping a map of old => new id
      for (const _mongoPage of _mongoPages) {
        const _couchPageId = uidlc()
        _pageIdMap[_mongoPage._id] = _couchPageId

        // get the Selection from mongo
        const _mongoSelection = await Selection.findOne({
          _id: _mongoPage.selection._id,
        })
        // generate a new id for the Selection
        const _couchSelectionId = uid()

        // insert the Selection in couch
        await _groupDb.insert({
          doctype: DocumentType.Selection,
          _id: _couchSelectionId,
          focus: {
            index: _mongoSelection?.focus.index ?? 0,
            offset: _mongoSelection?.focus.offset ?? 0,
          },
          anchor: {
            index: _mongoSelection?.focus.index ?? 0,
            offset: _mongoSelection?.focus.offset ?? 0,
          },
          ...getDocFields(_mongoPage),
        })

        // create public group dbs in cloudant for each account in Page.sharedWith
        //   and store the mapping in _sharedAccountMap
        if (_mongoPage.sharedWith?.length) {
          for (const { account } of _mongoPage.sharedWith) {
            const _sharedGroupName = `p_${_couchPageId}`
            _sharedAccountMap[account] = _sharedGroupName
            // add document in system Groups db to register group as public
            await createSharedGroupDatabase({
              groupId: _sharedGroupName,
              userId: _couchUserId,
            })
          }
        }

        // build the page payload
        const _couchPage = {
          doctype: DocumentType.Page,
          _id: _couchPageId,
          name: _mongoPage.name,
          archive: _mongoPage.archive,
          sharedWithGroups: _mongoPage.sharedWith.map(
            ({ account }) => _sharedAccountMap[account]
          ),
          blocks: _mongoPage.blocks
            .map((_mongoBlock) => {
              const _pageBlockId = _blockIdMap[_mongoBlock._id]
              if (!_pageBlockId) {
                return null
              }
              // use the block type from the block to fix bad data integrity...
              let _pageBlockType = _blockTypeMap[_mongoBlock._id] || 'ENTRY'

              // ...unless it's an END_xxx type
              if (_mongoBlock.type?.match(/^END_/)) {
                _pageBlockType = _mongoBlock.type
              } else if (_pageBlockType !== 'ENTRY') {
                // if this is a topic or source block,
                //   also add the page into the related block map
                if (!_relatedBlockMap[_mongoBlock._id]) {
                  _relatedBlockMap[_mongoBlock._id] = {}
                }
                _relatedBlockMap[_mongoBlock._id][_mongoPage._id] = true
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
          ...getDocFields(_mongoPage),
        }

        // insert the page in the default group db
        await _groupDb.insert(_couchPage)

        // insert the page into the shared group dbs
        for (const { account } of _mongoPage.sharedWith) {
          const _sharedGroupName = _sharedAccountMap[account]
          const _sharedGroupDb = await cloudant.current.db.use<any>(
            _sharedGroupName
          )
          _sharedGroupDb.insert(_couchPage)
        }
      }

      this.logSuccess(`Migrated ${Object.keys(_pageIdMap).length} Pages`)
      this.logSuccess(
        `Migrated ${
          Object.keys(_sharedAccountMap).length
        } Shared Accounts (groups)`
      )

      /**------------------------------------------------------------------
       * BLOCK RELATIONS
       */

      /**
       * Map of couch pageId => [couch relationId]
       * (we'll use this to add relations to shared page dbs)
       */
      const _couchRelationsByPage: { [couchPageId: string]: string[] } = {}

      // generate BlockRelations using the _blockRelationMap
      this.logInfo(
        `Migrating ${Object.keys(_relatedBlockMap).length} block relations`
      )
      let _relationsCount = 0
      for (const _relationBlockMongoId of Object.keys(_relatedBlockMap)) {
        // get the block id
        const _relationBlockId = _blockIdMap[_relationBlockMongoId]
        if (!_relationBlockId) {
          this.logWarning(`relation.block not found: ${_relationBlockMongoId}`)
          continue
        }

        const _couchRelationId = `r_${_relationBlockId}`
        const _relationPageIds: string[] = []

        // build the pages list by converting mongo pageId => couch pageId
        for (const _relationPageMongoId of Object.keys(
          _relatedBlockMap[_relationBlockMongoId]
        )) {
          const _relationPageId = _pageIdMap[_relationPageMongoId]
          if (!_relationPageId) {
            this.logWarning(`relation.page not found: ${_relationPageMongoId}`)
            continue
          }
          _relationPageIds.push(_relationPageId)

          // store the page in the _couchRelationsByPageMap
          if (!_couchRelationsByPage[_relationPageId]) {
            _couchRelationsByPage[_relationPageId] = []
          }
          _couchRelationsByPage[_relationPageId].push(_couchRelationId)
        }

        await _groupDb.insert({
          doctype: DocumentType.BlockRelation,
          _id: _couchRelationId,
          blockId: _relationBlockId,
          blockType: _blockTypeMap[_relationBlockMongoId],
          pages: _relationPageIds,
          ...getDocFields({}),
        })
        _relationsCount += 1
      }
      this.logSuccess(`Migrated ${_relationsCount} BlockRelations`)

      /**
       * SHARED PAGE DEPENDENCIES
       */

      // migrate the Blocks and Relations for shared pages
      for (const _sharedGroupName of Object.values(_sharedAccountMap)) {
        this.logInfo(`Migrating shared group dependencies: ${_sharedGroupName}`)
        const _sharedPageId = _sharedGroupName.substring(2)
        const _sharedGroupDb = await cloudant.current.db.use<any>(
          _sharedGroupName
        )
        const _sharedPage: PageDoc = await _sharedGroupDb.get(_sharedPageId)

        const _addSharedWithGroups = async (_docid: string) => {
          let _doc
          try {
            _doc = await _groupDb.get(_docid)
          } catch (_) {
            this.logWarning(`shared page dependency doc not found: ${_docid}`)
            return null
          }
          if (!_doc.sharedWithGroups) {
            _doc.sharedWithGroups = []
          }
          _doc.sharedWithGroups.push(_sharedGroupName)
          await _groupDb.insert(_doc)
          delete _doc._rev
          try {
            await _sharedGroupDb.get(_docid)
          } catch (_) {
            await _sharedGroupDb.insert(_doc)
          }
          return _doc
        }

        // blocks
        for (const _pageBlock of _sharedPage.blocks) {
          await _addSharedWithGroups(_pageBlock._id)
        }

        // relations
        if (_couchRelationsByPage[_sharedPageId]) {
          for (const _couchRelationId of _couchRelationsByPage[_sharedPageId]) {
            const _couchRelation: BlockRelation = await _addSharedWithGroups(
              _couchRelationId
            )
            if (_couchRelation) {
              // ensure that the block referenced by the relation is shared
              //  (if it's inline it may not have already been migrated)
              await _addSharedWithGroups(_couchRelation.blockId)
            }
          }
        }

        // selection
        await _addSharedWithGroups(_sharedPage.selection)

        // add group doc
        const _groupDoc = {
          doctype: DocumentType.Group,
          _id: _sharedGroupName,
          pages: [_sharedPageId],
          public: true,
          sharedWithGroups: [_sharedGroupName],
          ...getDocFields({}),
        }
        await _groupDb.insert(_groupDoc)
        await _sharedGroupDb.insert(_groupDoc)
      }
      this.logSuccess(
        `Migrated Dependencies for ${
          Object.keys(_sharedAccountMap).length
        } Shared Pages`
      )

      /**------------------------------------------------------------------
       * USER PREFERENCES
       */

      // STEP 4: Add the userPreferences doc to the default group database
      //   with the defaultPageId

      await _groupDb.insert({
        _id: 'user_preference',
        doctype: DocumentType.UserPreferences,
        userId: _couchUserId,
        email: _mongoUser.email,
        groups: [
          {
            groupId: _defaultGroupId,
            role: Role.GroupAdmin,
            defaultPageId: _pageIdMap[_mongoAccount.defaultPage],
          },
        ],
        ...getDocFields({}),
      })
      this.logSuccess(`Migrated userPreferences`)

      /**------------------------------------------------------------------
       * USER
       */

      // STEP 5: Create document in the Users db for the new user so they can login
      const _usersDb = await cloudant.current.db.use<SysUser>('users')
      await _usersDb.insert({
        _id: _couchUserId,
        email: _mongoUser.email,
        defaultGroupId: _defaultGroupId,
        ...(_mongoUser.googleId
          ? {
              googleId: _mongoUser.googleId,
            }
          : {}),
      })
      this.logSuccess('Created User document')
    } catch (err) {
      this.logFailure(`[${email}]`)
      this.logError(`[${email}]`, err)
    }
  }
}

export default MongoToCloudant

exports.command = 'mongo-to-cloudant [email]'
exports.desc = 'Migrate Mongo user to Cloudant'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs
    .describe('skip', 'List of emails to skip')
    .array('skip')
    .example(
      '$0 migrate mongo-to-cloudant --skip jreed03@gmail.com paul@hine.works',
      'Migrate all users, skip "jreed03@gmail.com" and "paul@hine.works"'
    )
    .example(
      '$0 migrate mongo-to-cloudant jreed03@gmail.com',
      'Migrate user "jreed03@gmail.com"'
    )
    .string('resume')
    .describe(
      'resume',
      'Email where we want to resume the batch. Can be used with --skip to resume right after this user.'
    )
    .example(
      '$0 migrate mongo-to-cloudant --resume paul@hine.works',
      'Resume migration of all users at "paul@hine.works"'
    )
exports.handler = (argv: ServerProcessArgs) => {
  new MongoToCloudant(argv).runCli()
}
