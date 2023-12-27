import { Group } from '@databyss-org/services/interfaces'
import { sidebar } from '@databyss-org/ui/theming/components'
import { BrowserWindow, app, ipcMain } from 'electron'
import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'

const statePath = path.join(app.getPath('userData'), 'state.json')

export interface StateData {
  localGroups: Group[]
  /**
   * Should represent the last group loaded. This group will be loaded by default
   * the next time the app is run. In a multiwindow situation, it should be the
   * group in the window that last received focus.
   */
  lastActiveGroupId: string | null
  lastRoute: string
  lastSidebarRoute: string
  sidebarWidth: number
  sidebarVisible: boolean
  dataPath: string
}

const defaultData: Partial<StateData> = {
  sidebarWidth: sidebar.width,
  sidebarVisible: true,
  dataPath: app.getPath('userData'),
}

class State extends EventEmitter {
  private data: Partial<StateData> = {}
  get<K extends keyof StateData>(key: K) {
    return (this.data[key] as StateData[K]) ?? defaultData[key]
  }
  set<K extends keyof StateData>(key: K, value: StateData[K]) {
    // console.log('[State] set', key, value)
    this.data[key] = value
    fs.writeFileSync(statePath, JSON.stringify(this.data, null, 2))
    this.emit('valueChanged', key)
    BrowserWindow.getFocusedWindow().webContents.send(
      'state-updated',
      key,
      value
    )
  }

  constructor() {
    super()
    if (fs.existsSync(statePath)) {
      const buf = fs.readFileSync(statePath)
      this.data = JSON.parse(buf.toString())
    } else {
      this.data = defaultData
    }
  }
}

export const appState = new State()

export function registerStateHandlers() {
  ipcMain.handle('state-get', (_, key) => appState.get(key))
  ipcMain.on('state-set', (_, key, value) => appState.set(key, value))
}
