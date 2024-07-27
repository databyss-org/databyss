import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { StateData, appState } from './appState'

export const useAppState = <K extends keyof StateData>(key: K) =>
  useQuery<StateData[K]>({
    queryKey: [`appState_${key}`],
    queryFn: () => appState.get(key),
  })

appState.on('valueChanged', (key) => {
  queryClient.setQueryData([`appState_${key}`], appState.get(key))
})
