import BlockRelations from '../models/BlockRelations'

// TODO API DOESNT COMPILE TYPESCRIPT
export const addRelationships = async (relationship, req) => {
  // TODO: upsert true like block schema
  const { blockId, relatedBlockId } = relationship
  // find relationship

  await BlockRelations.replaceOne(
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
