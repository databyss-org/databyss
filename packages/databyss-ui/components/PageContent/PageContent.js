import React, { useState } from 'react'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View, ScrollView } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageHeader from './PageHeader'
import PageBody from './PageBody'

const PageContent = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { path, navigate } = useNavigationContext()
  const [readOnly, setReadOnly] = useState(false)

  const _pathList = path.split('/')
  if (_pathList[1].length === 0) {
    navigate(`/pages/${account.defaultPage}`)
  }
  const pageId = _pathList[2]

  const onHeaderClick = bool => {
    if (readOnly !== bool) {
      setReadOnly(bool)
    }
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      {pageId && (
        <PageLoader pageId={pageId}>
          {page => (
            <View>
              <PageHeader pageId={pageId} isFocused={onHeaderClick} />
              <PageBody page={page} readOnly={readOnly} />
            </View>
          )}
        </PageLoader>
      )}
    </ScrollView>
  )
}

export default PageContent
