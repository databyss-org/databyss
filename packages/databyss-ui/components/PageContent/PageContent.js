import React, { useEffect } from 'react'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'

import PageHeader from './PageHeader'
import PageBody from './PageBody'

const PageContainer = ({ anchor, id, page }) => {
  const { getBlockRef } = usePageContext()

  useEffect(() => {
    // if anchor link exists, scroll to anchor
    if (anchor) {
      const _ref = getBlockRef(anchor)
      if (_ref) {
        window.requestAnimationFrame(() => {
          _ref.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        })
      }
    }
  }, [])

  return (
    <View height="100vh" overflow="scroll" p="medium" id="here">
      <PageHeader pageId={id} />
      <PageBody page={page} />
    </View>
  )
}

const PageContent = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { path, navigate, getTokensFromPath } = useNavigationContext()

  const { id, anchor } = getTokensFromPath()

  const _pathList = path.split('/')
  if (_pathList[1].length === 0) {
    navigate(`/pages/${account.defaultPage}`)
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View flex="1" maxHeight="100vh">
      {id && (
        <PageLoader pageId={id}>
          {page => <PageContainer anchor={anchor} id={id} page={page} />}
        </PageLoader>
      )}
    </View>
  )
}

export default PageContent
