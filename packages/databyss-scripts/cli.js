/* eslint-disable no-unused-expressions */
const { getEnv } = require('./lib/util')
const yargs = require('yargs/yargs')

yargs(process.argv.slice(2))
  .scriptName('yarn cli')
  .wrap(null)
  .middleware((argv) => {
    argv.envName = argv.env
    argv.env = getEnv(argv.envName, true)
    return argv
  })
  .describe('env', 'environment name (e.g. production, development,...)')
  .demandOption(['env'])
  .string('logs')
  .describe('logs', 'create output and error logs in this directory')
  .commandDir('cmds', {
    // recurse: true,
    extensions: ['js', 'ts'],
  })
  .demandCommand().argv
