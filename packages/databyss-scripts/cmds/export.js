exports.command = 'export <command>'
exports.desc = 'Batch export Databyss data'
exports.builder = (yargs) =>
  yargs.commandDir('export_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
