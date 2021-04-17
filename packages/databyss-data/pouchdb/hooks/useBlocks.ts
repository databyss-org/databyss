import { Block, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments, UseDocumentsOptions } from './useDocuments'

export const useBlocks = (
  blockType: BlockType,
  options?: UseDocumentsOptions
) => {
  const query = useDocuments<Block>(
    {
      doctype: DocumentType.Block,
      type: blockType,
    },
    options
  )
  return query
}
