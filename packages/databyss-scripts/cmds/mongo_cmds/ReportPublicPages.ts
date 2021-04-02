/* eslint-disable no-await-in-loop */
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import { run } from '@databyss-org/scripts/lib/runner'
import ServerProcess from '@databyss-org/scripts/lib/ServerProcess'
import { getPublicPagePaths } from './getPublicPagePaths'

/**
 * Generates a report of all public pages
 */
class ReportPublicPages extends ServerProcess {
  constructor(argv) {
    super(argv, 'mongo.public-pages')
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

exports.command = 'public-pages'
exports.desc = 'Generate a report of all public pages'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new ReportPublicPages(argv)
  run(_job)
}
