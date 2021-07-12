import { Group } from '@databyss-org/services/interfaces'
import { QueryOptions } from 'react-query'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useGroups = (options?: QueryOptions) => {
  const query = useDocuments<Group>(
    {
      doctype: DocumentType.Group,
    },
    options
  )
  return query
}
