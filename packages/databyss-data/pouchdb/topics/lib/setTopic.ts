import { BlockType } from '@databyss-org/services/interfaces/Block'
import { replaceInlineText } from '@databyss-org/editor/state/util'
import { Topic, Block, BlockRelation } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert, findAll, findOne } from '../../utils'

const setTopic = async (data: Topic) => {
  const { text, _id } = data

  await upsert({
    $type: DocumentType.Block,
    _id,
    doc: {
      ...data,
      type: BlockType.Topic,
    },
  })

  /*
      find all inline block relations with associated id and update blocks
    */
  const _relations: BlockRelation[] = await findAll({
    $type: DocumentType.BlockRelation,
    query: {
      relatedBlock: _id,
      relationshipType: 'INLINE',
    },
    useIndex: 'inline-atomics',
  })

  for (const relation of _relations) {
    // get the block to update
    const _block: Block = await findOne({
      $type: DocumentType.Block,
      query: {
        _id: relation.block,
      },
      useIndex: 'fetch-one',
    })

    if (_block) {
      // get all inline ranges from block
      const _inlineRanges = _block.text.ranges.filter(
        (r) => r.marks.filter((m) => m.includes('inlineTopic')).length
      )

      // eslint-disable-next-line no-loop-func
      _inlineRanges.forEach((r) => {
        // if inline range is matches the ID, update block
        if (r.marks[0].length === 2) {
          const _inlineMark = r.marks[0]
          const _inlineId = _inlineMark[1]
          if (_inlineId === _id) {
            const _newText = replaceInlineText({
              text: _block.text,
              refId: _id,
              newText: text,
            })
            Object.assign(_block, { text: _newText })
          }
        }
      })
      if (_inlineRanges.length) {
        // update block
        await upsert({
          $type: DocumentType.Block,
          _id: _block._id,
          doc: _block,
        })
        // update relation
        const _blockRelationToUpdate = await findOne({
          $type: DocumentType.BlockRelation,
          query: {
            relatedBlock: _id,
            block: _block._id,
          },
          useIndex: 'block-relation',
        })

        if (_blockRelationToUpdate) {
          await upsert({
            $type: DocumentType.BlockRelation,
            _id: _blockRelationToUpdate._id,
            doc: {
              ...relation,
              blockText: _block.text,
            },
          })
        }
      }
    }
  }
}

export default setTopic
