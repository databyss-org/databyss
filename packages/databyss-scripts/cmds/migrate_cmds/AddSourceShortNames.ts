import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  run,
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { BlockType, Source } from '@databyss-org/services/interfaces'
import { generateShortName } from '@databyss-org/services/sources/lib'
import { isSystemDatabase } from '../../lib/util'

export class AddSourceShortNames extends ServerProcess {
  constructor(argv) {
    super(argv, 'migrate.source-shortnames')
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
      // only update user databases
      if (isSystemDatabase(_dbName)) {
        continue
      }
      const _db = await cloudant.current.db.use(_dbName)

      // get all sources
      const _sources = await _db.find({
        selector: {
          doctype: DocumentType.Block,
          type: BlockType.Source,
          ...(this.args.email
            ? {
                belongsToGroup: _defaultGroupId,
              }
            : {}),
        },
      })

      for (const _doc of _sources.docs) {
        const _source = (_doc as unknown) as Source
        // if short name is set, skip this doc
        if (_source.name) {
          continue
        }
        await _db.upsert(_source._id, (oldDoc) => {
          ;(oldDoc as Source).name = generateShortName(_source)
          return oldDoc
        })
      }

      // dont exceed cloudant rate limit
      await sleep(100)
      this.logSuccess(_dbName)
    }
  }
}

exports.command = 'source-shortnames [email]'
exports.desc = 'Generate source.name (short name) if missing'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.describe('email', 'Only migrate user with this email')
exports.handler = (argv) => {
  const _job = new AddSourceShortNames(argv)
  run(_job)
}
