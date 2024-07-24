import { Block } from '@databyss-org/editor/interfaces'
import { Source, Topic } from '@databyss-org/services/interfaces'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { blockTypeToListItemType, SidebarTransformFunction } from '.'

export const blocksToListItemData: SidebarTransformFunction<
  Block | Source | Topic
> = (blocks) =>
  blocks
    .map((_block) => ({
      data: _block,
      type: blockTypeToListItemType(_block.type),
      route: `/${blockTypeToListItemType(_block.type)}s/${
        _block._id
      }/${urlSafeName(_block.text.textValue)}`,
      text: _block.text?.textValue,
      // if short name provided
      ...('name' in _block && { name: _block.name!.textValue }),
    }))
    .filter((item) => item.type !== null)
