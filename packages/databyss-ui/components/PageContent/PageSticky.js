import React, { useEffect, useRef, useState } from 'react'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { PagesLoader, PageLoader } from '@databyss-org/ui/components/Loaders'
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

  const [stickyCss, setStickyCss] = useState({})
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

  // useEventListener('wheel', () => {
  //   onScrollOrDocumentChange()
  // })

  // const onScrollOrDocumentChange = () => {
  //   if (stickyRef.current) {
  //     const _el = stickyRef.current
  //     // console.log(_el.offsetTop)
  //     const _topOffset = _el.getBoundingClientRect().top
  //     if (_topOffset < 0) {
  //       setStickyCss({
  //         position: 'fixed',
  //         top: 0,
  //         width: '-webkit-fill-available',
  //         zIndex: 2,
  //       })
  //     } else {
  //       setStickyCss({})
  //     }
  //   }
  // }

  return (
    <View
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      pb="small"
      pr="medium"
      pt="medium"
      pl="medium"
      ml="extraSmall"
      ref={stickyRef}
      backgroundColor="gray.7"
      position="sticky"
      top={0}
      zIndex={2}
    >
      <Text color="gray.4" pl="medium">
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
