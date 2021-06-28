import React, { useEffect, useState } from 'react'
import { useBlockRelations } from '@databyss-org/data/pouchdb/hooks/useBlockRelations'
import { BlockType } from '@databyss-org/editor/interfaces'
import { SidebarList } from '@databyss-org/ui/components'
import { usePages } from '@databyss-org/data/pouchdb/hooks/usePages'
import { SidebarListItemData } from '../index'
import LoadingFallback from '../Notify/LoadingFallback'

export const PageLinks = ({ pageId }: { pageId: string }) => {
  const [linkedPages, setLinkedPages] = useState<SidebarListItemData<any>[]>([])
  const blockRelationRes = useBlockRelations(BlockType.Link)
  const pagesRes = usePages()

  // load block relations and pages, filter out for only linked pages
  useEffect(() => {
    if (blockRelationRes.isSuccess && pagesRes.isSuccess) {
      const _relation = blockRelationRes?.data?.[`r_${pageId}`]
      if (_relation) {
        const _pages = _relation.pages
          .map((i) => pagesRes?.data[i])
          .filter((i) => !!i)
          .map((i) => ({
            route: `/pages/${i._id}`,
            text: i.name,
            type: 'page',
          }))

        setLinkedPages(_pages)
      }
    }
  }, [blockRelationRes, pagesRes])

  if (!blockRelationRes.isSuccess || !pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={[pagesRes, blockRelationRes]} />
  }

  return linkedPages.length ? (
    <SidebarList
      menuItems={[
        {
          text: 'Page Refrences',
          type: 'heading',
          route: '',
        },
        ...linkedPages,
      ]}
    />
  ) : null
}
