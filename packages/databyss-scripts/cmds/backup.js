exports.command = 'backup <command>'
exports.desc = 'Backup DB data'
exports.builder = (yargs) =>
  yargs
    .commandDir('backup_cmds', { extensions: ['js', 'ts'] })
    .describe('path', 'Path to db backup file(s)')
    .demandOption('path')
exports.handler = () => {}
