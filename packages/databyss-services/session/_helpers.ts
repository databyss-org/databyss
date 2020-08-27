export const getAccountFromLocation = (): string => {
  const accountId = window.location.pathname.split('/')[1]
  return accountId
}
