import { Block, BlockRelation, DocumentDict } from '../interfaces'
import { groupBlockRelationsByRelatedBlock } from './aggregate'
import { BlockRelationResponse } from '../../databyss-editor/interfaces/index'
import { Page } from '../interfaces/Page'
import { indexPage } from '../../databyss-editor/lib/util'

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
      _include =
        _include &&
        curr.pages.map((_pageId) => pageDict[_pageId]).every(pagePredicate)
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
  const filtered = joinBlockRelations({
    blockRelationDict,
    pageDict,
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
  blockRelation: BlockRelationResponse
  pages: DocumentDict<Page>
  blocks: DocumentDict<Block>
}) => {
  const _pages = blockRelation.pages.map((p) =>
    populatePage({ page: pages[p], blocks })
  )

  const relations: BlockRelation[] = []

  _pages.forEach((p) =>
    indexPage({ pageId: p._id, blocks: p.blocks }).forEach((r: BlockRelation) =>
      relations.push(r)
    )
  )

  return relations
}
