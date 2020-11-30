/* 
This script allows the build pipeline to pause until 
a specific version of a resource has been deployed 
by another process.
 
Set BUILD_WAIT_FOR_VERSION_URL environment variable 
to the url of a JSON file with a version key on it.

The version from the environment variable must match
the version in package.json before the script 
completes.
*/

const POLL_DELAY_MS = 10000

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const fetch = require('node-fetch')
const packageJson = require('../package.json')

console.log(dotenvExpand(dotenv.config()))
const versionUrl = process.env.BUILD_WAIT_FOR_VERSION_URL
if (!versionUrl) {
  process.exit(0)
}
console.log('[⏳ wait-for-version] URL', versionUrl)

function pollVersion(count = 0) {
  fetch(versionUrl)
    .then((res) => {
      res.json().then((json) => {
        console.log('[⏳ wait-for-version] got version: ', json.version)
        if (json.version === packageJson.version) {
          console.log('[⏳ wait-for-version] ✅ versions match')
        } else {
          console.log(
            '[⏳ wait-for-version] 💤 version mismatch, sleep and poll again'
          )
          setTimeout(() => pollVersion(count + 1), POLL_DELAY_MS)
        }
      })
    })
    .catch((err) => {
      console.error('[⏳ wait-for-version]', err)
      process.exit(1)
    })
}

console.log('[⏳ wait-for-version] target version: ', packageJson.version)
pollVersion()
