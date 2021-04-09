export const getAccountFromLocation = (pathname?: string): string | boolean => {
  if (process.env.STORYBOOK) {
    return 'STORYBOOK'
  }
  const _pathname = pathname ?? window.location.pathname
  const _accountId = _pathname.split('/')[1]
  if (_accountId?.length !== 16) {
    return false
  }
  // validate _accountId
  if (!_accountId.startsWith('g_') && !_accountId.startsWith('p_')) {
    return false
  }

  return _accountId
}
