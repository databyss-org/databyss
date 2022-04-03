import { Page } from '@databyss-org/services/interfaces'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { SidebarListItemData } from '@databyss-org/ui/components'

export interface SidebarPageMeta {
  public?: boolean
  inPublicGroup?: boolean
}

export const pagesToListItemData = (
  pages: (Page & SidebarPageMeta)[]
): SidebarListItemData<Page>[] =>
  pages.map((p) => {
    let iconColor: string | null = null
    if (p.public) {
      iconColor = 'yellow'
    } else if (p.inPublicGroup) {
      iconColor = 'orange.2'
    }

    return {
      text: p.name,
      type: 'page',
      route: `/pages/${p._id}/${urlSafeName(p.name)}`,
      iconColor,
      data: p,
    }
  })
