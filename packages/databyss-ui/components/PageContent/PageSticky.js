/* eslint-disable react/no-danger */
import React, { useEffect, useRef, useState } from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text, Icon } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import OnlineSvg from '@databyss-org/ui/assets/online.svg'
import OfflineSvg from '@databyss-org/ui/assets/offline.svg'
import LoadingSvg from '@databyss-org/ui/assets/loading.svg'
import { ArchiveBin } from './ArchiveBin'

const PageSticky = ({ pagePath, pageId }) => {
  const { isOnline } = useNotifyContext()
  const hasPendingPatches = usePageContext(c => c.hasPendingPatches)
  // get page name from headerCache
  const getPages = usePageContext(c => c && c.getPages)

  const [pendingPatches, setPendingPatches] = useState(0)

  const stickyRef = useRef()
  const currentPath = []

  useEffect(
    () => {
      setPendingPatches(hasPendingPatches)
    },
    [hasPendingPatches]
  )

  const pages = getPages()
  // get page title
  if (pages && pages[pageId]?.name) {
    currentPath.push(pages[pageId].name)
  }

  // get page path
  if (pagePath) {
    currentPath.push(...pagePath.path)
  }

  return (
    <View
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      p="medium"
      pl="none"
      ml="extraSmall"
      ref={stickyRef}
      backgroundColor="gray.7"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Text color="gray.4" pl="medium" variant="uiTextSmall">
        <div
          data-test-element="editor-sticky-header"
          dangerouslySetInnerHTML={{ __html: currentPath.join(' / ') }}
        />
      </Text>
      <View alignItems="center" justifyContent="flex-end" flexDirection="row">
        {isOnline && pendingPatches ? (
          <Icon sizeVariant="tiny" color="gray.5" title="Saving...">
            <LoadingSvg />
          </Icon>
        ) : null}
        <Icon
          sizeVariant="small"
          color="gray.5"
          title={isOnline ? 'Online' : 'Offline'}
          ml="small"
        >
          {isOnline ? <OnlineSvg /> : <OfflineSvg />}
        </Icon>
        <View ml="em">
          <PagesLoader>{pages => <ArchiveBin pages={pages} />}</PagesLoader>
        </View>
      </View>
    </View>
  )
}

export default PageSticky
