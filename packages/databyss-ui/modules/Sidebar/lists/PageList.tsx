import React, { useMemo } from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePages, useGroups } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { Page } from '@databyss-org/services/interfaces'
import {
  pagesToListItemData,
  SidebarTransformFunction,
} from '@databyss-org/ui/modules/Sidebar/transforms'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

interface PageListProps {
  archive?: boolean
  transform?: SidebarTransformFunction<Page>
}

export const PageList = ({ archive, transform, ...others }: PageListProps) => {
  const pagesRes = usePages()
  const groupsRes = useGroups()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  const _pagesInPublicGroups = useMemo(() => {
    if (isPublicAccount()) {
      return {}
    }
    if (!groupsRes.isSuccess) {
      return {}
    }
    return Object.values(groupsRes.data).reduce((_pages, _group) => {
      if (_group.public) {
        _group.pages.forEach((_pageId) => {
          _pages[_pageId] = true
        })
      }
      return _pages
    }, [])
  }, [JSON.stringify(groupsRes.data)])

  if (!pagesRes.isSuccess || !groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={[pagesRes, groupsRes]} />
  }

  const filtered = Object.values(pagesRes.data).filter((page) =>
    archive ? page.archive : !page.archive
  )
  const joined = filtered.map((_page) => ({
    ..._page,
    ...(isPublicAccount()
      ? {}
      : {
          public: groupsRes.data[`p_${_page._id}`]?.public,
          inPublicGroup: _pagesInPublicGroups[_page._id],
        }),
  }))
  // console.log('[PageList] joined', joined)
  const mapped = transform!(joined)

  return (
    <SidebarList
      data-test-element="sidebar-pages-list"
      heading={archive ? 'Archived' : 'Pages'}
      menuItems={mapped}
      {...others}
    />
  )
}

PageList.defaultProps = {
  transform: pagesToListItemData,
}
