import { run } from '@databyss-org/scripts/lib'
import { EditAction, EditNotifications } from './EditNotifications'

exports.command = 'remove <id>'
exports.desc = 'Remove a notification'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new EditNotifications(argv, EditAction.Remove)
  run(_job)
}
