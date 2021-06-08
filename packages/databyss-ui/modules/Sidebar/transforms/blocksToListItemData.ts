import { Block } from '@databyss-org/editor/interfaces'
import { Source, Topic } from '@databyss-org/services/interfaces'
import { blockTypeToListItemType, SidebarTransformFunction } from '.'

export const blocksToListItemData: SidebarTransformFunction<
  Block | Source | Topic
> = (blocks) =>
  blocks.map((_block) => ({
    type: blockTypeToListItemType(_block.type),
    route: `/${blockTypeToListItemType(_block.type)}s/${_block._id}`,
    text: _block.text.textValue,
    // if short name provided
    ...('name' in _block && { name: _block.name!.textValue }),
  }))
