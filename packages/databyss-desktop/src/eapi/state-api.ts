import { ipcRenderer } from 'electron'
import { StateData } from './handlers/state-handlers'

export const onStateUpdated = (
  callback: <K extends keyof StateData>(key: K, value: StateData[K]) => void
) => ipcRenderer.on('state-updated', (_, key, value) => callback(key, value))

export const get = <K extends keyof StateData>(key: K) =>
  ipcRenderer.invoke('state-get', key) as Promise<StateData[K]>
export const set = <K extends keyof StateData>(key: K, value: StateData[K]) =>
  ipcRenderer.send('state-set', key, value)
