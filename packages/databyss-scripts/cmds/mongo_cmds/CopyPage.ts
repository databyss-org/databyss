/* eslint-disable no-await-in-loop */
import { copyPage } from '@databyss-org/api/src/lib/pages'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { run, ServerProcess } from '@databyss-org/scripts/lib'

class CopyPage extends ServerProcess {
  constructor(argv) {
    super(argv, 'mongo.copy-page')
  }
  async run() {
    this.emit(
      'stdout',
      `Copying Page with _id "${this.args.pageId}" to account: "${this.args.toAccountId}"`
    )

    try {
      connectDB(this.env.API_MONGO_URI)
      const _pageCopyId = await copyPage(this.args)

      this.emit('stdout', `✅ Saved page with new _id: ${_pageCopyId}`)

      this.emit('end', true)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      await closeDB()
    }
  }
}

export default CopyPage

exports.command = 'copy-page <pageId> <toAccoundId>'
exports.desc = 'Copies a page from one account to another'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new CopyPage(argv)
  run(_job)
}
