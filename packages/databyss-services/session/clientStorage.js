import {
  upsert,
  getUserSession,
  findOne,
} from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { resetPouchDb } from '@databyss-org/data/pouchdb/db'
import { getAccountFromLocation } from './_helpers'

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

export const getDefaultGroup = () => {
  let groupId
  try {
    groupId = localStorage.getItem('default_group')
  } catch (err) {
    console.error('no default account found')
  }
  return groupId
}

// export const getAuthToken = async () => {
//   const _res = await getUserSession()
//   return _res?.token
// }

export const getAccountId = async () => {
  const defaultGroup = getDefaultGroup()
  return defaultGroup
}

export const setDefaultPageId = async (value) => {
  const _accountFromLocation = getAccountFromLocation()

  // replace default page id on correct group for user
  const _result = await findOne({
    $type: DocumentType.UserPreferences,
    query: { _id: 'user_preference' },
  })

  if (_accountFromLocation && _result) {
    const _groups = _result.groups
    // find index in group array
    const _index = _groups.findIndex((g) => g.groupId === _accountFromLocation)
    _groups[_index].defaultPageId = value

    // update the group property with proper default page id
    await upsert({
      $type: DocumentType.UserPreferences,
      _id: 'user_preference',
      doc: { groups: _groups },
    })
  }
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

export const setDefaultGroup = (groupId) => {
  localStorage.setItem('default_group', groupId)
}

export const setPouchSecret = (credentials) => {
  let keyMap = localStorage.getItem('pouch_secrets')
  if (!keyMap) {
    keyMap = {}
  } else {
    keyMap = JSON.parse(keyMap)
  }

  credentials.forEach((g) => {
    // let defaultAccount = false
    // if no default account in dictionary, set default account
    if (!Object.keys(keyMap).length) {
      setDefaultGroup(g.groupId)
    }

    keyMap[g.groupId] = {
      dbPassword: g.dbPassword,
      dbKey: g.dbKey,
      // defaultAccount,
    }
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

  const defaultGroup = getDefaultGroup()
  if (!defaultGroup) {
    return false
  }

  // get user preferences
  const _userSession = await getUserSession()

  // if we're on a URL with a groupid on it, make sure it matches default group
  const groupIdFromUrl = getAccountFromLocation()

  console.log('account from group url', groupIdFromUrl)
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
}
