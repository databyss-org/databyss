import { BrowserWindow, Menu, app } from 'electron'
import { closeDatabyss, onImportDatabyss } from './eapi/handlers/file-handlers'

const fwc = () => BrowserWindow.getFocusedWindow()?.webContents

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
          fwc().send(
            'cmd-command',
            'newPage'
          )
        },
      },
      {
        label: 'New collection',
        accelerator: 'CmdOrCtrl+G',
        click: () => {
          fwc().send(
            'cmd-command',
            'newGroup'
          )
        },
      },
      { type: 'separator' },
      { 
        label: 'Export',
        submenu: [
          {
            id: 'export-page-as-markdown',
            label: 'Page as Markdown...',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportPageAsMarkdown'
              )
            },
            enabled: fwc()?.getURL().includes('/pages/')
          },
          {
            label: 'Bibliography...',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportBibliography'
              )
            },
          },
          {
            label: 'Everything as Markdown...',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportAllAsMarkdown'
              )
            },
          },
          {
            label: 'Database..',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportDatabase'
              )
            },
          },
        ]
      },
      {
        label: 'Import Databyss',
        click: onImportDatabyss,
      },
      {
        label: 'Close Databyss',
        click: closeDatabyss,
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
          fwc().undo()
          fwc().send(
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
          fwc().redo()
          fwc().send(
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
          fwc().send(
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
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return menu
}
