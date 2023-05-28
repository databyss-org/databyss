import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import { ServerProcess, ServerProcessArgs } from '@databyss-org/scripts/lib'

export class ActiveUserReport extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'report.active_users')
  }
  async run() {
    this.logInfo(`Active users in the last ${this.args.days} days`)
    const users = await cloudant.models.Users.list({
      include_docs: true,
      // limit: 100,
    })
    for (const user of users.rows) {
      // find most recent lastModified in primary group database
      const groupId = user.doc?.defaultGroupId
      if (!groupId) {
        // this.logWarning(user.doc?.email, 'no default group, skipping')
        continue
      }
      const db = cloudant.current.db.use(groupId)
      const docs = await db.list({
        include_docs: true,
        // limit: 100,
      })
      if (!docs.rows) {
        // this.logWarning(groupId, 'no docs, skipping')
        continue
      }
      let mostRecent = 0
      let sourceCount = 0
      let topicCount = 0
      let pageCount = 0
      let embedCount = 0
      let sharedGroupCount = 0
      docs.rows.forEach((doc) => {
        const _doc = doc.doc as any
        if ((_doc.modifiedAt ?? _doc.createdAt) > mostRecent) {
          mostRecent = _doc.modifiedAt ?? _doc.createdAt
        }
        if (_doc.doctype === 'GROUP' && _doc.public) {
          sharedGroupCount += 1
        }
        if (_doc.doctype === 'PAGE') {
          pageCount += 1
        }
        if (_doc.doctype === 'BLOCK') {
          if (_doc.type === 'SOURCE') {
            sourceCount += 1
          }
          if (_doc.type === 'TOPIC') {
            topicCount += 1
          }
          if (_doc.type === 'EMBED') {
            embedCount += 1
          }
        }
      })
      const delim = ','
      const meetsActiveCriteria =
        !this.args.days ||
        (this.args.days &&
          (Date.now() - mostRecent) / (1000 * 60 * 60 * 24) < this.args.days)
      if (
        (!this.args.inverse && meetsActiveCriteria) ||
        (this.args.inverse && !meetsActiveCriteria)
      ) {
        this.logRaw(
          [
            user.doc?.email,
            new Date(mostRecent).toDateString(),
            pageCount,
            sharedGroupCount,
            sourceCount,
            topicCount,
            embedCount,
          ].join(delim)
        )
      }
    }
    this.logSuccess('Total users:', users.total_rows)
  }
}

exports.command = 'active'
exports.desc = 'Generate active user report'
exports.builder = (yargs) =>
  yargs
    .option('days', {
      describe:
        'The number of days to look back in time for user activity (to count as active).',
      demandOption: false,
      type: 'number',
    })
    .option('inverse', {
      type: 'boolean',
      demandOption: false,
      describe:
        'If set, report all users who do not match the activity criteria',
    })
exports.handler = (argv: ServerProcessArgs) => {
  new ActiveUserReport(argv).runCli()
}
