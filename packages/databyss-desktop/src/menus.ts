import { BrowserWindow, Menu, app, MenuItem } from 'electron'
import { createWindow } from './'
import { CommandArgs, CommandName } from './eapi/cmd-api'
import { closeDatabyss, onImportDatabyss } from './eapi/handlers/file-handlers'
import { appState } from './eapi/handlers/state-handlers'

const fwc = () => BrowserWindow.getFocusedWindow()?.webContents

export function sendCommandToBrowser<K extends keyof CommandArgs>(command: K, ...args: CommandArgs[K]) {
  fwc().send('cmd-command', command, ...args)
}

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
      {
        label: 'New Window',
        accelerator: 'Shift+CmdOrCtrl+N',
        click: () => {
          createWindow()
        }
      },
      { type: 'separator' },
      { 
        label: 'Export',
        submenu: [
          {
            id: 'export-page-as-markdown',
            label: 'Page (Markdown)…',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportPageAsMarkdown'
              )
            },
            enabled: fwc()?.getURL().includes('/pages/')
          },
          {
            label: 'Bibliography (Markdown)…',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportBibliography'
              )
            },
          },
          {
            label: 'Everything (Markdown)…',
            click: () => {
              fwc().send(
                'cmd-command',
                'exportAllAsMarkdown'
              )
            },
          },
          {
            label: 'Database…',
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
        label: 'Import Databyss…',
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
        label: 'Dark mode',
        type: 'checkbox',
        checked: appState.get('darkMode'),
        click(item) {
          appState.set('darkMode', item.checked)
        }
      },
      {
        type: 'separator',
      },
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
  // WINDOW MENU
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  }
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

function registerWindowEvents(win: BrowserWindow, menu: Menu) {
  win.webContents.addListener('did-navigate-in-page', (event, url) => {
    // console.log('[Main] did-navigate-in-page', url)
    menu.getMenuItemById('export-page-as-markdown').enabled = 
      url.includes('/pages/')
  })
  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()
  
    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => win.webContents.replaceMisspelling(suggestion)
      }))
    }
  
    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }
    if (menu.items.length) {
      menu.popup()
    }
  })
}

export function createMenus(win: BrowserWindow) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  registerWindowEvents(win, menu)
  return menu
}
