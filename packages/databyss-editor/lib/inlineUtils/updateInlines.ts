import {
  Block,
  BlockRelation,
  BlockType,
  Page,
  Text,
} from '@databyss-org/services/interfaces/'
import { ReplicateDict, replicateDocs } from '@databyss-org/data/pouchdb/groups'
import {
  DocumentType,
  DocumentCacheDict,
} from '@databyss-org/data/pouchdb/interfaces'
import {
  bulkUpsert,
  findOne,
  getDocument,
} from '@databyss-org/data/pouchdb/utils'
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
  console.log('[updateInlines]', caches)
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

  const upsertDict = {}
  const replicateDict: ReplicateDict = {}

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

        if (!_block) {
          continue
        }

        if (_block.sharedWithGroups?.length) {
          _block.sharedWithGroups.forEach((_groupId) => {
            if (!replicateDict[_groupId]) {
              replicateDict[_groupId] = new Set<string>()
              replicateDict[_groupId].add(_id)
            }
            replicateDict[_groupId].add(_block._id)
          })
        }

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
        // console.log('[updateInlines] block', _block)
        if (_inlineRanges.length) {
          upsertDict[_block!._id] = {
            ..._block,
            doctype: DocumentType.Block,
          }
        }
      }
    }
  }
  await bulkUpsert(upsertDict)
  await replicateDocs(replicateDict)
}
