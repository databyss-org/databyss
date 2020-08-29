import BlockRelation from '../models/BlockRelation'

// TODO API DOESNT COMPILE TYPESCRIPT
export const addRelationships = async (relationship, req) => {
  const { block, relatedBlock } = relationship
  // find relationship

  await BlockRelation.replaceOne(
    {
      block,
      relatedBlock,
    },
    {
      ...relationship,
      account: req.account._id,
    },
    { upsert: true }
  )
}
