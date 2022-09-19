import { useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useNavigationContext } from './NavigationProvider'

export const NotFoundRedirect = () => {
  const navigate = useNavigationContext((c) => c && c.navigate)
  const getSession = useSessionContext((c) => c && c.getSession)
  const pagesRes = usePages()

  const { defaultGroupId, defaultGroupName, defaultPageId } = getSession()

  // if no page found, navigate to default page
  useEffect(() => {
    let _groupName = ''
    if (defaultGroupName) {
      _groupName = `${urlSafeName(defaultGroupName)}-`
    }
    let _pageUrl = defaultPageId
    if (pagesRes.data?.[defaultPageId]) {
      _pageUrl = `${defaultPageId}/${urlSafeName(
        pagesRes.data[defaultPageId].name
      )}`
    }

    navigate(`/${_groupName}${defaultGroupId.substring(2)}/pages/${_pageUrl}`, {
      hasAccount: true,
      replace: true,
    })
  }, [])

  return null
}
