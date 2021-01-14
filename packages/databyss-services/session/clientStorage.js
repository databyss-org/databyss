import _ from 'lodash'
import { upsert, getUserPreferences } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { db } from '@databyss-org/data/pouchdb/db'

// TODO: Add native versions of these
export const setAuthToken = async (value) => {
  const token = value && !_.isEmpty(value.token) ? value.token : value

  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: { token },
  })
}

export const setCredentials = async (group) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: { dbKey: group.dbKey, dbPassword: group.dbPassword },
  })
}

export const deleteUserPreferences = async () => {
  const _res = await getUserPreferences()
  if (_res) {
    db.remove(_res)
  }
}

export const getAuthToken = async () => {
  const _res = await getUserPreferences()
  return _res?.token
}

export const setAccountId = async (value) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: { account: value },
  })
}

export const getAccountId = async () => {
  const _res = await getUserPreferences()
  return _res?.account
}

export const setDefaultPageId = async (value) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: { defaultPageId: value },
  })
  console.log('DEFAULT PAGE UPSERTED')
  // localStorage.setItem('defaultPageId', value)
}

export const deletePouchDbs = async () => {
  let dbs = await window.indexedDB.databases()
  dbs = dbs.filter((db) => db.name.includes('_pouch_'))

  await Promise.all(
    dbs.map(
      (db) =>
        new Promise((resolve, reject) => {
          const request = indexedDB.deleteDatabase(db.name)
          request.onsuccess = resolve
          request.onerror = reject
        })
    )
  )
}
