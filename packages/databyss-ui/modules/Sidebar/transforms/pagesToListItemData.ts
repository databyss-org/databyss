import { Page } from '@databyss-org/services/interfaces'
import { SidebarListItemData } from '@databyss-org/ui/components'

export const pagesToListItemData = (
  pages: Page[]
): SidebarListItemData<Page>[] =>
  pages.map((p) => ({
    text: p.name,
    type: 'page',
    route: `/pages/${p._id}`,
    data: p,
  }))
