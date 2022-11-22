import { BlockRelation } from '@databyss-org/editor/interfaces/index'
import { indexPage } from '@databyss-org/editor/lib/util'
// TODO: importing this file makes the server fail
import { getAtomicClosureText } from './'
import { Block, IndexPageResult, DocumentDict } from '../interfaces'
import { Page } from '../interfaces/Page'
import { BlockType, CacheDict } from '../interfaces/Block'

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
}: JoinBlockRelationsArgs): CacheDict<BlockRelation> =>
  Object.values(blockRelationDict).reduce((accum, curr) => {
    let _include = true
    if (relationPredicate) {
      _include = _include && relationPredicate(curr)
    }
    if (blockPredicate) {
      _include = _include && blockPredicate(blockDict![curr.blockId])
    }
    if (pagePredicate) {
      _include =
        _include &&
        curr.pages
          .map((_pageId) => pageDict![_pageId])
          .filter((_p) => !!_p)
          .some(pagePredicate)
    }
    if (_include) {
      accum[curr._id] = curr
    }
    return accum
  }, {})

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
    .map((blockRelation) => blockDict[blockRelation.blockId])
    .filter((b) => Boolean(b)) as T[]
  return blocks
}

export const populatePage = ({
  page,
  blocks,
}: {
  page: Page
  blocks: DocumentDict<Block>
}) => {
  const _page = page

  _page.blocks = page.blocks.map((b) => {
    const _block = { ...b, ...blocks[b._id] }
    // check for atomic block closure
    if (b.type?.match(/^END_/)) {
      _block.type = b.type
      _block.text = {
        textValue: getAtomicClosureText(b.type, _block.text.textValue),
        ranges: [],
      }
    }
    return _block
  })
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
  const _pages: Page[] = []
  blockRelation.pages.forEach((p) => {
    if (!pages[p]) {
      return
    }
    _pages.push(populatePage({ page: pages[p], blocks }))
  })

  const relations: IndexPageResult[] = []
  // create a set to prevent duplicates
  const _duplicateDict: { [key: string]: boolean } = {}
  // returns array of all block relations to provided id
  _pages.forEach((p) =>
    indexPage({
      pageId: p._id,
      blocks: p.blocks,
    }).forEach((r: IndexPageResult) => {
      // do not allow duplicates
      if (
        blocks[r.block].type !== BlockType.Entry ||
        !_duplicateDict[`${r.block + r.relatedBlock}`]
      ) {
        relations.push(r)
        _duplicateDict[`${r.block + r.relatedBlock}`] = true
      }
    })
  )

  return relations
}
