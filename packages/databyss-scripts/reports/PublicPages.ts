/* eslint-disable no-await-in-loop */
import Account from '@databyss-org/api/src/models/Account'
import User from '@databyss-org/api/src/models/User'
import Page from '@databyss-org/api/src/models/Page'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

interface EnvDict {
  [key: string]: string
}

interface JobArgs {
  /**
   * The environment to use for the connection string
   */
  envName: string
}

/**
 * Generates a report of all public pages
 */
class PublicPages extends ServerProcess {
  args: JobArgs
  fromDb: string | undefined
  env: EnvDict

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
  }
  async run() {
    this.emit('stdout', `Generating report of all public pages`)

    try {
      connectDB(this.env.API_MONGO_URI)
      const _publicAccounts = await Account.find({
        isPublic: true,
      })

      for (const _account of _publicAccounts) {
        // console.log(_account.id)

        const _pages = await Page.find({
          'sharedWith.account': _account.id,
        })

        if (!_pages.length) {
          console.log(`⚠️  no pages found for account ${_account.id}`)
          continue
        }

        if (_pages.length > 1) {
          console.log(`⚠️  more than one page found for account ${_account.id}`)
          continue
        }

        const _user: any = await User.findOne({
          defaultAccount: _pages[0].account,
        })
        if (!_user) {
          console.log(`⚠️  no user found for account ${_pages[0].account}`)
          continue
        }
        console.log(
          `${_user.email}, https://app.databyss.org/${_account.id}/pages/${_pages[0].id}`
        )
      }

      this.emit('stdout', `✅ Report complete`)

      this.emit('end', true)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      await closeDB()
    }
  }
}

export default PublicPages
