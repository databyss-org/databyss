import { Page } from '@databyss-org/services/interfaces'
import { SidebarListItemData } from '@databyss-org/ui/components'

export interface SidebarPageMeta {
  public?: boolean
}

export const pagesToListItemData = (
  pages: (Page & SidebarPageMeta)[]
): SidebarListItemData<Page>[] =>
  pages.map((p) => ({
    text: p.name,
    type: 'page',
    route: `/pages/${p._id}`,
    iconColor: p.public ? 'yellow' : null,
    data: p,
  }))
