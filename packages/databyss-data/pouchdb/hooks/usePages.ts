import { Page } from '@databyss-org/services/interfaces'
import { QueryOptions } from 'react-query'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const usePages = (options?: QueryOptions) => {
  const query = useDocuments<Page>(
    {
      doctype: DocumentType.Page,
    },
    options
  )
  return query
}
