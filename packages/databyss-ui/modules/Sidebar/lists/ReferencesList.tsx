import React from 'react'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePageReferences } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { Page } from '@databyss-org/services/interfaces'
import { pagesToListItemData } from '@databyss-org/ui/modules/Sidebar/transforms'
import { SidebarListItemData, useNavigationContext } from '../../../components'

export const ReferencesList = () => {
  const { getTokensFromPath } = useNavigationContext()
  const { params: pageId } = getTokensFromPath()
  const pageReferencesRes = usePageReferences(pageId)

  if (!pageReferencesRes.isSuccess) {
    return <LoadingFallback queryObserver={[pageReferencesRes]} />
  }

  let _sorted: SidebarListItemData<Page>[] = []
  const _pages = pageReferencesRes.data
  const _mapped = pagesToListItemData(_pages)
  _sorted = sortEntriesAtoZ(_mapped, 'text')

  return (
    <SidebarList
      menuItems={[
        {
          text: 'Backlinks',
          type: 'heading',
          route: '',
        },
        ..._sorted,
      ]}
    />
  )
}
