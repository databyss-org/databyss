import { ipcRenderer } from 'electron'

export const publishGroup = (groupId: string) =>
  ipcRenderer.invoke('publish-group', groupId)
