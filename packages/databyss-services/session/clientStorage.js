import {
  upsert,
  getUserSession,
  getGroupSession,
  findOne,
} from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { resetPouchDb } from '@databyss-org/data/pouchdb/db'
import { getAccountFromLocation } from './utils'

// TODO: Add native versions of these

export function setAuthToken(token) {
  localStorage.setItem('token', token)
}

export function setUserId(userId) {
  localStorage.setItem('userId', userId)
}

export function getUserId() {
  let _id
  try {
    _id = localStorage.getItem('userId')
  } catch (err) {
    console.error('no id found')
  }
  return _id
}

export function getAuthToken() {
  let _token
  try {
    _token = localStorage.getItem('token')
  } catch (err) {
    console.error('no token found')
  }
  return _token
}

export function getDefaultGroup() {
  let groupId
  try {
    groupId = localStorage.getItem('default_group')
  } catch (err) {
    console.error('no default account found')
    return false
  }
  return groupId
}

export async function getAccountId() {
  const defaultGroup = getDefaultGroup()
  return defaultGroup
}

export async function setDefaultPageId(value) {
  const _accountFromLocation = getAccountFromLocation()

  // replace default page id on correct group for user
  const _result = await findOne({
    doctype: DocumentType.UserPreferences,
    query: { _id: 'user_preference' },
  })

  if (_accountFromLocation && _result) {
    const _groups = _result.groups
    // find index in group array
    const _index = _groups.findIndex((g) => g.groupId === _accountFromLocation)
    _groups[_index].defaultPageId = value

    // update the group property with proper default page id
    await upsert({
      doctype: DocumentType.UserPreferences,
      _id: 'user_preference',
      doc: { groups: _groups },
    })
  }
}

export function clearLocalStorage() {
  localStorage.clear()
}

export async function deletePouchDbs(matchName) {
  if (!process.env.FORCE_MOBILE) {
    let dbs = await window.indexedDB.databases()
    dbs = dbs.filter((db) => db.name.includes(matchName))

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
  }
}

export function setDefaultGroup(groupId) {
  localStorage.setItem('default_group', groupId)
}

export function setPouchSecret(credentials) {
  let keyMap = localStorage.getItem('pouch_secrets')
  if (!keyMap) {
    keyMap = {}
  } else {
    keyMap = JSON.parse(keyMap)
  }

  // if no default account in storage, set default account
  if (!getDefaultGroup()) {
    setDefaultGroup(credentials[0].groupId)
  }

  credentials.forEach((g) => {
    keyMap[g.groupId] = {
      dbPassword: g.dbPassword,
      dbKey: g.dbKey,
      // defaultAccount,
    }
  })
  localStorage.setItem('pouch_secrets', JSON.stringify(keyMap))
}

export function deletePouchSecret(groupId) {
  let keyMap = localStorage.getItem('pouch_secrets')
  if (!keyMap) {
    return
  }
  keyMap = JSON.parse(keyMap)

  delete keyMap[groupId]
  localStorage.setItem('pouch_secrets', JSON.stringify(keyMap))
}

export function getDbCredentialsFromLocal(groupId) {
  let keyMap = localStorage.getItem('pouch_secrets')

  if (!keyMap) {
    console.error('no credentials found')
  } else {
    keyMap = JSON.parse(keyMap)
  }

  // console.log('[getDbCredentialsFromLocal]', keyMap, groupId)
  return keyMap[groupId]
}

export function getPouchSecret() {
  return JSON.parse(localStorage.getItem('pouch_secrets'))
}

export function localStorageHasPublicSession(maxRetries = 0) {
  return getGroupSession(maxRetries)
}

export async function localStorageHasSession() {
  try {
    // compose the user session
    let session

    const token = getAuthToken()

    const defaultGroup = getDefaultGroup()
    if (!defaultGroup) {
      return false
    }

    // get user preferences
    const _userSession = await getUserSession()

    // if we're on a URL with a groupid on it, make sure it matches default group
    const groupIdFromUrl = getAccountFromLocation()

    if (
      !process.env.STORYBOOK &&
      groupIdFromUrl &&
      groupIdFromUrl !== defaultGroup
    ) {
      // TODO: first check it against the user Session default group

      return false
    }

    if (token && _userSession) {
      session = {
        token,
        userId: _userSession.userId,
        email: _userSession.email,
        defaultPageId: _userSession.groups[0].defaultPageId,
        defaultGroupId: _userSession.belongsToGroup,
      }
    }

    return session
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Removes pouch db and secrets for default group
 */
export async function cleanupDefaultGroup() {
  const groupId = getDefaultGroup()
  if (!groupId) {
    return
  }
  await deletePouchDbs(groupId)
  clearLocalStorage()
  await deletePouchSecret(groupId)
}

/**
 * Cleans up the session/local storage for the groupId in the URL
 * - if the groupId in the url is the local defaultGroup, effectively log the user out
 *   but, unlike logout, leave the local PouchDb intact so it can be synched once re-authenticated
 * - if the groupId is not the defaultGroup, wipe the local db for the groupId (assume public)
 */
export async function cleanupGroupFromUrl() {
  const groupId = getAccountFromLocation()
  if (!groupId) {
    return
  }
  const defaultGroupId = getDefaultGroup()
  if (defaultGroupId === groupId) {
    localStorage.removeItem('default_group')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    await deletePouchSecret(groupId)
  } else {
    await deletePouchDbs(groupId)
  }
}
