import { BlockType, Document } from '@databyss-org/services/interfaces'
import { SidebarListItemData } from '@databyss-org/ui/components'

export { authorsToListItemData } from './authorsToListItemData'
export { blocksToListItemData } from './blocksToListItemData'
export { pagesToListItemData } from './pagesToListItemData'

export type SidebarTransformFunction<T extends Document> = (
  docs: T[]
) => SidebarListItemData<T>[]

export const blockTypeToListItemType = (blockType: BlockType): string => {
  switch (blockType) {
    case BlockType.Source:
      return 'source'
    case BlockType.Topic:
      return 'topic'
    case BlockType.Embed:
      return 'embed'
    default:
      console.warn(`[blockTypeToListItemType] Invalid block type: ${blockType}`)
      return null
  }
}
