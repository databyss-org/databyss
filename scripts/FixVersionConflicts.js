/* eslint-disable no-continue, no-await-in-loop, no-restricted-syntax */
const fs = require('fs')
const path = require('path')
const jsonDiff = require('json-diff')
const ServerProcess = require('./ServerProcess')

function flattenJson(source, delimiter = '.', filter) {
  const result = {}
  ;(function flat(obj, stack) {
    Object.keys(obj).forEach(k => {
      const s = stack.concat([k])
      const v = obj[k]
      if (filter && filter(k, v)) return
      if (typeof v === 'object') flat(v, s)
      else result[s.join(delimiter)] = v
    })
  })(source, [])
  return result
}

class SyncVersions extends ServerProcess {
  constructor(packagePrefix) {
    super()
    this.packagePrefix = packagePrefix
  }
  // Scans `packagePath` file for merge/rebase conflicts
  // indicated by `>>>>` string. If there are conflicts, it compares the version
  // of one merge source against the other, chooses the higher version, and uses
  // that whole JSON file as the conflict resolution.
  // Fails with a warning if there are any changes to keys in the JSONs, as this
  // indicates that a manual merge is necessary
  async fixVersionConflicts(packagePath) {
    const packageJsonPath = path.join(packagePath, 'package.json')
    const packageText = fs.readFileSync(packageJsonPath).toString()
    if (packageText.indexOf('>>>>') < 0) {
      this.log('no conflicts', packageJsonPath)
      return
    }
    this.log(`fixing conflict`, packageJsonPath)
    await this.exec(
      `cd ${this.cwd} && git checkout --ours -- ${packageJsonPath}`
    )
    const oursPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath).toString()
    )
    await this.exec(
      `cd ${this.cwd} && git checkout --theirs -- ${packageJsonPath}`
    )
    const theirsPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath).toString()
    )
    // restore package.json to conflicted state
    await this.exec(`cd ${this.cwd} && git checkout -m -- ${packageJsonPath}`)

    if (
      !this.fileIsFixable(oursPackageJson, theirsPackageJson, packageJsonPath)
    ) {
      return
    }

    const chosenPackageJson =
      oursPackageJson.version > theirsPackageJson
        ? oursPackageJson
        : theirsPackageJson
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(chosenPackageJson, null, 2)
    )
  }

  fileIsFixable(oursPackageJson, theirsPackageJson, packageJsonPath) {
    if (jsonDiff.diff(oursPackageJson, theirsPackageJson, { keysOnly: true })) {
      this.log(
        `keys are different, manual merge required (not fixed)`,
        packageJsonPath
      )
      return false
    }
    const keysWithChanges = Object.keys(
      flattenJson(jsonDiff.diff(oursPackageJson, theirsPackageJson))
    )
    // if key is not 'version' and does not contain our package prefix
    // (i.e. is not a peerDependency), fail with error
    if (
      keysWithChanges.find(key => {
        if (!key.match(/^version/) && key.indexOf(this.packagePrefix) < 0) {
          this.log('value changed in key', key)
          return true
        }
        return false
      })
    ) {
      this.log(
        `package.json values have changed, manual merge required (not fixed)`,
        packageJsonPath
      )
      return false
    }
    return true
  }

  async run(packagePrefix, cwd = '.') {
    this.cwd = cwd
    this.packagePrefix = packagePrefix
    await this.fixVersionConflicts(`${cwd}`)
    for (const p of fs.readdirSync(`${cwd}/packages`)) {
      if (p === '.DS_Store') {
        continue
      }
      await this.fixVersionConflicts(`${cwd}/packages/${p}`)
    }
  }
}

if (require.main === module) {
  const dump = new SyncVersions()
  dump.on('end', () => {
    process.exit()
  })
  dump.on('stdout', msg => {
    console.log(msg)
  })
  dump.on('stderr', msg => {
    console.error(msg)
  })
  const packagePrefix = process.argv[2]
  const cwd = process.argv[3]
  dump.run(packagePrefix, cwd)
}
