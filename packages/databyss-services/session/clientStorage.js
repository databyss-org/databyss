import _ from 'lodash'
import { upsert, getUserSession } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { db } from '@databyss-org/data/pouchdb/db'

// TODO: Add native versions of these

export const deleteUserPreferences = async () => {
  const _res = await getUserSession()
  if (_res) {
    db.remove(_res)
  }
}

export const getAuthToken = async () => {
  const _res = await getUserSession()
  return _res?.token
}

export const getAccountId = async () => {
  const _res = await getUserSession()
  return _res?.defaultGroupId
}

export const setDefaultPageId = async (value) => {
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: { defaultPageId: value },
  })
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

export const setUserSession = async (session) => {
  console.log(session)
  await upsert({
    $type: DocumentType.UserPreferences,
    _id: '_local/user_preferences',
    doc: session,
  })
}
