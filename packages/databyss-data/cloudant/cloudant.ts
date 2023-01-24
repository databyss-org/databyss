import Cloudant from '@cloudant/cloudant'
import { DocumentGetResponse, DocumentScope } from 'nano'
import { SysUser, SysGroup, SysLogin, DesignDoc } from '../interfaces'

let _current: Cloudant.ServerScope
let _models: {
  Users: DocumentScope<SysUser>
  UsersDesignDoc: DocumentScope<DesignDoc>
  Logins: DocumentScope<SysLogin>
  LoginsDesignDoc: DocumentScope<DesignDoc>
  Groups: DocumentScope<SysGroup>
  GroupsDesignDoc: DocumentScope<DesignDoc>
}

const cloudantTryGet = (cloudant: Cloudant.ServerScope) => {
  const _tryGet = <D>(db: DocumentScope<D>) => (
    name: string
  ): Promise<(DocumentGetResponse & D) | null> =>
    new Promise<(DocumentGetResponse & D) | null>((resolve, reject) => {
      db.get(name)
        .then(resolve)
        .catch((err) => {
          // console.log(err)
          if (err.error === 'not_found') {
            resolve(null)
          } else {
            reject(err)
          }
        })
    })
  const _use = cloudant.db.use
  cloudant.db.use = <D>(dbName) => {
    const _db = _use<D>(dbName)
    _db.tryGet = _tryGet<D>(_db)
    return _db
  }
  return cloudant
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
      cloudantTryGet(_current)
    }
    return _current
  },
  get models() {
    if (!_models) {
      _models = {
        Users: cloudant.current.db.use<SysUser>('users'),
        UsersDesignDoc: cloudant.current.db.use<DesignDoc>('users'),
        Logins: cloudant.current.db.use<SysLogin>('logins'),
        LoginsDesignDoc: cloudant.current.db.use<DesignDoc>('logins'),
        Groups: cloudant.current.db.use<SysGroup>('groups'),
        GroupsDesignDoc: cloudant.current.db.use<DesignDoc>('groups'),
      }
    }
    return _models
  },
}
