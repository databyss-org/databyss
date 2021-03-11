/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { StickyHeader } from '@databyss-org/ui/components'
import { View, Icon } from '@databyss-org/ui/primitives'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingSvg from '@databyss-org/ui/assets/loading.svg'
import PageMenu from './PageMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const { isOnline } = useNotifyContext()

  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)

  const _isDbBusy = isDbBusy()
  const pagesRes = usePages()

  const [showSaving, setShowSaving] = useState(false)
  const currentPath = []

  // debonce the ui component showing the saving icon
  const debounceSavingIcon = useCallback(
    debounce(
      (count) => {
        setShowSaving(count)
      },
      2500,
      {
        leading: true,
      }
    ),
    []
  )

  useEffect(() => {
    // check if database is busy or if we have pending patches
    debounceSavingIcon(!!_isDbBusy)
  }, [_isDbBusy])

  if (!pagesRes.isSuccess) {
    return null
  }

  const pages = pagesRes.data

  // get page title
  if (pages[pageId]?.name) {
    currentPath.push(pages[pageId].name)
  }

  // get page path
  if (pagePath) {
    currentPath.push(...pagePath.path)
  }

  return (
    <StickyHeader path={currentPath} contextMenu={<PageMenu pages={pages} />}>
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
      </View>
    </StickyHeader>
  )
}

export default PageSticky
