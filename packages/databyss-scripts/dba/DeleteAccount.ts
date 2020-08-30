import Account from '@databyss-org/api/src/models/Account'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, EnvDict } from '../lib/util'

interface JobArgs {
  envName: string
  accountId: string
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
    this.emit('stdout', `Deleting account with _id: ${this.args.accountId}`)
    try {
      connectDB(this.env.API_MONGO_URI)
      const _account = await Account.findOne({ _id: this.args.accountId })
      if (!_account) {
        throw new Error('Account not found')
      }
      await _account.remove()
      this.emit('stdout', `✅ Account deleted.`)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      closeDB()
    }
  }
}

export default DeleteAccount
