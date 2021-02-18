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
    default:
      throw new Error(`Invalid block type: ${blockType}`)
  }
}
