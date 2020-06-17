import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Router } from '@reach/router'
import { PagesLoader, PageLoader } from '@databyss-org/ui/components/Loaders'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { ArchiveBin } from './ArchiveBin'

import PageHeader from './PageHeader'
import PageBody from './PageBody'

export const PageRouter = () => (
  <Router>
    <PageContent path=":id" />
  </Router>
)

const PageContainer = ({ anchor, id, onHeaderClick, page, readOnly }) => {
  const { getBlockRefByIndex, hasPendingPatches } = usePageContext()
  const { isOnline } = useNotifyContext()

  const [pendingPatches, setPendingPatches] = useState(hasPendingPatches)

  useEffect(
    () => {
      setPendingPatches(hasPendingPatches)
    },
    [hasPendingPatches]
  )

  useEffect(() => {
    // if anchor link exists, scroll to anchor
    if (anchor) {
      // get index value of anchor on page
      const _index = page.blocks.findIndex(b => b._id === anchor)
      const _ref = getBlockRefByIndex(_index)
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
    <View height="100vh" overflow="scroll" p="medium">
      <View
        mr="medium"
        alignItems="center"
        flexDirection="row"
        justifyContent="space-between"
        // flexGrow="1"
      >
        <PageHeader pageId={id} isFocused={onHeaderClick} />
        <Text color={isOnline ? 'gray.4' : 'red.0'} pr="medium">
          {isOnline && (pendingPatches ? 'Saving...' : 'All changes saved')}
          {!isOnline && 'Offline'}
        </Text>
        <PagesLoader>{pages => <ArchiveBin pages={pages} />}</PagesLoader>
      </View>
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
        <PageLoader pageId={id} key={id}>
          {pageState => {
            const { page, ...pageContainerFields } = pageState

            return (
              <PageContainer
                anchor={anchor}
                id={id}
                onHeaderClick={onHeaderClick}
                page={{
                  _id: page._id,
                  ...pageContainerFields,
                }}
                readOnly={readOnly}
              />
            )
          }}
        </PageLoader>
      )}
    </View>
  )
}

export default PageContent
