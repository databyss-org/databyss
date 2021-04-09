import { EditAction, EditNotifications } from './EditNotifications'

exports.command = 'remove <id>'
exports.desc = 'Remove a notification'
exports.builder = {}
exports.handler = (argv) => {
  new EditNotifications(argv, EditAction.Remove).runCli()
}
