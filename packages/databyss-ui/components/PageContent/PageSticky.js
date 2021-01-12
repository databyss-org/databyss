/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { StickyHeader } from '@databyss-org/ui/components'
import { View, Icon } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import LoadingSvg from '@databyss-org/ui/assets/loading.svg'
import PageMenu from './PageMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const hasPendingPatches = usePageContext((c) => c.hasPendingPatches)
  const { isOnline } = useNotifyContext()
  // get page name from headerCache
  const getPages = usePageContext((c) => c && c.getPages)

  const [pendingPatches, setPendingPatches] = useState(0)
  const [showSaving, setShowSaving] = useState(false)
  const currentPath = []

  // debonce the ui component showing the saving icon
  const debounceSavingIcon = useCallback(
    debounce(
      (count) => {
        setShowSaving(count)
      },
      1000,
      { maxWait: 1000 }
    ),
    []
  )

  useEffect(() => {
    // set the true state of pending patches
    setPendingPatches(hasPendingPatches)
    debounceSavingIcon(hasPendingPatches)
  }, [hasPendingPatches])

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
    <StickyHeader
      path={currentPath}
      contextMenu={
        <PagesLoader includeArchived>
          {(pages) => <PageMenu pages={pages} />}
        </PagesLoader>
      }
    >
      <View alignItems="center" justifyContent="flex-end" flexDirection="row">
        {pendingPatches ? null : (
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
      </View>
    </StickyHeader>
  )
}

export default PageSticky
