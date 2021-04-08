exports.command = 'cli-debug <command>'
exports.desc = 'debug the CLI app'
exports.builder = (yargs) =>
  yargs.commandDir('debug_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
