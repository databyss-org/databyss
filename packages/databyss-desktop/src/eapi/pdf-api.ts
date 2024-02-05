import { ipcRenderer } from "electron"

export const onLoadInView = (callback: (pdfPath: string) => void) =>
  ipcRenderer.on('pdf-loadInView', (_, pdfPath: string) => callback(pdfPath))

export const parse = (pdfPath: string) =>
  ipcRenderer.invoke('pdf-parse', pdfPath) as Promise<any>

export const resolvePass1 = (results: any) =>
  ipcRenderer.send('pdf-resolvePass1', results)