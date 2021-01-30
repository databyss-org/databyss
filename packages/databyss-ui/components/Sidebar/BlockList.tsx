import React from 'react
import { Block, BlockType } from '@databyss-org/editor/interfaces'
import {
  groupBlockRelationsByRelatedBlock,
  joinBlockRelations,
} from '@databyss-org/services/blocks'
import { useBlockRelations, useBlocks, usePages } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import SidebarList from './SidebarList'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { Document } from '@databyss-org/services/interfaces'

interface BlockListProps {
  blockType: BlockType
}

export interface SidebarListItem<T extends Document> {
  text: string
  type: string
  route: string
  data?: T
}

const blockTypeToListItemType = (blockType: BlockType): string => {
  switch (blockType) {
    case BlockType.Source:
      return 'source'
    case BlockType.Topic:
      return 'topic'
    default:
      throw new Error(`Invalid block type: ${blockType}`)
  }
}


export const BlockList = ({ blockType,  ...others }) => {
  const blockRelationsRes = useBlockRelations(blockType)
  const blocksRes = useBlocks(BlockType.Topic)
  const pagesRes = usePages()
  const queryRes = [blockRelationsRes, blocksRes, pagesRes]
  
  const blocksToListItems = (blocks: Block[]): SidebarListItem[] => (
    blocks.map(_block => ({
      type: blockTypeToListItemType(blockType),
      route: `/${blockTypeToListItemType(blockType)}s/${_block._id}`,
      text: _block.text.textValue
    }))
  )

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const filtered = joinBlockRelations({
    blockRelationDict: blockRelationsRes.data!,
    pageDict: pagesRes.data,
    pagePredicate: (page) => !page.archive,
  })
  const grouped = groupBlockRelationsByRelatedBlock(Object.values(filtered))
  const mapped = blocksToListItems(
    Object.keys(grouped).map((blockId) => blocksRes.data![blockId])
  )
  const sorted = sortEntriesAtoZ(mapped, 'text')

  return <SidebarList menuItems={sorted} {...others} />
}