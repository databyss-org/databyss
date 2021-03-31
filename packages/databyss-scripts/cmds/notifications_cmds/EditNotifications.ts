import fs from 'fs'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import {
  Notification,
  NotificationType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { uid } from '@databyss-org/data/lib/uid'

export enum EditAction {
  Add = 'add',
  Update = 'update',
  Remove = 'remove',
}

export class EditNotifications extends ServerProcess {
  action: EditAction

  constructor(argv, action: EditAction) {
    super(argv, `notifications.${action}`)
    this.action = action
  }

  async run() {
    let _notification: Partial<Notification>
    if (!(this.action === EditAction.Remove)) {
      _notification = {
        id: this.args.id || uid(),
        ...JSON.parse(fs.readFileSync(this.args.file).toString()),
      }
      this.log(`Notification ID: ${_notification.id}`)
    }

    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update primary groups (which start with "g_")
      if (!_dbName.startsWith('g_')) {
        continue
      }
      const _db = cloudant.current.db.use<UserPreference>(_dbName)

      const _prefs = await _db.tryGet('user_preference')
      // console.log(_prefs)
      if (!_prefs) {
        continue
      }
      if (!_prefs.notifications) {
        _prefs.notifications = []
      }
      const _toEdit = _prefs.notifications.filter((_n) => {
        if (!this.args.id) {
          // if no id specified, update/remove all notifications
          return !(this.action === EditAction.Remove)
        }
        return this.action === EditAction.Remove
          ? _n.id !== this.args.id
          : _n.id === this.args.id
      })
      if (this.action === EditAction.Remove) {
        // if removing, replace notifications with filtered notifications
        _prefs.notifications = _toEdit
      } else if (!_toEdit.length) {
        // insert new notification
        _prefs.notifications.push({
          type: NotificationType.Dialog,
          createdAt: Date.now(),
          ..._notification!,
        } as Notification)
      } else {
        // update notifications
        _toEdit.forEach((_n) => {
          Object.assign(_n, _notification)
        })
      }
      await _db.insert(_prefs)
      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`✅ ${_dbName}`)
    }
  }
}

exports.command = 'add <file>'
exports.desc = 'Add a notification from a file'
exports.builder = (yargs) =>
  yargs.describe('id', 'Specify an id for the notification').nargs('id', 1)
exports.handler = (argv) => {
  const _job = new EditNotifications(argv, EditAction.Add)
  run(_job)
}
