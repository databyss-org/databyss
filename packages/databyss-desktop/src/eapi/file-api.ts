import { ipcRenderer } from 'electron'

export const open = () => ipcRenderer.invoke('file-open')
export const importDatabyss = () =>
  ipcRenderer.invoke('file-importDatabyss') as Promise<boolean>
