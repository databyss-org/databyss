import { BlockType } from '@databyss-org/services/interfaces/Block'
import { BlockRelation } from '@databyss-org/editor/interfaces/index'
import { replaceInlineText } from '@databyss-org/editor/state/util'
import { Topic, Block } from '@databyss-org/services/interfaces'
import { db } from '../../db'
import { DocumentType } from '../../interfaces'
import { upsert } from '../../utils'

const setTopic = async (data: Topic) => {
  const { text, _id } = data

  const block = await upsert({
    $type: DocumentType.Block,
    _id,
    doc: {
      ...data,
      type: BlockType.Topic,
    },
  })

  console.log('set topic', block)
  // await db.upsert(_id, (oldDoc) => {
  //   block = {
  //     ...addTimeStamp(oldDoc),
  //     ...data,
  //     type: BlockType.Topic,
  //     $type: DocumentType.Block,
  //   }
  //   return block
  // })

  /*
      find all inline block relations with associated id and update blocks
    */

  const _results = await db.find({
    selector: {
      $type: DocumentType.BlockRelation,
      relatedBlock: _id,
      relationshipType: 'INLINE',
    },
  })

  const _relations: BlockRelation[] = _results.docs

  for (const relation of _relations) {
    // get the block to update
    const _blockResults = await db.find({
      selector: {
        $type: DocumentType.Block,
        _id: relation.block,
        //     relationshipType: 'INLINE',
      },
    })
    const _block: Block = _blockResults.docs[0]

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

        const _blockRelationResults = await db.find({
          selector: {
            $type: DocumentType.BlockRelation,
            relatedBlock: _id,
            block: _block._id,
          },
        })

        const _blockRelationToUpdate = _blockRelationResults.docs[0]
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
