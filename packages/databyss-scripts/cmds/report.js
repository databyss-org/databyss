exports.command = 'report <command>'
exports.desc = 'Generate report'
exports.builder = (yargs) =>
  yargs.commandDir('report_cmds', { extensions: ['js', 'ts'] })
exports.handler = () => {}
