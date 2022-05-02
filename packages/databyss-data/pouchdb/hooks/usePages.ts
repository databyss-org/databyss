import { Page } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { UseDocumentOptions } from './useDocument'
import { useDocuments } from './useDocuments'

export const usePages = (options?: UseDocumentOptions) => {
  const query = useDocuments<Page>(
    {
      doctype: DocumentType.Page,
    },
    options
  )
  return query
}
