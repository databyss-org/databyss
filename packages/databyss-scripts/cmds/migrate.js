exports.command = 'migrate <command>'
exports.desc = 'Migrate user data'
exports.builder = (yargs) =>
  yargs.commandDir('migrate_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
