import { BrowserWindow, ipcMain } from 'electron'
import { mergeAnnotations } from '../../lib/annotations-parser'
import * as pdfjsParser from '../../lib/pdfjs-parser'
import { mediaPath } from './file-handlers'

declare const PDFVIEW_WINDOW_WEBPACK_ENTRY: string
declare const PDFVIEW_WINDOW_PRELOAD_WEBPACK_ENTRY: string

let resolvePdfPromise: (data: any) => void = null
let rejectPdfPromise: (err: any) => void = null
let pdfWindow: BrowserWindow = null

async function parsePdf(pdfPath: string) {
  console.log('[PDF] parsing', pdfPath)
  // const parsedData = await parse(path)
  pdfWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload:PDFVIEW_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
    },
    show: false
  })
  // const viewPath = path.resolve(__pdfview, 'index.html')
  //`file://${path.join(app.getAppPath(), 'pdfview/index.html')}`
  // console.log('[PDF] open window', viewPath)
  pdfWindow.webContents.openDevTools()
  let viewUrl = PDFVIEW_WINDOW_WEBPACK_ENTRY
  if (!viewUrl.endsWith('.html')) {
    viewUrl += '/'
  }
  await pdfWindow.loadURL(viewUrl)
  pdfWindow.webContents.send('pdf-loadInView', pdfPath)
  // console.log('[PDF] parsed', parsedData)
}

export function registerPdfHandlers() {
  ipcMain.handle('pdf-parse', (_, pdfPath) => {
    return new Promise((resolve, reject) => {
      resolvePdfPromise = resolve
      rejectPdfPromise = reject
      parsePdf(pdfPath)
    })
  })
  ipcMain.on('pdf-resolvePass1', async (_, firstPass) => {
    // console.log('[PDF] parse pass 1 results', firstPass)
    pdfWindow.close()
    try {
      const _pdfPath = firstPass.path.replace('dbdrive:/', mediaPath())
      const secondPassData = await pdfjsParser.parse(_pdfPath)
      const { metadata, annotations: secondPass } = secondPassData
      // console.log('[PDF] parse pass 2 results', secondPassData)
      const result = {
        metadata,
        annotations: mergeAnnotations(firstPass.data, secondPass),
      }
      // console.log('[PDF] merged results', result)
      resolvePdfPromise(result)
    } catch (e) {
      console.warn(`Second pass has failed: ${e.message}`, e.stack)
      rejectPdfPromise(e)
    }
  })
}
