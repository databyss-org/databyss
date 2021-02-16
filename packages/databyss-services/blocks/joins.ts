import { BlockRelation } from '@databyss-org/editor/interfaces/index'
import { indexPage } from '@databyss-org/editor/lib/util'
import { Block, IndexPageResult, DocumentDict } from '../interfaces'
import { groupBlockRelationsByRelatedBlock } from './aggregate'
import { Page } from '../interfaces/Page'
import { CacheDict } from '../interfaces/Block'

interface JoinBlockRelationsArgs {
  blockRelationDict: CacheDict<BlockRelation>
  blockDict?: DocumentDict<Block>
  blockPredicate?: (block: Block) => boolean
  pageDict?: DocumentDict<Page>
  pagePredicate?: (page: Page) => boolean
  relationPredicate?: (relation: BlockRelation) => boolean
}
export const joinBlockRelations = ({
  blockRelationDict,
  blockDict,
  blockPredicate,
  pageDict,
  pagePredicate,
  relationPredicate,
}: JoinBlockRelationsArgs): CacheDict<IndexPageResult> =>
  Object.values(blockRelationDict).reduce((accum, curr) => {
    let _include = true
    if (relationPredicate) {
      _include = _include && relationPredicate(curr)
    }
    if (blockPredicate) {
      _include = _include && blockPredicate(blockDict![curr.block])
    }
    if (pagePredicate) {
      _include =
        _include &&
        curr.pages.map((_pageId) => pageDict![_pageId]).some(pagePredicate)
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

export const getBlocksFromBlockRelations = <T extends Block>(
  blockRelationDict: DocumentDict<BlockRelation>,
  blockDict: DocumentDict<Block>,
  pageDict: DocumentDict<Page>,
  includeArchived: boolean
) => {
  /**
   * Joined BlockRelationDict
   * Only include where relation has pages
   * Also filter based on includeArchived arg
   */
  const filtered = joinBlockRelations({
    blockRelationDict,
    pageDict,
    relationPredicate: (relation) => Boolean(relation.pages?.length),
    pagePredicate: (page) => Boolean(page.archive) === includeArchived,
  })

  const blocks = Object.values(filtered)
    .map((blockRelation) => blockDict[blockRelation._id.substring(2)])
    .filter((b) => Boolean(b)) as T[]
  return blocks
}

const populatePage = ({
  page,
  blocks,
}: {
  page: Page
  blocks: DocumentDict<Block>
}) => {
  const _page = page
  _page.blocks = page.blocks.map((b) => blocks[b._id])
  return _page
}

export const addPagesToBlockRelation = ({
  blockRelation,
  pages,
  blocks,
}: {
  blockRelation: BlockRelation
  pages: DocumentDict<Page>
  blocks: DocumentDict<Block>
}) => {
  const _pages = blockRelation.pages.map((p) =>
    populatePage({ page: pages[p], blocks })
  )

  const relations: IndexPageResult[] = []
  // returns array of all block relations to provided id
  _pages.forEach((p) =>
    indexPage({
      pageId: p._id,
      blocks: p.blocks,
    }).forEach((r: IndexPageResult) => relations.push(r))
  )

  return relations
}
