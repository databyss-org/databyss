import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from '@reach/router'

import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View, Text } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'

import PageHeader from './PageHeader'
import PageBody from './PageBody'

export const Page = ({ children }) => {
  return <View>{children}</View>
}

const PageContainer = ({ anchor, id, onHeaderClick, page, readOnly }) => {
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
      <PageHeader pageId={id} isFocused={onHeaderClick} />
      <PageBody page={page} readOnly={readOnly} />
    </View>
  )
}

const PageContent = () => {
  // get page id and anchor from url
  const { id } = useParams()
  const anchor = useLocation().hash.substring(1)
  const [readOnly, setReadOnly] = useState(false)

  const onHeaderClick = bool => {
    if (readOnly !== bool) {
      setReadOnly(bool)
    }
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View flex="1" height="100vh">
      {id && (
        <PageLoader pageId={id}>
          {page => (
            <PageContainer
              anchor={anchor}
              id={id}
              onHeaderClick={onHeaderClick}
              page={page}
              readOnly={readOnly}
            />
          )}
        </PageLoader>
      )}
    </View>
  )
}

export default PageContent
