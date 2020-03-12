import React, { useState, useEffect } from 'react'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageHeader from './PageHeader'
import PageBody from './PageBody'

const PageContent = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { path, navigate } = useNavigationContext()
  const [pageId, setPageId] = useState()
  const [readOnly, setReadOnly] = useState(false)
  const [counter, setCounter] = useState(0)

  /* temporary, handles page id routing */
  useEffect(
    () => {
      const _pathList = path.split('/')
      if (_pathList[1].length === 0) {
        setPageId(account.defaultPage)
        navigate(`/pages/${account.defaultPage}`)
      }
      if (_pathList[1] === 'pages') {
        if (_pathList[2] !== pageId) {
          setCounter(counter + 1)
          setPageId(_pathList[2])
        }
      }
    },
    [path]
  )

  // TODO:
  // TEXT CONTROL SHOULD ACCEPT TEXT VARIANT

  const onHeaderClick = bool => {
    if (readOnly !== bool) {
      setReadOnly(bool)
    }
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View p="medium" flex="1">
      {pageId && (
        <PageLoader pageId={pageId}>
          {page => (
            <View key={counter}>
              <PageHeader pageId={pageId} isFocused={onHeaderClick} />
              <PageBody page={page} readOnly={readOnly} />
            </View>
          )}
        </PageLoader>
      )}
    </View>
  )
}

export default PageContent
