exports.command = 'notifications <command>'
exports.desc = 'Manage user notifications'
exports.builder = (yargs) =>
  yargs
    .commandDir('notifications_cmds', { extensions: ['js', 'ts'] })
    .option('db', {
      describe:
        'The name of the database where notifications will be edited. If omitted, all databases will be edited.',
      demandOption: false,
      type: 'string',
    })
exports.handler = () => {}
