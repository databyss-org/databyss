import { useQuery } from '@tanstack/react-query'
import { StateData } from '../eapi/handlers/state-handlers'
import { queryClient } from '@databyss-org/services/lib/queryClient'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export const useAppState = <K extends keyof StateData>(key: K) => {
  return useQuery<StateData[K]>({
    queryKey: [`appState_${key}`], 
    queryFn: () => eapi.state.get(key)
  })
}

eapi.state.onStateUpdated((key, value) => {
  queryClient.setQueryData([`appState_${key}`], value)
})
