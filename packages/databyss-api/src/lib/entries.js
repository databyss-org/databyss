import BlockRelation from '../models/BlockRelation'

// TODO API DOESNT COMPILE TYPESCRIPT
export const addRelationships = async (relationship, req) => {
  const { blockId, relatedBlockId } = relationship
  // find relationship

  await BlockRelation.replaceOne(
    {
      blockId,
      relatedBlockId,
    },
    {
      ...relationship,
      accountId: req.account._id,
    },
    { upsert: true }
  )
}
