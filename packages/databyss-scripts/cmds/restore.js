exports.command = 'restore <command>'
exports.desc = 'Restore DB data'
exports.builder = (yargs) =>
  yargs.commandDir('restore_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
