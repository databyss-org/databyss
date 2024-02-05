import { DialogOptions } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ipcRenderer } from 'electron'

export type CommandName = keyof CommandArgs

export interface CommandArgs {
  notify: [options: DialogOptions],
  hideNotify: [],
  undo: [],
  redo: [],
  find: [],
  newPage: [],
  newGroup: [],
  exportPageAsMarkdown: [],
  exportBibliography: [],
  exportAllAsMarkdown: [],
  exportDatabase: [],
}

export const onCommand = (
  callback: (commandName: CommandName, ...args: any[]) => void
) =>
  ipcRenderer.on('cmd-command', (_, commandName: CommandName, ...args: any[]) =>
    callback(commandName, ...args)
  )
