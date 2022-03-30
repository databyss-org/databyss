import { useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { useNavigationContext } from './NavigationProvider'

export const NotFoundRedirect = () => {
  const navigate = useNavigationContext((c) => c && c.navigate)
  const getSession = useSessionContext((c) => c && c.getSession)

  const { defaultGroupId, defaultGroupName, defaultPageId } = getSession()

  // if no page found, navigate to default page
  useEffect(() => {
    let _groupName = ''
    if (defaultGroupName) {
      _groupName = `${urlSafeName(defaultGroupName)}-`
    }
    navigate(
      `/${_groupName}${defaultGroupId.substring(2)}/pages/${defaultPageId}`,
      {
        hasAccount: true,
      }
    )
  }, [])

  return null
}
