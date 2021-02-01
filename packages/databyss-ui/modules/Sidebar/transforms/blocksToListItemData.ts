import { Block } from '@databyss-org/editor/interfaces'
import { blockTypeToListItemType, SidebarTransformFunction } from '.'

export const blocksToListItemData: SidebarTransformFunction<Block> = (blocks) =>
  blocks.map((_block) => ({
    type: blockTypeToListItemType(_block.type),
    route: `/${blockTypeToListItemType(_block.type)}s/${_block._id}`,
    text: _block.text.textValue,
  }))
