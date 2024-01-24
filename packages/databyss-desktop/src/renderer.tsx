import React from 'react'
import ReactDOM from 'react-dom'
import {
  NavigationProvider,
  HashRouter,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { App } from './app/App'
import { connect } from '@databyss-org/data/vouchdb/vouchdb'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { appCommands } from '@databyss-org/ui/lib/appCommands'

ReactDOM.render(
  <ThemeProvider>
    <HashRouter>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </HashRouter>
  </ThemeProvider>,
  document.getElementById('root')
)

eapi.db.onGroupLoaded((groupId) => {
  console.log('[App] IPC db-groupLoaded', groupId)
  // setGroupId(groupId)
  connect(groupId)
  dbRef.current.info().then((info) => console.log(info))
  // dbRef.current.allDocs().then((docs) => console.log(docs?.total_rows))
})
eapi.cmd.onCommand((commandName, ...args) => {
  // console.log('[App] IPC cmd-command', commandName, args)
  appCommands.dispatch(commandName, ...args)
})
// eapi.db.info().then((info) => console.log(info))
// eapi.db.allDocs().then((docs) => console.log(docs.total_rows))
