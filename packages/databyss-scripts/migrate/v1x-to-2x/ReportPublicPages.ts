/* eslint-disable no-await-in-loop */
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import ServerProcess from '../../lib/ServerProcess'
import { getEnv } from '../../lib/util'
import { getPublicPagePaths } from './getPublicPagePaths'

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
class ReportPublicPages extends ServerProcess {
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

      const _paths = await getPublicPagePaths()

      _paths.forEach((_path) => {
        console.log(`https://app.databyss.org/${_path}`)
      })

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

export default ReportPublicPages
