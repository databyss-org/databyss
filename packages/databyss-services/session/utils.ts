import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Group } from '../interfaces'
import { getDocument } from '@databyss-org/data/pouchdb/crudUtils'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export interface RemoteDbInfo {
  searchMd5: string
  publishedAt: string
}

export interface RemoteDbData {
  info: RemoteDbInfo
  dbRows: any[]
}

export const remoteDbHasUpdate = async () => {
  const _groupId = dbRef.groupId!
  const _gid = _groupId.replace('g_', '')

  // get local group
  const _group: Group | null = await getDocument(_groupId)

  // if local group doesn't exist, assume we need an update
  if (!_group) {
    console.log('[remoteDbHasUpdate] no local group')
    return true
  }

  // get remote info
  const _urlBase = `${process.env.DBFILE_URL}${_groupId}/databyss-db-${_gid}`
  const _res = await fetch(`${_urlBase}-info.json`)
  const _remoteDbInfo: RemoteDbInfo = await _res.json()

  // compare dates
  const _hasUpdate =
    new Date(_remoteDbInfo.publishedAt) > new Date(_group.lastPublishedAt!)
  console.log(
    '[remoteDbHasUpdate]',
    _hasUpdate,
    _remoteDbInfo.publishedAt,
    _group.lastPublishedAt
  )
  return _hasUpdate
}

const getRemoteUrlBase = (groupId: string) => {
  const _gid = groupId.replace('g_', '')
  return `${process.env.DBFILE_URL}${groupId}/databyss-db-${_gid}`
}

export const getRemoteSearchData = async (groupId: string) => {
  const _urlBase = getRemoteUrlBase(groupId)
  const _res = await fetch(`${_urlBase}-search.json`)
  return _res.json()
}

export const getRemoteDbData = async (groupId: string) => {
  const _urlBase = getRemoteUrlBase(groupId)
  // console.log('[getRemoteDbFile] url base', _urlBase)
  let _res = await fetch(`${_urlBase}.json`)
  const dbRows: any[] = await _res.json()
  _res = await fetch(`${_urlBase}-info.json`)
  const info: RemoteDbInfo = await _res.json()

  return {
    info,
    dbRows,
  } as RemoteDbData
}

export const getAccountFromLocation = (
  withName: boolean = false
): string | boolean => {
  if (eapi.isDesktop) {
    return dbRef.groupId ?? false
  }
  if (process.env.STORYBOOK) {
    return 'STORYBOOK'
  }
  const _pathname = window.location.pathname
  let _accountId = _pathname.split('/')[1]
  if (!_accountId) {
    return false
  }
  const _isPageGroup = _accountId.startsWith('p_')
  const _accountIdParts = _accountId.split('-')
  let _accountName = ''
  if (_accountIdParts.length > 1) {
    _accountId = _accountIdParts[_accountIdParts.length - 1]
    _accountName = _accountIdParts
      .slice(0, _accountIdParts.length - 1)
      .join('-')
    _accountName += '-'
  }
  if (_accountId.replace(/^(p_|g_)/, '').length !== 14) {
    return false
  }

  if (withName) {
    return `${_accountName}${_accountId}`
  }
  // normalize legacy urls
  if (_accountId.startsWith('g_') || _accountId.startsWith('p_')) {
    _accountId = _accountId.substring(2)
  }
  return `${_isPageGroup ? 'p_' : 'g_'}${_accountId}`
}
