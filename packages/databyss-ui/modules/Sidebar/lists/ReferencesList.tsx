import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePageReferences } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { pagesToListItemData } from '@databyss-org/ui/modules/Sidebar/transforms'
import { useNavigationContext } from '../../../components'

export const ReferencesList = () => {
  const { getTokensFromPath } = useNavigationContext()
  const { params: pageId } = getTokensFromPath()
  const pageReferencesRes = usePageReferences(pageId)

  if (!pageReferencesRes.isSuccess) {
    return <LoadingFallback queryObserver={[pageReferencesRes]} />
  }

  const _pages = pageReferencesRes.data
  const _mapped = pagesToListItemData(_pages)

  return <SidebarList heading="Backlinks" menuItems={_mapped} />
}
