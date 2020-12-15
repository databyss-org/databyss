import ObjectId from 'bson-objectid'
import { db } from './db'
import { DocumentType } from './interfaces'

const setPouchBlockRelations = async (payloadArray) => {
  for (const payload of payloadArray) {
    const { blocksRelationArray, clearPageRelationships } = payload

    // clear all block relationships associated to page id
    if (clearPageRelationships) {
      await db.bulkDocs([
        {
          documentType: 'BLOCK_RELATIONS',
          page: clearPageRelationships,
          _deleted: true,
        },
      ])
      //   await BlockRelation.deleteMany({
      //     page: clearPageRelationships,
      //     account: req.account._id,
      //   })
    }
    if (blocksRelationArray.length) {
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
          await db.put({
            documentType: DocumentType.BlockRelation,
            _id: new ObjectId().toHexString(),
            block,
            relatedBlock,
            ...relationship,
          })
        }
      }
    }
  }
}

export default setPouchBlockRelations
