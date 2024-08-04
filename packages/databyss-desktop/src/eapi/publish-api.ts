import { ipcRenderer } from 'electron'
import { PublishingStatus } from './handlers/publish-handlers'
import { RemoteDbInfo } from '@databyss-org/services/session/utils'

export const publishGroup = (groupId: string, statusId: string) =>
  ipcRenderer.invoke('publish-group', groupId, statusId)

export const unpublishGroup = (groupId: string) =>
  ipcRenderer.invoke('publish-removeGroup', groupId)

export const cancelPublishGroup = (statusId: string) =>
  ipcRenderer.invoke('publish-cancel', statusId)

export const getPublishingStatus = (statusId: string) =>
  ipcRenderer.invoke('publish-getStatus', statusId)

export const onStatusUpdated = (
  callback: (statusId: string, status: PublishingStatus) => void
) =>
  ipcRenderer.on('publish-statusUpdated', (_, statusId, status) =>
    callback(statusId, status)
  )
