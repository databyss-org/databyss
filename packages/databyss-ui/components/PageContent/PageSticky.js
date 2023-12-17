/* eslint-disable react/no-danger */
import React from 'react'
import { StickyHeader } from '@databyss-org/ui/components'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import PageMenu from './PageMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const pagesRes = usePages()
  const pageRes = useDocument(pageId)

  const currentPath = []

  const pages = pagesRes.data

  // get page title
  if (pageRes.data?.name) {
    currentPath.push(pageRes.data?.name)
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
