import { useQueryClient, UseQueryResult } from 'react-query'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Group } from '@databyss-org/services/interfaces'
import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'
import { upsertUserPreferences } from '../utils'

export const useUserPreferences = (
  options?: UseDocumentOptions
): [
  UseQueryResult<UserPreference | Group>,
  (prefs: UserPreference) => void
] => {
  const isGroupSession =
    useSessionContext((c) => c && c.isGroupSession) ?? (() => false)
  const getSession = useSessionContext((c) => c && c.getSession) ?? (() => null)
  const queryClient = useQueryClient()

  const prefsRes = useDocument<UserPreference>('user_preference', {
    enabled: !isGroupSession(),
    ...options,
  })
  const groupRes = useDocument<Group>(getSession()?.publicAccount?._id, {
    enabled: isGroupSession(),
    ...options,
  })

  return [
    isGroupSession() ? groupRes : prefsRes,
    isGroupSession()
      ? () => null
      : (prefs: UserPreference) => {
          queryClient.setQueryData('user_preference', prefs)
          upsertUserPreferences(() => prefs)
        },
  ]
}
