import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import { UseQueryOptions } from 'react-query'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType?: BlockType,
  options?: UseQueryOptions
) => {
  const query = useDocuments<BlockRelation>(
    {
      doctype: DocumentType.BlockRelation,
      ...(blockType
        ? {
            blockType,
          }
        : {}),
    },
    options
  )
  return query
}
