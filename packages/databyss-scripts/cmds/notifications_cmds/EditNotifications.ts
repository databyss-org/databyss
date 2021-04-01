import fs from 'fs'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { run, ServerProcess, sleep } from '@databyss-org/scripts/lib'
import {
  Notification,
  NotificationType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { uid } from '@databyss-org/data/lib/uid'

export const DefaultMessageDict: {
  [notificationType in NotificationType]: string | null
} = {
  [NotificationType.ForceUpdate]:
    "We've made some changes on our servers that require you to update to the latest version. Click OK to update and reload the application. All your changes will be preserved.",
  [NotificationType.Dialog]: null,
  [NotificationType.Sticky]: null,
}

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

  upsertNotification(
    prefs: UserPreference,
    notification: Partial<Notification>
  ) {
    const _toEdit = prefs.notifications?.find((_n) => _n.id === notification.id)
    if (!_toEdit) {
      // insert new notification
      prefs.notifications!.push({
        ...notification!,
        createdAt: Date.now(),
      } as Notification)
    } else {
      // update notification
      Object.assign(_toEdit, notification)
    }
    return prefs
  }

  removeNotification(prefs: UserPreference, id: string) {
    if (!prefs.notifications) {
      return prefs
    }
    // if removing, replace notifications with filtered notifications
    prefs.notifications = prefs.notifications.filter((_n) => _n.id !== id)
    return prefs
  }

  async run() {
    let _notifications: Partial<Notification>[] = []
    if (!(this.action === EditAction.Remove)) {
      try {
        _notifications = JSON.parse(fs.readFileSync(this.args.file).toString())
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw new Error('Notifications file not found')
        } else {
          throw new Error('Notifications file is not properly formed JSON')
        }
      }
      if (!Array.isArray(_notifications)) {
        throw new Error(
          'Notifications file must be an array of Notification objects'
        )
      }
      _notifications.forEach((_notification) => {
        // apply notification defaults
        _notification.id = _notification.id || uid()
        _notification.type = _notification.type || NotificationType.Dialog

        _notification.messageHtml =
          _notification.messageHtml ??
          DefaultMessageDict[_notification.type] ??
          undefined
        if (!_notification.messageHtml) {
          throw new Error(
            `Notifications of type ${_notification.type} require a messageHtml value`
          )
        }
        this.log(`Notification ID: ${_notification.id}`)
      })
      // write notifications back to file to preserve ids
      fs.writeFileSync(this.args.file, JSON.stringify(_notifications, null, 2))
    }

    const _dbs = await cloudant.current.db.list()
    for (const _dbName of _dbs) {
      // only update primary groups (which start with "g_")
      if (!_dbName.startsWith('g_')) {
        continue
      }
      const _db = cloudant.current.db.use<UserPreference>(_dbName)

      const _prefs = await _db.tryGet('user_preference')
      if (!_prefs) {
        continue
      }

      if (this.action === EditAction.Remove) {
        this.removeNotification(_prefs, this.args.id)
      } else {
        if (!_prefs.notifications) {
          _prefs.notifications = []
        }
        _notifications.forEach((_notification) =>
          this.upsertNotification(_prefs, _notification)
        )
      }
      await _db.insert(_prefs)
      // dont exceed cloudant rate limit
      await sleep(100)
      this.log(`✅ ${_dbName}`)
    }
  }
}

exports.command = 'add <file>'
exports.desc =
  'Add notification(s) from a file. Must be formatted as a JSON array.'
exports.builder = {}
exports.handler = (argv) => {
  const _job = new EditNotifications(argv, EditAction.Add)
  run(_job)
}
