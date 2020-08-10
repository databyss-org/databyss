import BlockRelations from '../models/BlockRelations'

// TODO API DOESNT COMPILE TYPESCRIPT
export const addRelationships = async (relationship, req) => {
  const { blockId, relatedBlockId } = relationship
  // find relationship
  let _blockRelationship = await BlockRelations.findOne({
    blockId,
    relatedBlockId,
  })
  if (!_blockRelationship) {
    _blockRelationship = new BlockRelations()
  }

  Object.assign(_blockRelationship, {
    ...relationship,
    accountId: req.account._id,
  })

  await _blockRelationship.save()
}
