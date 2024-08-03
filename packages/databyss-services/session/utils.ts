import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Group } from '../interfaces'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export interface RemoteDbInfo {
  searchMd5: string
  publishedAt: string
}

export interface RemoteDbData {
  info: RemoteDbInfo
  dbRows: any[]
  searchDbRows: any[]
}

export const remoteDbHasUpdate = async () => {
  const _groupId = dbRef.groupId!
  const _gid = _groupId.replace('g_', '')

  // get remote info
  const _urlBase = `${process.env.DBFILE_URL}${_groupId}/databyss-db-${_gid}`
  const _res = await fetch(`${_urlBase}-info.json`)
  const _remoteDbInfo: RemoteDbInfo = await _res.json()

  // get local group
  const _group: Group = await dbRef.current?.get(_groupId)

  // compare dates
  return new Date(_remoteDbInfo.publishedAt) > new Date(_group.lastPublishedAt!)
}

export const getRemoteDbData = async (groupId: string) => {
  const _gid = groupId.replace('g_', '')
  const _urlBase = `${process.env.DBFILE_URL}${groupId}/databyss-db-${_gid}`
  // console.log('[getRemoteDbFile] url base', _urlBase)
  let _res = await fetch(`${_urlBase}.json`)
  const dbRows: any[] = await _res.json()
  _res = await fetch(`${_urlBase}-info.json`)
  const info: RemoteDbInfo = await _res.json()
  _res = await fetch(`${_urlBase}-search.json`)
  const searchDbRows: any[] = await _res.json()

  return {
    info,
    dbRows,
    searchDbRows,
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
