import ObjectId from 'bson-objectid'
import { db } from './db'

const setPouchBlockRelations = async (payloadArray) => {
  console.log(payloadArray)
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
        if (removeBlock) {
          // get blockID
          const _blockToDelete = await db.find({
            selector: {
              block,
              relatedBlock,
            },
          })
          db.put({ _id: _blockToDelete._id, _deleted: true })
        } else {
          await db.put({
            _id: new ObjectId().toHexString(),
            block,
            relatedBlock,
            ...relationship,
          })
        }
        // await addRelationships(relationship, req)
      }
    }
  }
}

export default setPouchBlockRelations
