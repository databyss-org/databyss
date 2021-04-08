import { ServerProcess, ServerProcessArgs } from '@databyss-org/scripts/lib'

export class CliLogging extends ServerProcess {
  constructor(argv: ServerProcessArgs) {
    super(argv, 'debug.logging')
  }
  async run() {
    this.logInfo('logInfo')
    this.logInfo('logInfo2')
    this.logSuccess('logSuccess')
    this.logFailure('logFailure')
    this.logWarning('logWarning')
    console.log('console.log')
    this.logError('logError')
    console.error('console.error')
  }
}

exports.command = 'logging'
exports.desc = 'Try logging some things'
exports.builder = {}
exports.handler = (argv: ServerProcessArgs) => {
  new CliLogging(argv).runCli()
}
