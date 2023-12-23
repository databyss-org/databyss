import { ipcRenderer } from 'electron'
import { IpcFile } from './handlers/file-handlers'

export const open = () => ipcRenderer.invoke('file-open')
export const importDatabyss = () =>
  ipcRenderer.invoke('file-importDatabyss') as Promise<boolean>
export const importMedia = async (file: File, fileId: string) => {
  const ipcFile: IpcFile = {
    name: file.name,
    type: file.type,
    buffer: await file.arrayBuffer(),
    path: file.path,
    lastModified: file.lastModified,
    size: file.size,
  }
  await ipcRenderer.invoke('file-importMedia', ipcFile, fileId)
}
