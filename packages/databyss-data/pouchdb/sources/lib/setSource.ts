import { Source, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert, findOne, getDocument } from '../../utils'
import {
  BlockRelation,
  Block,
} from '../../../../databyss-services/interfaces/Block'
import { replicateSharedPage } from '../../groups/index'
import { Page } from '../../../../databyss-services/interfaces/Page'
import { InlineTypes } from '../../../../databyss-services/interfaces/Range'
import { replaceInlineText } from '../../../../databyss-editor/state/util'

export const setSource = async (data: Source) => {
  const { text, detail, _id, sharedWithGroups } = data as any

  let { name } = data as any
  if (!name?.textValue?.length) {
    name = text
  }
  const blockFields = {
    _id,
    text,
    name,
    type: BlockType.Source,
    doctype: DocumentType.Block,
    detail,
    sharedWithGroups,
  }
  // console.log('[setSource]', blockFields)
  // TODO: get document and use Object.assign(_source, blockFields) to only replace new fields
  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  // get block relations to upsert all related documents
  const _relation = await findOne<BlockRelation>({
    doctype: DocumentType.BlockRelation,
    query: {
      blockId: _id,
    },
  })

  if (!_relation) {
    // block has no relations, remove
    return
  }

  for (const _pageId of _relation!.pages) {
    const _page = await getDocument<Page>(_pageId)
    for (const _blockRef of _page!.blocks) {
      if (_blockRef.type === BlockType.Entry) {
        // get the block to scan
        const _block = await getDocument<Block>(_blockRef._id)

        // get all inline ranges from block
        const _inlineRanges = _block!.text.ranges.filter(
          (r) =>
            r.marks.filter((m) => m.includes(InlineTypes.InlineSource)).length
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
                newText: name,
                type: InlineTypes.InlineSource,
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

export default setSource
