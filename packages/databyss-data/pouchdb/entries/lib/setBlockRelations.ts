import { BlockRelationPayload } from '@databyss-org/editor/interfaces'
import { DocumentType } from '../../interfaces'
import { dbRef } from '../../db'
import { findAll, replaceOne } from '../../utils'

const setBlockRelations = async (payloadArray: BlockRelationPayload[]) => {
  console.log('setBlockRelations', payloadArray)
  for (const payload of payloadArray) {
    const { blocksRelationArray, clearPageRelationships } = payload

    // clear all block relationships associated to page id
    if (clearPageRelationships) {
      const _blockRelationsToClear = await findAll(DocumentType.BlockRelation, {
        page: clearPageRelationships,
      })

      const _idsToDelete: any = []
      _blockRelationsToClear.forEach((r) => {
        if (r?._id && r?._rev) {
          _idsToDelete.push({ _id: r._id, _rev: r._rev })
        }
      })

      await dbRef.current.bulkDocs(
        _idsToDelete.map((i) => ({ _id: i._id, _rev: i._rev, _deleted: true }))
      )
    }
    if (blocksRelationArray?.length) {
      for (const relationship of blocksRelationArray) {
        const { block, relatedBlock, removeBlock } = relationship
        await replaceOne({
          $type: DocumentType.BlockRelation,
          query: { block, relatedBlock },
          doc: { ...relationship, _deleted: !!removeBlock },
        })
      }
    }
  }
}

export default setBlockRelations
