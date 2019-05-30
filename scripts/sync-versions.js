const fs = require('fs')
const path = require('path')

const packageJsonRoot = JSON.parse(fs.readFileSync('package.json').toString())

function syncVersion(packagePath) {
  console.log('sync version', packagePath)
  const packageJsonPath = path.join(packagePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString())
  packageJson.version = packageJsonRoot.version
  if (packageJson.peerDependencies) {
    Object.keys(packageJson.peerDependencies).forEach(depKey => {
      packageJson.peerDependencies[depKey] = packageJsonRoot.version
    })
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

fs.readdirSync('packages').forEach(p => syncVersion(`packages/${p}`))
