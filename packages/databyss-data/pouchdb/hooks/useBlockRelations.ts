import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import { UseQueryOptions } from '@tanstack/react-query'
import { blockTypeToRelationSelector } from '../selectors'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType: BlockType,
  options?: UseQueryOptions
) => {
  const query = useDocuments<BlockRelation>(
    blockTypeToRelationSelector(blockType),
    options
  )
  return query
}
