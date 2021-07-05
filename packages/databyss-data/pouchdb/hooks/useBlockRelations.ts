import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { UseQueryOptions } from 'react-query'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType?: BlockType,
  selector: PouchDB.Find.Selector = {},
  options?: UseQueryOptions
) => {
  const query = useDocuments<BlockRelation>({
    doctype: DocumentType.BlockRelation,
    ...(blockType
      ? {
          blockType,
        }
      : {}),
    ...selector,
    options,
  })
  return query
}
