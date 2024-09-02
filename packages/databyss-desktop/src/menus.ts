import { BrowserWindow, Menu, app, MenuItem } from 'electron'
import { createWindow } from './'
import { CommandArgs, CommandName } from './eapi/cmd-api'
import { closeDatabyss, exportDbToZip } from './eapi/handlers/file-handlers'
import { appState } from './eapi/handlers/state-handlers'
import { nodeDbRefs } from './nodeDb'

const fwc = () => BrowserWindow.getFocusedWindow()?.webContents
const dbIsLoaded = () =>
  !!(BrowserWindow.getFocusedWindow()
    ? nodeDbRefs[BrowserWindow.getFocusedWindow().id]
    : null
  )?.groupId

export function sendCommandToBrowser<K extends keyof CommandArgs>(
  command: K,
  ...args: CommandArgs[K]
) {
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
        label: 'New Page',
        id: 'new-page',
        enabled: dbIsLoaded(),
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          fwc().send('cmd-command', 'newPage')
        },
      },
      {
        label: 'New Collection',
        id: 'new-collection',
        accelerator: 'CmdOrCtrl+G',
        enabled: dbIsLoaded(),
        click: () => {
          fwc().send('cmd-command', 'newGroup')
        },
      },
      {
        label: 'New Window',
        accelerator: 'Shift+CmdOrCtrl+N',
        click: () => {
          createWindow()
        },
      },
      { type: 'separator' },
      {
        label: 'Export…',
        id: 'export-modal',
        enabled: dbIsLoaded(),
        click: () => {
          fwc().send('cmd-command', 'exportModal')
        },
      },
      {
        label: 'Import Databyss…',
        click: () => {
          fwc().send('cmd-command', 'importDatabase')
        },
      },
      {
        label: 'Close Databyss',
        id: 'close-databyss',
        enabled: dbIsLoaded(),
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
          fwc().send('cmd-command', 'undo')
        },
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        // role: 'redo',
        click: () => {
          fwc().redo()
          fwc().send('cmd-command', 'redo')
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
          fwc().send('cmd-command', 'find')
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
        },
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
        role: 'minimize',
      },
      {
        role: 'close',
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

function registerWindowEvents(win: BrowserWindow, menu: Menu) {
  function updateMenuItemsAvailable() {
    menu.getMenuItemById('export-modal').enabled = dbIsLoaded()
    menu.getMenuItemById('new-page').enabled = dbIsLoaded()
    menu.getMenuItemById('new-collection').enabled = dbIsLoaded()
    menu.getMenuItemById('close-databyss').enabled = dbIsLoaded()
  }
  win.webContents.addListener('did-navigate-in-page', updateMenuItemsAvailable)
  win.webContents.addListener('did-create-window', updateMenuItemsAvailable)

  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()

    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(
        new MenuItem({
          label: suggestion,
          click: () => win.webContents.replaceMisspelling(suggestion),
        })
      )
    }

    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () =>
            win.webContents.session.addWordToSpellCheckerDictionary(
              params.misspelledWord
            ),
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
