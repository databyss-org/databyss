import React from 'react'
import { Block, BlockType } from '@databyss-org/editor/interfaces'
import {
  useBlockRelations,
  useBlocks,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import {
  LoadingFallback,
  SidebarList,
  SidebarListItemData,
} from '@databyss-org/ui/components'
import {
  blocksToListItemData,
  SidebarTransformFunction,
} from '@databyss-org/ui/modules/Sidebar/transforms'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'

interface BlockListProps<T extends Block> {
  blockType: BlockType
  transform?: SidebarTransformFunction<T>
  prependItems?: SidebarListItemData<T>[]
  heading?: string
}

export const BlockList = <T extends Block>({
  blockType,
  transform,
  prependItems,
  heading,
  ...others
}: BlockListProps<T>) => {
  const blockRelationsRes = useBlockRelations(blockType)
  const blocksRes = useBlocks(blockType)
  const pagesRes = usePages()
  const queryRes = [blockRelationsRes, blocksRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const mapped = transform!(
    getBlocksFromBlockRelations(
      blockRelationsRes.data!,
      blocksRes.data!,
      pagesRes.data!,
      false
    )
  )

  return (
    <SidebarList
      menuItems={mapped}
      prependItems={prependItems}
      heading={heading}
      {...others}
    />
  )
}

BlockList.defaultProps = {
  transform: blocksToListItemData,
}
