import { dbRef } from '@databyss-org/data/pouchdb/dbRef'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export const getAccountFromLocation = (
  withName: boolean = false
): string | boolean => {
  if (eapi) {
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
