import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType?: BlockType,
  selector: PouchDB.Find.Selector = {}
) => {
  const queryKey = ['blockRelations', blockType || 'ALL', selector]
  const query = useDocuments<BlockRelation>(queryKey, {
    $type: DocumentType.BlockRelation,
    ...(blockType
      ? {
          relatedBlockType: blockType,
        }
      : {}),
    ...selector,
  })
  return query
}
