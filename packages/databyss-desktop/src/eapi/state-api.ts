import { ipcRenderer } from 'electron'
import { StateData } from './handlers/state-handlers'

export const get = <K extends keyof StateData>(key: K) =>
  ipcRenderer.invoke('state-get', key) as Promise<StateData[K]>
export const set = <K extends keyof StateData>(key: K, value: StateData[K]) =>
  ipcRenderer.send('state-set', key, value)
