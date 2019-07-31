const fs = require('fs')
const { pass, fail } = require('create-jest-runner')
const semverDiff = require('semver-diff')
const exec = require('./_util.js').exec

module.exports = ({ testPath }) => {
  const start = Date.now()

  if (process.env.CIRCLE_BRANCH === 'master') {
    console.log('Branch is master, skipping version check')
    return pass({ start, end: Date.now(), test: { path: testPath } })
  }
  const packageJsonRoot = JSON.parse(fs.readFileSync('package.json').toString())
  const packageJsonTest = JSON.parse(fs.readFileSync(testPath).toString())
  const packageJsonMaster = JSON.parse(exec(`git show master:package.json`))
  const semver = semverDiff(packageJsonMaster.version, packageJsonRoot.version)
  const testEqualToRoot = packageJsonTest.version === packageJsonRoot.version

  const end = Date.now()

  if (!semver) {
    const errorMessage = `Version bump is required. master@${
      packageJsonMaster.version
    }, current@${packageJsonRoot.version}`
    return fail({
      start,
      end,
      test: { path: testPath, errorMessage, title: 'Version bump' },
    })
  }
  if (!testEqualToRoot) {
    const errorMessage =
      'Package version must match workspace version. Please run `yarn sync-versions`'
    return fail({
      start,
      end,
      test: {
        path: testPath,
        errorMessage,
        title: 'Version mismatch.',
      },
    })
  }
  if (semver === 'minor') {
    console.warn(
      '⚠️  Version bump is MINOR, indicating a new release milesone. Is this what you meant?'
    )
  } else if (semver === 'major') {
    console.warn(
      '⚠️  Version bump is MAJOR, indicating breaking changes. Is this what you meant?'
    )
  }
  return pass({ start, end, test: { path: testPath } })
}
