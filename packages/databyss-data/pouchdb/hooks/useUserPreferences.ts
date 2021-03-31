import { useQueryClient, UseQueryResult } from 'react-query'
import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'

export const useUserPreferences = (
  options?: UseDocumentOptions
): [UseQueryResult<UserPreference>, (prefs: UserPreference) => void] => {
  const queryClient = useQueryClient()
  return [
    useDocument<UserPreference>('user_preference', options),
    (prefs: UserPreference) => {
      queryClient.setQueryData('user_preference', prefs)
    },
  ]
}
