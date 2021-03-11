import Account from '@databyss-org/api/src/models/Account'
import Page from '@databyss-org/api/src/models/Page'

/**
 * Gets the URL path component of all the public pages in the db
 */
export async function getPublicPagePaths() {
  const _publicAccounts = await Account.find({
    isPublic: true,
  })

  const _pagePaths: string[] = []

  for (const _account of _publicAccounts) {
    const _pages = await Page.find({
      'sharedWith.account': _account.id,
    })

    if (!_pages.length) {
      console.log(`⚠️  no pages found for account ${_account.id}`)
      continue
    }

    if (_pages.length > 1) {
      console.log(`⚠️  more than one page found for account ${_account.id}`)
      continue
    }

    _pagePaths.push(`${_account.id}/pages/${_pages[0].id}`)
  }

  return _pagePaths
}
