import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import { uid } from '@databyss-org/data/lib/uid'
import { DocumentType, PageDoc } from '@databyss-org/data/pouchdb/interfaces'
import {
  run,
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { BlockType } from '@databyss-org/services/interfaces'
import { MaybeDocument } from 'nano'
import { isSystemDatabase, timestampFields } from '../../lib/util'

export class MigratePageTitles extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.page-titles')
  }
  async run() {
    let _defaultGroupId: string | null = null
    if (this.args.email) {
      const _usersRes = await cloudant.models.Users.find({
        selector: {
          email: this.args.email,
        },
      })
      if (!_usersRes.docs.length) {
        this.logFailure(`User not found: ${this.args.email}`)
        return
      }
      _defaultGroupId = _usersRes.docs[0].defaultGroupId!
    }
    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only migrate user databases
      if (isSystemDatabase(_dbName)) {
        continue
      }
      const _db = await cloudant.current.db.use(_dbName)

      // get all pages
      const _pages = await _db.find({
        selector: {
          doctype: DocumentType.Page,
          ...(this.args.email
            ? {
                belongsToGroup: _defaultGroupId,
              }
            : {}),
        },
      })

      for (const _doc of _pages.docs) {
        const _page = (_doc as unknown) as PageDoc
        // create a title block
        const _blockId = uid()
        await _db.insert({
          _id: _blockId,
          doctype: DocumentType.Block,
          type: BlockType.Entry,
          text: {
            textValue: _page.name,
            ranges: [],
          },
          ...timestampFields(),
          belongsToGroup: _page.belongsToGroup,
        } as MaybeDocument)

        await _db.upsert(_page._id, (oldDoc) => {
          const _blocks = _page.blocks
          _blocks.unshift({
            _id: _blockId,
            type: BlockType.Entry,
          })
          ;(oldDoc as PageDoc).blocks = _blocks
          return oldDoc
        })
      }

      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`⬆️  migrated: ${_dbName}`)
    }
  }
}

exports.command = 'page-titles [email]'
exports.desc = 'Add page title as first block'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.describe('email', 'Only migrate user with this email')
exports.handler = (argv) => {
  const _job = new MigratePageTitles(argv)
  run(_job)
}
