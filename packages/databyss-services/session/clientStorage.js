import _ from 'lodash'
import { upsert, getUserSession } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { resetPouchDb } from '@databyss-org/data/pouchdb/db'

// TODO: Add native versions of these

export const setAuthToken = (token) => {
  localStorage.setItem('token', token)
}

export const setUserId = (userId) => {
  localStorage.setItem('userId', userId)
}

export const getUserId = () => {
  let _id
  try {
    _id = localStorage.getItem('userId')
  } catch (err) {
    console.error('no id found')
  }
  return _id
}

export const getAuthToken = () => {
  let _token
  try {
    _token = localStorage.getItem('token')
  } catch (err) {
    console.error('no token found')
  }
  return _token
}

// export const getAuthToken = async () => {
//   const _res = await getUserSession()
//   return _res?.token
// }

export const getAccountId = async () => {
  const _userSession = await getUserSession()

  return _userSession?.defaultGroupId
}

export const setDefaultPageId = async (value) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: 'user_preferences',
    doc: { defaultPageId: value },
  })
}

export const clearLocalStorage = () => {
  localStorage.clear()
}

export const deletePouchDbs = async () => {
  let dbs = await window.indexedDB.databases()
  dbs = dbs.filter((db) => db.name.includes('_pouch_'))

  // if we don't do this, we get an error that we're accessing
  //  the db while the connection is closing
  await resetPouchDb()

  await Promise.all(
    dbs.map(
      (db) =>
        new Promise((resolve, reject) => {
          // deletes index databases
          const request = indexedDB.deleteDatabase(db.name)
          request.onsuccess = resolve
          request.onerror = reject
        })
    )
  )

  clearLocalStorage()
}

export const setUserSession = async (session) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: 'user_preferences',
    doc: _.pick(session, [
      '_id',
      'token',
      '$type',
      'userId',
      'email',
      'defaultGroupId',
      'groups',
    ]),
  })
}

export const setPouchSecret = (credentials) => {
  let keyMap = localStorage.getItem('pouch_secrets')
  if (!keyMap) {
    keyMap = {}
  } else {
    keyMap = JSON.parse(keyMap)
  }

  credentials.forEach((g) => {
    keyMap[g.groupId] = { dbPassword: g.dbPassword, dbKey: g.dbKey }
  })
  localStorage.setItem('pouch_secrets', JSON.stringify(keyMap))
}

export const getDbCredentialsFromLocal = (groupId) => {
  let keyMap = localStorage.getItem('pouch_secrets')

  if (!keyMap) {
    console.error('no credentials found')
  } else {
    keyMap = JSON.parse(keyMap)
  }

  return keyMap[groupId]
}

export const getPouchSecret = () =>
  JSON.parse(localStorage.getItem('pouch_secrets'))

export const localStorageHasSession = async () => {
  // compose the user session
  let session

  const token = getAuthToken()

  // get user preferences
  const _userSession = await getUserSession()

  if (token && _userSession) {
    session = {
      token,
      userId: _userSession._id,
      email: _userSession.email,
      defaultPageId: _userSession.groups[0].defaultPageId,
      defaultGroupId: _userSession.defaultGroupId,
    }
  }

  return session
}
