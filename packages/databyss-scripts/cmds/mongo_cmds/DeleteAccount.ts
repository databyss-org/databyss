import Account from '@databyss-org/api/src/models/Account'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { run, ServerProcess } from '@databyss-org/scripts/lib'

class DeleteAccount extends ServerProcess {
  constructor(argv) {
    super(argv, 'mongo.delete-account')
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

exports.command = 'delete-account <accountId>'
exports.desc = 'Delete account by ID'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new DeleteAccount(argv)
  run(_job)
}
