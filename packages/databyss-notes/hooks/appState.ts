import { sidebar } from '@databyss-org/ui/theming/components'
import { EventEmitter } from 'events'

const stateKey = 'databyss_appstate'

export interface StateData {
  lastRoute: string
  lastSidebarRoute: string
  sidebarWidth: number
  sidebarVisible: boolean
  darkMode: boolean
}

const defaultData: Partial<StateData> = {
  sidebarWidth: sidebar.width,
  sidebarVisible: true,
}

class State extends EventEmitter {
  private data: Partial<StateData> = {}
  get<K extends keyof StateData>(key: K) {
    return (this.data[key] as StateData[K]) ?? defaultData[key]
  }
  set<K extends keyof StateData>(key: K, value: StateData[K]) {
    // console.log('[State] set', key, value)
    this.data[key] = value
    localStorage.setItem(stateKey, JSON.stringify(this.data))
    this.emit('valueChanged', key)
  }

  constructor() {
    super()
    const _storedState = localStorage.getItem(stateKey)
    if (_storedState) {
      this.data = JSON.parse(_storedState)
    } else {
      this.data = defaultData
    }
  }
}

export const appState = new State()
