import { useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Group } from '@databyss-org/services/interfaces'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvider'
import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'
import { upsertUserPreferences } from '../utils'

export const useUserPreferences = (
  options?: UseDocumentOptions
): [
  UseQueryResult<UserPreference | Group>,
  (prefs: UserPreference) => void
] => {
  const groupId = useDatabaseContext((c) => c && c.groupId)
  const queryClient = useQueryClient()

  // console.log('[useUserPreferences] groupId', groupId)

  const prefsRes = useDocument<UserPreference>('user_preference', {
    enabled: groupId !== null,
    ...options,
  })

  return [
    prefsRes,
    (prefs: UserPreference) => {
      queryClient.setQueryData(['user_preference'], prefs)
      upsertUserPreferences(prefs)
    },
  ]
}
