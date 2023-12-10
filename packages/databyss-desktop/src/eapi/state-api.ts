import { ipcRenderer } from 'electron'

export const get = (key: string) => ipcRenderer.invoke('state-get', key)
export const set = (key: string, value: any) =>
  ipcRenderer.invoke('state-set', key)
