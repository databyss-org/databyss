import { BrowserWindow, Menu, app } from 'electron'
import {
  closeDatabyss,
  importDatabyssFile,
} from './eapi/handlers/file-handlers'

const template: Parameters<typeof Menu.buildFromTemplate>[0] = [
  // APP MENU
  // {
  //   id: 'app-menu',
  //   label: 'Databyss',
  //   submenu: [
  //     {
  //       id: 'macos-about',
  //       label: 'About Databyss',
  //       role: 'about',
  //     },
  //   ],
  // },
  // FILE MENU
  {
    id: 'file-menu',
    label: 'File',
    submenu: [
      {
        label: 'New page',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.send(
            'cmd-command',
            'newPage'
          )
        },
      },
      {
        label: 'Close Databyss',
        click: closeDatabyss,
      },
      {
        label: 'Import Databyss',
        click: importDatabyssFile,
      },
    ],
  },
  // EDIT MENU
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        // role: 'undo',
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.undo()
          BrowserWindow.getFocusedWindow().webContents.send(
            'cmd-command',
            'undo'
          )
        },
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        // role: 'redo',
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.redo()
          BrowserWindow.getFocusedWindow().webContents.send(
            'cmd-command',
            'redo'
          )
        },
      },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
      { type: 'separator' },
      {
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.send(
            'cmd-command',
            'find'
          )
        },
      },
    ],
  },
  // VIEW MENU
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        },
      },
      {
        type: 'separator',
      },
      {
        role: 'resetZoom',
      },
      {
        role: 'zoomIn',
      },
      {
        role: 'zoomOut',
      },
      {
        type: 'separator',
      },
      {
        role: 'togglefullscreen',
      },
    ],
  },
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        role: 'hide',
      },
      {
        role: 'hideOthers',
      },
      {
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        role: 'quit',
      },
    ],
  })
}

export function createMenus() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
