import { Block, BlockRelation, DocumentDict, Page } from '../interfaces'
import { groupBlockRelationsByRelatedBlock } from './aggregate'

interface JoinBlockRelationsArgs {
  blockRelationDict: DocumentDict<BlockRelation>
  blockDict?: DocumentDict<Block>
  blockPredicate?: (block: Block) => boolean
  pageDict?: DocumentDict<Page>
  pagePredicate?: (page: Page) => boolean
}

export const joinBlockRelations = ({
  blockRelationDict,
  blockDict,
  blockPredicate,
  pageDict,
  pagePredicate,
}: JoinBlockRelationsArgs): DocumentDict<BlockRelation> =>
  Object.values(blockRelationDict).reduce((accum, curr) => {
    let _include = true
    if (blockPredicate) {
      _include = _include && blockPredicate(blockDict![curr.block])
    }
    if (pagePredicate) {
      _include = _include && pagePredicate(pageDict![curr.page])
    }
    if (_include) {
      accum[curr._id] = curr
    }
    return accum
  }, {})

/**
 * Returns only blocks that are in pages
 */
export const getBlocksInPages = <T extends Block>(
  blockRelationDict: DocumentDict<BlockRelation>,
  blockDict: DocumentDict<Block>,
  pageDict: DocumentDict<Page>,
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
  return blocks
}
