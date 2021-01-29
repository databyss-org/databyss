import { Block, BlockRelation, DocumentDict } from '../interfaces'

export const joinBlockRelationsWithBlocks = (
  blockRelationsDict: DocumentDict<BlockRelation>,
  blockDict: DocumentDict<Block>
) =>
  Object.values(
    Object.values(blockRelationsDict).reduce((_blocks, _relation) => {
      _blocks[_relation.relatedBlock] = blockDict[_relation.relatedBlock]
      return _blocks
    }, {})
  )
