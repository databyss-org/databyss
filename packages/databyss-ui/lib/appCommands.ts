import { EventEmitter } from 'events'
import { CommandName } from '@databyss-org/desktop/src/eapi/cmd-api'

export class AppCommands {
  private _eventEmitter: EventEmitter

  constructor() {
    this._eventEmitter = new EventEmitter()
  }

  addListener(commandName: CommandName, cb: (...args: any[]) => void) {
    this._eventEmitter.addListener(commandName, cb)
  }

  removeListener(commandName: CommandName, cb: (...args: any[]) => void) {
    this._eventEmitter.removeListener(commandName, cb)
  }

  dispatch(commandName: CommandName, ...args: any[]) {
    this._eventEmitter.emit(commandName, ...args)
  }
}

export const appCommands = new AppCommands()
