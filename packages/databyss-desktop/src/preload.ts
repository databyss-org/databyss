// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import eapi from './eapi'

// const platform = {
//   isMac: false,
//   isWindows: false,
//   isLinux: false,
// }

ipcRenderer.invoke('platform-os').then((os: string) => {
  eapi.platform.isMac = os === 'darwin'
  eapi.platform.isWindows = os === 'win32'
  eapi.platform.isLinux = os === 'linux'
  console.log('[pre] os', eapi.platform)
  contextBridge.exposeInMainWorld('eapi', eapi)
})
