exports.command = 'mongo <command>'
exports.desc = 'Manage MongoDb (legacy)'
exports.builder = (yargs) =>
  yargs.commandDir('mongo_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
