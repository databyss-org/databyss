exports.command = 'backup <command>'
exports.desc = 'Backup DB data'
exports.builder = (yargs) =>
  yargs.commandDir('backup_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
