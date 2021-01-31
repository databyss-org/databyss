import { Block, BlockRelation, DocumentDict, Page } from '../interfaces'

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
