import { useQueryClient, UseQueryResult } from 'react-query'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Group } from '@databyss-org/services/interfaces'
import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'

export const useUserPreferences = (
  options?: UseDocumentOptions
): [
  UseQueryResult<UserPreference | Group>,
  (prefs: UserPreference) => void
] => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getSession = useSessionContext((c) => c && c.getSession)
  const queryClient = useQueryClient()

  const prefsRes = useDocument<UserPreference>('user_preference', {
    enabled: !isPublicAccount(),
    ...options,
  })
  const groupRes = useDocument<Group>(getSession()?.publicAccount?._id, {
    enabled: isPublicAccount(),
    ...options,
  })

  return [
    isPublicAccount() ? groupRes : prefsRes,
    isPublicAccount()
      ? () => null
      : (prefs: UserPreference) => {
          queryClient.setQueryData('user_preference', prefs)
        },
  ]
}