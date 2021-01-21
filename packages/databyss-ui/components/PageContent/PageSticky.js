/* eslint-disable react/no-danger */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { debounce } from 'lodash'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text, Icon } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import OnlineSvg from '@databyss-org/ui/assets/online.svg'
import OfflineSvg from '@databyss-org/ui/assets/offline.svg'
import LoadingSvg from '@databyss-org/ui/assets/loading.svg'
import PageMenu from './PageMenu'
import AccountMenu from './AccountMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const { isOnline } = useNotifyContext()
  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)

  const _isDbBusy = isDbBusy()
  // get page name from headerCache
  const getPages = usePageContext((c) => c && c.getPages)

  const [showSaving, setShowSaving] = useState(false)

  const stickyRef = useRef()
  const currentPath = []

  // debonce the ui component showing the saving icon
  const debounceSavingIcon = useCallback(
    debounce(
      (count) => {
        setShowSaving(count)
      },
      2500,
      { leading: true }
    ),
    []
  )

  useEffect(() => {
    debounceSavingIcon(_isDbBusy)
  }, [_isDbBusy])

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
      py="medium"
      px="small"
      ref={stickyRef}
      backgroundColor="gray.7"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>{currentPath[0]}</title>
      </Helmet>
      <Text color="gray.4" variant="uiTextSmall">
        <div
          data-test-element="editor-sticky-header"
          dangerouslySetInnerHTML={{ __html: currentPath.join(' / ') }}
        />
      </Text>
      <View alignItems="center" justifyContent="flex-end" flexDirection="row">
        {showSaving ? null : (
          <View id="changes-saved">
            {' '}
            &nbsp;
            {/* this is used in tests to confirm the page has been saved */}
          </View>
        )}
        {isOnline && showSaving ? (
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
        <AccountMenu />
        <View ml="em">
          <PagesLoader>{(pages) => <PageMenu pages={pages} />}</PagesLoader>
        </View>
      </View>
    </View>
  )
}

export default PageSticky
