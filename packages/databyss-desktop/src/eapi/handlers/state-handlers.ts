import { Group } from '@databyss-org/services/interfaces'
import { app, ipcMain } from 'electron'
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
  lastActiveGroupId: string
}

class State extends EventEmitter {
  private data: Partial<StateData> = {}
  get<K extends keyof StateData>(key: K) {
    return this.data[key] as StateData[K]
  }
  set<K extends keyof StateData>(key: K, value: StateData[K]) {
    this.data[key] = value
    fs.writeFileSync(statePath, JSON.stringify(this.data))
    this.emit('valueChanged', key)
  }

  constructor() {
    super()
    if (fs.existsSync(statePath)) {
      const buf = fs.readFileSync(statePath)
      this.data = JSON.parse(buf.toString())
    } else {
      this.data = {}
    }
  }
}

export const appState = new State()

export function registerStateHandlers() {
  ipcMain.handle('state-get', (_, key) => appState.get(key))
  ipcMain.handle('state-set', (_, key, value) => appState.set(key, value))
}
