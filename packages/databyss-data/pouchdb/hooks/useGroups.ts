import { Group } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments, UseDocumentsOptions } from './useDocuments'

export const useGroups = (options?: UseDocumentsOptions) => {
  const query = useDocuments<Group>(
    {
      $type: DocumentType.Group,
    },
    options
  )
  return query
}
