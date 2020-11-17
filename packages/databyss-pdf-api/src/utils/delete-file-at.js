const fs = require('fs')

/**
 *
 * @param {string} filePath The full path to the file to delete.
 * See `fs.unlink()` documentation.
 * @param {object} options Additional options
 * - `verbose`: Whether or not the method logs to the console. Defaults to `true`
 */
export default async (filePath, options) => {
  const verbose = options && options.verbose ? options.verbose : true

  if (verbose) {
    console.log(`🧹 Deleting file from "${filePath}"...`)
  }

  try {
    await fs.unlink(filePath, (err) => Promise.reject(err))
  } catch (error) {
    return Promise.reject(error)
  }

  if (verbose) {
    console.log(`✅ Cleanup completed: file deleted from "${filePath}".`)
  }

  return Promise.resolve()
}
