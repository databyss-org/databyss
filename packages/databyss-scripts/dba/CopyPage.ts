/* eslint-disable no-await-in-loop */
import { copyPage } from '@databyss-org/api/src/lib/pages'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import ServerProcess from '../lib/ServerProcess'
import { getEnv, objectId } from '../lib/util'

interface EnvDict {
  [key: string]: string
}

interface JobArgs {
  /**
   * The environment to use for the connection string
   */
  envName: string
  /**
   * The _id of the page to copy
   */
  pageId: string
  /**
   * The _id of the account to copy the page to
   */
  toAccountId: string
}

/**
 * Copies a page from one account to another
 */
class CopyPage extends ServerProcess {
  args: JobArgs
  fromDb: string | undefined
  env: EnvDict

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
  }
  async run() {
    this.emit(
      'stdout',
      `Copying Page with _id "${this.args.pageId}" to account: "${
        this.args.toAccountId
      }"`
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
