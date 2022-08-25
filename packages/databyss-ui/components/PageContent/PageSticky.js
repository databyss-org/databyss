/* eslint-disable react/no-danger */
import React from 'react'
import { StickyHeader } from '@databyss-org/ui/components'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import PageMenu from './PageMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const pagesRes = usePages()

  const currentPath = []

  const pages = pagesRes.data

  // get page title
  if (pages?.[pageId]?.name) {
    currentPath.push(pages[pageId].name)
  }

  // get page path
  if (pagePath) {
    currentPath.push(...pagePath.path)
  }

  return React.useMemo(() => {
    // console.log('[PageSticky]', pagePath)
    if (!pagesRes.isSuccess) {
      return null
    }

    return (
      <StickyHeader
        path={currentPath}
        contextMenu={<PageMenu pages={pages} />}
      />
    )
  }, [currentPath.join('/'), pageId])
}

export default PageSticky
