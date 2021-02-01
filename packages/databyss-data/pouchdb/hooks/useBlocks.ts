import { Block, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments, UseDocumentsOptions } from './useDocuments'

export const useBlocks = (
  blockType: BlockType,
  options?: UseDocumentsOptions
) => {
  const queryKey = `blocks_${blockType}`
  const query = useDocuments<Block>(
    queryKey,
    {
      $type: DocumentType.Block,
      type: blockType,
    },
    options
  )
  return query
}
