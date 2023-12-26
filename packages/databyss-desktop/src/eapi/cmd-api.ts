import { ipcRenderer } from 'electron'

export type CommandName = 'undo' | 'redo' | 'find' | 'newPage'

export const onCommand = (
  callback: (commandName: CommandName, ...args: any[]) => void
) =>
  ipcRenderer.on('cmd-command', (_, commandName: CommandName, ...args: any[]) =>
    callback(commandName, ...args)
  )
