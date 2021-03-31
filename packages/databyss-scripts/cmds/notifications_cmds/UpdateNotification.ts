import { run } from '@databyss-org/scripts/lib'
import { EditAction, EditNotifications } from './EditNotifications'

exports.command = 'update <id> <file>'
exports.desc = 'Update a notification from a file'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new EditNotifications(argv, EditAction.Update)
  run(_job)
}
