import { useQueryClient, UseQueryResult } from 'react-query'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'

export const useUserPreferences = (
  options?: UseDocumentOptions
): [UseQueryResult<UserPreference>, (prefs: UserPreference) => void] => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const queryClient = useQueryClient()
  return [
    // TODO: read from localstorage
    useDocument<UserPreference>('user_preference', {
      enabled: !isPublicAccount,
      ...options,
    }),
    // TODO: persist to localstorage
    isPublicAccount
      ? (prefs: UserPreference) => {
          queryClient.setQueryData('user_preference', prefs)
        }
      : () => null,
  ]
}
