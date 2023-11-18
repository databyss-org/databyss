import { ipcRenderer } from 'electron'

export const open = () => ipcRenderer.invoke('file-open')
