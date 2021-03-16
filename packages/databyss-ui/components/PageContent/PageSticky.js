/* eslint-disable react/no-danger */
import React from 'react'
import { StickyHeader } from '@databyss-org/ui/components'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import PageMenu from './PageMenu'

const PageSticky = ({ pagePath, pageId }) => {
  const pagesRes = usePages()

  const currentPath = []

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
    <StickyHeader path={currentPath} contextMenu={<PageMenu pages={pages} />} />
  )
}

export default PageSticky
