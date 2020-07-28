/* eslint-disable react/no-danger */
import React, { useEffect, useRef, useState } from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { getPagePath } from './_helpers'
import { ArchiveBin } from './ArchiveBin'

const PageSticky = ({ page }) => {
  const { isOnline } = useNotifyContext()
  const hasPendingPatches = usePageContext(c => c.hasPendingPatches)
  // get page name from headerCache
  const getPages = usePageContext(c => c && c.getPages)

  const [pendingPatches, setPendingPatches] = useState(0)

  const stickyRef = useRef()
  let pageName = ''

  useEffect(
    () => {
      setPendingPatches(hasPendingPatches)
    },
    [hasPendingPatches]
  )

  const pages = getPages()
  if (page) {
    pageName = pages[page.pageHeader._id].name
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
      zIndex={2}
    >
      <Text color="gray.4" pl="medium" variant="uiTextSmall">
        <div
          dangerouslySetInnerHTML={{ __html: getPagePath(page, pageName) }}
        />
      </Text>
      <View
        width={200}
        alignItems="center"
        justifyContent="flex-end"
        flexDirection="row"
      >
        <Text color="gray.5" pr="medium" variant="uiTextSmall">
          {isOnline && (pendingPatches ? 'Saving...' : 'All changes saved')}
          {!isOnline && 'Offline'}
        </Text>
        <PagesLoader>{pages => <ArchiveBin pages={pages} />}</PagesLoader>
      </View>
    </View>
  )
}

export default PageSticky
