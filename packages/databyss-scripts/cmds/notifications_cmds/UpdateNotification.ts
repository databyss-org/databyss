import { run } from '@databyss-org/scripts/lib'
import { EditAction, EditNotifications } from './EditNotifications'

exports.command = 'update <file>'
exports.desc =
  'Update notifications from a file. Must be formatted as a JSON array, and elements must contain an id.'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new EditNotifications(argv, EditAction.Update)
  run(_job)
}
