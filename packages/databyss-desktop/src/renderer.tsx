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
  console.log('[App] IPC db-onGroupLoaded', groupId)
  // setGroupId(groupId)
  connect(groupId)
  dbRef.current.info().then((info) => console.log(info))
  dbRef.current.allDocs().then((docs) => console.log(docs?.total_rows))
})
// eapi.db.info().then((info) => console.log(info))
// eapi.db.allDocs().then((docs) => console.log(docs.total_rows))
