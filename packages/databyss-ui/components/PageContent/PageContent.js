import React, { useState, useEffect } from 'react'
import * as Scroll from 'react-scroll'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageHeader from './PageHeader'
import PageBody from './PageBody'

const scroller = Scroll.scroller
const Element = Scroll.Element

const PageContainer = ({ anchor, id, onHeaderClick, page, readOnly }) => {
  useEffect(() => {
    // if anchor link exists, scroll to anchor
    if (anchor) {
      scroller.scrollTo(anchor, {
        duration: 1500,
        smooth: true,
        containerId: 'pageContainer',
      })
    }
  }, [])

  return (
    <Element
      id="pageContainer"
      className="element"
      style={{
        height: '100vh',
        overflowY: 'scroll',
      }}
    >
      <PageHeader pageId={id} isFocused={onHeaderClick} />
      <PageBody page={page} readOnly={readOnly} />
    </Element>
  )
}

const PageContent = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { path, navigate, getTokensFromPath } = useNavigationContext()
  const [readOnly, setReadOnly] = useState(false)

  const { id, anchor } = getTokensFromPath()

  const _pathList = path.split('/')
  if (_pathList[1].length === 0) {
    navigate(`/pages/${account.defaultPage}`)
  }

  const onHeaderClick = bool => {
    if (readOnly !== bool) {
      setReadOnly(bool)
    }
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View m="medium" p="small" flex="1" maxHeight="100vh">
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
