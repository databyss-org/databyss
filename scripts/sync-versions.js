const fs = require('fs')
const path = require('path')

const packageJsonRoot = JSON.parse(fs.readFileSync('package.json').toString())
const packagePrefix = process.argv[2]

function syncVersion(packagePath) {
  console.log('sync version', packagePath)
  const packageJsonPath = path.join(packagePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString())
  packageJson.version = packageJsonRoot.version
  if (packageJson.peerDependencies) {
    Object.keys(packageJson.peerDependencies).forEach(depKey => {
      const re = new RegExp(`^${packagePrefix}`)
      if (depKey.match(re)) {
        packageJson.peerDependencies[depKey] = packageJsonRoot.version
      }
    })
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

fs.readdirSync('packages').forEach(
  p => p !== '.DS_Store' && syncVersion(`packages/${p}`)
)
