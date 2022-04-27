import { REMOTE_CLOUDANT_URL } from '@databyss-org/data/pouchdb/db'
import { getAccountFromLocation } from './utils'
import request from '../lib/request'
import { getPouchSecret } from './clientStorage'
import { NotAuthorizedError } from '../interfaces'
import {
  createDatabaseCredentials,
  validateGroupCredentials,
} from '../editorPage'

export function hasUnathenticatedAccess(maxRetries: number = 5) {
  return new Promise((resolve, reject) => {
    // if there's no group (account) in the URL, bail and resolve false
    if (!getAccountFromLocation()) {
      resolve(false)
      return
    }
    const _checkAccess = async (count = 0) => {
      // console.log('[hasUnauthenticatedAccess] checkAccess attempt', count + 1)
      if (process.env.STORYBOOK || count >= maxRetries) {
        resolve(false)
        return
      }
      try {
        const _groupId = (await isGroupPublic()) || (await isPagePublic())
        if (_groupId) {
          resolve(_groupId)
          return
        }
        setTimeout(() => _checkAccess(count + 1), 3000)
      } catch (err) {
        reject(err)
      }
    }
    _checkAccess()
  })
}

export async function hasAuthenticatedAccess() {
  const _groupId = getAccountFromLocation()
  if (!_groupId) {
    return false
  }
  const _dbCache = getPouchSecret()
  const _creds = _dbCache?.[_groupId as string]

  // if creds are not already stored in the browser, check API to see if we
  // have access to the group in the URL
  if (!_creds) {
    try {
      await createDatabaseCredentials({
        groupId: _groupId as string,
        isPublic: false,
      })
    } catch (_err) {
      if (_err instanceof NotAuthorizedError) {
        return false
      }
      throw _err
    }
  }
  // if we already have creds, verify them with the server to make sure they
  // are still valid
  else {
    try {
      await validateGroupCredentials({
        groupId: _groupId as string,
        dbKey: _creds.dbKey,
      })
    } catch (_err) {
      if (_err instanceof NotAuthorizedError) {
        return false
      }
      throw _err
    }
  }
  return true
}

/*
checks url for public page
*/
export async function isPagePublic() {
  const path = window.location.pathname.split('/')
  // get the page id
  const pageId = path?.[3]
  if (pageId) {
    const groupId = `p_${pageId}`
    try {
      await request(`${REMOTE_CLOUDANT_URL}/${groupId}`)
      return groupId
    } catch (err) {
      return false
    }
  }
  return false
}

export async function isGroupPublic() {
  // get the page id
  const groupId = getAccountFromLocation()
  if (groupId) {
    try {
      await request(`${REMOTE_CLOUDANT_URL}/${groupId}`)
      return groupId
    } catch (err) {
      return false
    }
  }
  return false
}
