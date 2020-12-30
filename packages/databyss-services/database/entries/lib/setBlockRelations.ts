import ObjectId from 'bson-objectid'
import { BlockRelationPayload } from '@databyss-org/editor/interfaces'
import { db } from '../../db'
import { DocumentType } from '../../../interfaces/Block'

const setBlockRelations = async (payloadArray: BlockRelationPayload[]) => {
  for (const payload of payloadArray) {
    const { blocksRelationArray, clearPageRelationships } = payload

    // clear all block relationships associated to page id
    if (clearPageRelationships) {
      const _blockRelationsToClear = await db.find({
        selector: {
          $type: DocumentType.BlockRelation,
          page: clearPageRelationships,
        },
      })
      const _idsToDelete: any = []
      _blockRelationsToClear.docs.forEach((r) => {
        if (r?._id && r?._rev) {
          _idsToDelete.push({ _id: r._id, _rev: r._rev })
        }
      })

      await db.bulkDocs(
        _idsToDelete.map((i) => ({ _id: i._id, _rev: i._rev, _deleted: true }))
      )
    }
    if (blocksRelationArray?.length) {
      for (const relationship of blocksRelationArray) {
        const { block, relatedBlock, removeBlock } = relationship

        const _blockRelationResults = await db.find({
          selector: {
            block,
            relatedBlock,
          },
        })
        const _blockRelation = _blockRelationResults.docs[0]
        if (removeBlock && _blockRelation) {
          // get blockID
          await db.upsert(_blockRelation._id, () => ({ _deleted: true }))
        } else if (_blockRelation) {
          // update block relation
          await db.upsert(_blockRelation._id, (oldDoc) => ({
            ...oldDoc,
            ...relationship,
          }))
        } else {
          // create a new block relation
          await db.upsert(new ObjectId().toHexString(), () => ({
            $type: DocumentType.BlockRelation,
            _id: new ObjectId().toHexString(),
            ...relationship,
          }))
        }
      }
    }
  }
}

export default setBlockRelations
