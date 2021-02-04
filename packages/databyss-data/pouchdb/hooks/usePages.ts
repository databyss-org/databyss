import { Page } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments, UseDocumentsOptions } from './useDocuments'

export const usePages = (options?: UseDocumentsOptions) => {
  const queryKey = ['pages']
  const query = useDocuments<Page>(
    queryKey,
    {
      $type: DocumentType.Page,
    },
    options
  )
  return query
}
