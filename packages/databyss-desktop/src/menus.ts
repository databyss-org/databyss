import { Menu } from 'electron'
import { importDatabyssFile } from './eapi/handlers/file-handlers'

export function createMenus() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      // APP MENU
      {
        id: 'app-menu',
        label: 'Databyss',
        submenu: [
          {
            id: 'macos-about',
            label: 'About Databyss',
            role: 'about',
          },
        ],
      },
      // FILE MENU
      {
        id: 'file-menu',
        label: 'File',
        submenu: [
          {
            id: 'menu.open',
            label: 'Open…',
            accelerator: 'Cmd+O',
            click: importDatabyssFile,
          },
        ],
      },
      // EDIT MENU
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectAll',
          },
        ],
      },
    ])
  )
}
