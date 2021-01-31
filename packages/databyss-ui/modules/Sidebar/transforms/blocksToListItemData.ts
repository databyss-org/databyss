import { Block } from '@databyss-org/editor/interfaces'
import { blockTypeToListItemType, SidebarMapFunction } from '.'

export const blocksToListItemData: SidebarMapFunction<Block> = (blocks) =>
  blocks.map((_block) => ({
    type: blockTypeToListItemType(_block.type),
    route: `/${blockTypeToListItemType(_block.type)}s/${_block._id}`,
    text: _block.text.textValue,
  }))
