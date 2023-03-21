import { useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

export const NotFoundRedirect = () => {
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )

  // if no page found, navigate to default page
  useEffect(() => {
    navigateToDefaultPage()
  }, [])

  return null
}
