exports.command = 'notifications <command>'
exports.desc = 'Manage user notifications'
exports.builder = (yargs) =>
  yargs.commandDir('notifications_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
