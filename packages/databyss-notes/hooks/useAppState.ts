import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { StateData, appState } from './appState'

let queryClient: QueryClient | null = null

export const useAppState = <K extends keyof StateData>(key: K) => {
  const _qc = useQueryClient()
  if (!queryClient) {
    queryClient = _qc
    appState.on('valueChanged', (key) => {
      console.log('[useAppState] valueChanged', key, appState.get(key))
      queryClient!.setQueryData([`appState_${key}`], appState.get(key))
    })
  }
  return useQuery<StateData[K]>({
    queryKey: [`appState_${key}`],
    queryFn: () => appState.get(key),
  })
}
