exports.command = 'restore <command>'
exports.desc = 'Restore DB data'
exports.builder = (yargs) =>
  yargs
    .describe('path', 'Path to db backup file(s)')
    .demandOption('path')
    .describe(
      'replace',
      'Replace databases if they exist. If `false` and a database exists, job will exit with error.'
    )
    .default('replace', false)
    .boolean('replace')
    .commandDir('restore_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
