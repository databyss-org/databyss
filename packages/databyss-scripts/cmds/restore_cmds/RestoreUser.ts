import { ServerProcessArgs } from '@databyss-org/scripts/lib'
import { Restore } from './Restore'

exports.command = 'user <email> [options]'
exports.desc = 'Restore a single user'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.example(
    '$0 restore user paul@hine.works --path ../backups/production',
    'Restore user with email `paul@hine.works` from "../backups/production'
  )
exports.handler = (argv: ServerProcessArgs) => {
  new Restore(argv).runCli()
}
