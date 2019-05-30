const childProcess = require('child_process')

// exec helper
// @cmd: the commoand to execute
const exec = cmd => {
  try {
    const stdout = childProcess
      .execSync(cmd, { cwd: process.argv[2] })
      .toString()
    return stdout
  } catch (err) {
    console.log(err.stdout.toString(), err.stderr.toString())
    process.exit(1)
  }
  return null
}

module.exports = { exec }
