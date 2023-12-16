import { useQuery } from '@tanstack/react-query'
import { StateData } from '../eapi/handlers/state-handlers'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export const useAppState = <K extends keyof StateData>(key: K) => {
  return useQuery<StateData[K]>([`appState_${key}`], () => eapi.state.get(key))
}
