import {
  Block,
  BlockRelation,
  BlockType,
  Page,
  Text,
} from '@databyss-org/services/interfaces/'
import { replicateSharedPage } from '@databyss-org/data/pouchdb/groups'
import {
  DocumentType,
  DocumentCacheDict,
} from '@databyss-org/data/pouchdb/interfaces'
import { findOne, getDocument, upsert } from '@databyss-org/data/pouchdb/utils'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { replaceInlineText } from '../../state/util'

/**
 * Get the BlockRelations doc for this topic,
 * iterate through the pages and update blocks that have the topic as an inline entity
 */
export const updateInlines = async ({
  inlineType,
  text,
  _id,
  caches,
}: {
  inlineType: InlineTypes
  text: Text
  _id: string
  caches?: DocumentCacheDict
}) => {
  const _relation = await findOne<BlockRelation>({
    doctype: DocumentType.BlockRelation,
    query: {
      blockId: _id,
    },
  })

  if (!_relation) {
    // block has no relations yet
    return
  }

  for (const _pageId of _relation!.pages) {
    const _page = caches?.pages?.[_pageId] ?? (await getDocument<Page>(_pageId))

    if (!_page) {
      continue
    }
    for (const _blockRef of _page!.blocks) {
      if (_blockRef.type === BlockType.Entry) {
        // get the block to scan
        const _block =
          caches?.blocks?.[_blockRef._id] ??
          (await getDocument<Block>(_blockRef._id))

        // get all inline ranges from block
        const _inlineRanges = _block!.text.ranges.filter(
          (r) => r.marks.filter((m) => m.includes(inlineType)).length
        )

        // eslint-disable-next-line no-loop-func
        _inlineRanges.forEach((r) => {
          // if inline range is matches the ID, update block
          if (r.marks[0].length === 2) {
            const _inlineMark = r.marks[0]
            const _inlineId = _inlineMark[1]
            if (_inlineId === _id) {
              const _newText = replaceInlineText({
                text: _block!.text,
                refId: _id,
                newText: text,
                type: inlineType,
              })
              Object.assign(_block, { text: _newText })
            }
          }
        })
        if (_inlineRanges.length) {
          // update block
          await upsert({
            doctype: DocumentType.Block,
            _id: _block!._id,
            doc: _block,
          })
        }
      }
    }
  }

  // update all replicated pages related to topic
  const pagesWhereAtomicExists: string[] = _relation.pages
  replicateSharedPage(pagesWhereAtomicExists)
}
