import { Group } from '@databyss-org/services/interfaces'
import { selectors } from '../selectors'
import { useDocuments } from './useDocuments'
import { UseDocumentOptions } from './useDocument'

export const useGroups = (options?: UseDocumentOptions) => {
  const query = useDocuments<Group>(selectors.GROUPS, options)
  return query
}
