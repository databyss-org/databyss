import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { BlockRelationResponse } from '@databyss-org/editor/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType?: BlockType,
  selector: PouchDB.Find.Selector = {}
) => {
  const queryKey = ['blockRelations', blockType || 'ALL', selector]
  const query = useDocuments<BlockRelationResponse>(queryKey, {
    $type: DocumentType.BlockRelation,
    ...(blockType
      ? {
          type: blockType,
        }
      : {}),
    ...selector,
  })
  return query
}
