import { Page } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const usePages = () => {
  const queryKey = 'pages'
  const query = useDocuments<Page>(queryKey, {
    $type: DocumentType.Page,
  })
  return query
}
