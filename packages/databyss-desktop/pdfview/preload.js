import { contextBridge } from 'electron'
import eapi from '../src/eapi'

console.log('[pre] pdfview')
contextBridge.exposeInMainWorld('eapi', eapi)
