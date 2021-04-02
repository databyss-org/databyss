/* eslint-disable no-unused-expressions */
const { getEnv } = require('./lib/util')
const yargs = require('yargs/yargs')

yargs(process.argv.slice(2))
  .scriptName('yarn cli')
  .demandOption(['env'])
  .wrap(null)
  .middleware((argv) => {
    argv.envName = argv.env
    argv.env = getEnv(argv.envName, true)
    return argv
  })
  .describe('env', 'environment name (e.g. production, development,...)')
  .commandDir('cmds', {
    // recurse: true,
    extensions: ['js', 'ts'],
  })
  .demandCommand().argv
