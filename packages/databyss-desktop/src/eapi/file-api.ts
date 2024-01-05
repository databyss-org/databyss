import { EmbedDetail } from '@databyss-org/services/interfaces/Block'
import { ipcRenderer } from 'electron'
import { IpcFile } from './handlers/file-handlers'

export const open = () => ipcRenderer.invoke('file-open')
export const importDatabyss = () =>
  ipcRenderer.invoke('file-importDatabyss') as Promise<boolean>
export const newDatabyss = () =>
  ipcRenderer.invoke('file-newDatabyss') as Promise<boolean>
export const archiveDatabyss = (groupId: string) =>
  ipcRenderer.invoke('file-archiveDatabyss', groupId) as Promise<string>
export const importMedia = async (
  file: File,
  fileId: string,
  renameTo?: string
) => {
  const ipcFile: IpcFile = {
    name: renameTo ?? file.name,
    type: file.type,
    buffer: await file.arrayBuffer(),
    path: file.path,
    lastModified: file.lastModified,
    size: file.size,
  }
  await ipcRenderer.invoke('file-importMedia', ipcFile, fileId)
}
export const renameMedia = async (fileId: string, renameTo: string): Promise<string> =>
  ipcRenderer.invoke('file-renameMedia', fileId, renameTo)
export const openNative = (path: string) =>
  ipcRenderer.send('file-openNative', path)
export const deleteMedia = (fileId: string) =>
  ipcRenderer.invoke('file-deleteMedia', fileId)
export const chooseDataPath = () => ipcRenderer.invoke('file-chooseDataPath')
export const getEmbedDetail = (urlOrHtml: string) => 
  ipcRenderer.invoke('file-getEmbedDetail', urlOrHtml) as Promise<EmbedDetail>