import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import { blockTypeToRelationSelector } from '../selectors'
import { useDocuments } from './useDocuments'
import { UseDocumentOptions } from './useDocument'

export const useBlockRelations = (
  blockType: BlockType,
  options?: UseDocumentOptions
) => {
  const query = useDocuments<BlockRelation>(
    blockTypeToRelationSelector(blockType),
    options
  )
  return query
}
