import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { BlockType } from '@databyss-org/services/interfaces'

export class DriveUsersReport extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'report.drive_users')
  }

  async run() {
    const delay = Number(this.args.delay ?? 500)

    this.logInfo('Searching for users with Databyss Drive entities')
    this.logRaw('email,defaultGroupId,entityId,storageKey')

    const users = this.args.email
      ? await cloudant.models.Users.find({
          selector: {
            email: this.args.email,
          },
        })
      : await cloudant.models.Users.list({
          include_docs: true,
        })

    const userDocs = this.args.email ? users.docs : users.rows.map((u) => u.doc)

    let matchedUsers = 0

    for (const user of userDocs) {
      const defaultGroupId = user?.defaultGroupId
      if (!defaultGroupId) {
        continue
      }

      try {
        const db = cloudant.current.db.use(defaultGroupId)

        const embeds = await db.find({
          selector: {
            doctype: DocumentType.Block,
            type: BlockType.Embed,
            'detail.fileDetail.storageKey': { $exists: true },
          },
          limit: 1,
        })

        if (embeds.docs.length) {
          matchedUsers += 1
          const entity = embeds.docs[0] as any
          this.logRaw(
            [
              user.email,
              defaultGroupId,
              entity._id,
              entity?.detail?.fileDetail?.storageKey,
            ].join(',')
          )
        }
      } catch (err) {
        this.logWarning(`Failed to scan db ${defaultGroupId}: ${err.message}`)
      }

      // Delay each DB query to reduce Cloudant rate limit pressure.
      await sleep(delay)
    }

    this.logSuccess('Total users scanned:', userDocs.length)
    this.logSuccess('Users with drive entities:', matchedUsers)
  }
}

exports.command = 'drive-users [email]'
exports.desc = 'Generate report of users with entities stored in Databyss Drive'
exports.builder = (yargs) =>
  yargs
    .positional('email', {
      describe: 'Only scan this user email',
      type: 'string',
    })
    .option('delay', {
      describe: 'Sleep duration in ms between user database scans',
      type: 'number',
      default: 500,
    })

exports.handler = (argv: ServerProcessArgs) => {
  new DriveUsersReport(argv).runCli()
}
