import Cloudant from '@cloudant/cloudant'
import { DocumentScope } from 'nano'
import { User, Group, Login, DesignDoc } from '../interfaces'

let _current: Cloudant.ServerScope
let _models: {
  Users: DocumentScope<User>
  UsersDesignDoc: DocumentScope<DesignDoc>
  Logins: DocumentScope<Login>
  LoginsDesignDoc: DocumentScope<DesignDoc>
  Groups: DocumentScope<Group>
  GroupsDesignDoc: DocumentScope<DesignDoc>
}

export const cloudant = {
  get current() {
    if (!_current) {
      const _url = `https://${process.env.CLOUDANT_USERNAME}:${process.env.CLOUDANT_PASSWORD}@${process.env.REACT_APP_CLOUDANT_HOST}`
      _current = Cloudant({
        url: _url,
        maxAttempt: 5,
        plugins: { retry: { retryErrors: false, retryStatusCodes: [429] } },
      })
      require('cloudant-upsert')(_current)
    }
    return _current
  },
  get models() {
    if (!_models) {
      _models = {
        Users: cloudant.current.db.use<User>('users'),
        UsersDesignDoc: cloudant.current.db.use<DesignDoc>('users'),
        Logins: cloudant.current.db.use<Login>('logins'),
        LoginsDesignDoc: cloudant.current.db.use<DesignDoc>('logins'),
        Groups: cloudant.current.db.use<Group>('groups'),
        GroupsDesignDoc: cloudant.current.db.use<DesignDoc>('groups'),
      }
    }
    return _models
  },
}
