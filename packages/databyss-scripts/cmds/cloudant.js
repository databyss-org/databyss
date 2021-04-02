exports.command = 'cloudant <command>'
exports.desc = 'Manage Cloudant DBs'
exports.builder = (yargs) =>
  yargs.commandDir('cloudant_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
