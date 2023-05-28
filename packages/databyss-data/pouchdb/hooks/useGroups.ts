import { Group } from '@databyss-org/services/interfaces'
import { QueryOptions } from '@tanstack/react-query'
import { selectors } from '../selectors'
import { useDocuments } from './useDocuments'

export const useGroups = (options?: QueryOptions) => {
  const query = useDocuments<Group>(selectors.GROUPS, options)
  return query
}
