import { Page } from '@databyss-org/services/interfaces'
import { selectors } from '../selectors'
import { UseDocumentOptions } from './useDocument'
import { useDocuments } from './useDocuments'

export const usePages = (options?: UseDocumentOptions) => {
  const query = useDocuments<Page>(selectors.PAGES, options)
  return query
}
