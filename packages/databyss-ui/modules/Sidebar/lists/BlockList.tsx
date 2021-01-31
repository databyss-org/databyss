import React from 'react'
import { Block, BlockType } from '@databyss-org/editor/interfaces'
import {
  groupBlockRelationsByRelatedBlock,
  joinBlockRelations,
} from '@databyss-org/services/blocks'
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
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import {
  blocksToListItemData,
  SidebarTransformFunction,
} from '@databyss-org/ui/modules/Sidebar/transforms'
import {
  BlockRelation,
  DocumentDict,
  Page,
} from '@databyss-org/services/interfaces'

interface BlockListProps<T extends Block> {
  blockType: BlockType
  transform?: SidebarTransformFunction<T>
  prependItems?: SidebarListItemData<T>[]
}

export const getBlocksInPages = <T extends Block>(
  blockRelationDict: DocumentDict<BlockRelation>,
  blockDict: DocumentDict<Block>,
  pageDict: DocumentDict<Page>,
  transform: SidebarTransformFunction<T>,
  includeArchived: boolean
) => {
  const filtered = joinBlockRelations({
    blockRelationDict,
    pageDict,
    pagePredicate: (page) => Boolean(page.archive) === includeArchived,
  })
  const grouped = groupBlockRelationsByRelatedBlock(Object.values(filtered))
  const blocks = Object.keys(grouped)
    .map((blockId) => blockDict[blockId])
    .filter((b) => Boolean(b)) as T[]
  return transform(blocks)
}

export const BlockList = <T extends Block>({
  blockType,
  transform,
  prependItems,
  ...others
}: BlockListProps<T>) => {
  const blockRelationsRes = useBlockRelations(blockType)
  const blocksRes = useBlocks(blockType)
  const pagesRes = usePages()
  const queryRes = [blockRelationsRes, blocksRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const mapped = getBlocksInPages(
    blockRelationsRes.data!,
    blocksRes.data!,
    pagesRes.data!,
    transform!,
    false
  )
  const sorted = sortEntriesAtoZ(mapped, 'text')
  const menuItems = (prependItems || []).concat(sorted)

  return <SidebarList menuItems={menuItems} {...others} />
}

BlockList.defaultProps = {
  transform: blocksToListItemData,
}
