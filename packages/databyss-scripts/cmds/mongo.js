exports.command = 'mongo <command>'
exports.desc = 'Manage Mongo DBs'
exports.builder = (yargs) =>
  yargs.commandDir('mongo_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
