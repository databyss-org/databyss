/* eslint-disable react/no-danger */
import React from 'react'
import { StickyHeader } from '@databyss-org/ui/components'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import PageMenu from './PageMenu'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'

const PageSticky = ({ pagePath, pageId }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const groupRes = useDocument(dbRef.groupId, {
    enabled: isPublicAccount(),
  })
  const pagesRes = usePages()
  const pageRes = useDocument(pageId)

  const currentPath = []

  const pages = pagesRes.data
  const page = pageRes.data

  // get page title
  if (page?.name) {
    currentPath.push(pageRes.data?.name)
  }

  // get page path
  if (pagePath) {
    currentPath.push(...pagePath.path)
  }

  // add group name if public
  if (isPublicAccount() && groupRes.data) {
    currentPath.unshift(groupRes.data.name)
  }

  return React.useMemo(() => {
    // console.log('[PageSticky]', pagePath)
    if (!pagesRes.isSuccess || !pageRes.isSuccess) {
      return null
    }

    return (
      <StickyHeader
        path={currentPath}
        contextMenu={<PageMenu pages={pages} />}
        draggable={
          !isPublicAccount() &&
          !page.archive && {
            payload: page,
            type: 'PAGE',
          }
        }
      />
    )
  }, [currentPath.join('/'), pageId])
}

export default PageSticky
