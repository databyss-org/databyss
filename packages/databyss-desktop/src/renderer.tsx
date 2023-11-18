import React from 'react'
import ReactDOM from 'react-dom'
import {
  NavigationProvider,
  BrowserRouter,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { App } from './app/App'
import { connect, vouchDbRef } from '@databyss-org/data/vouchdb/vouchdb'

ReactDOM.render(
  <ThemeProvider>
    <BrowserRouter>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
)

// eapi.db.info().then((info) => console.log(info))
// eapi.db.allDocs().then((docs) => console.log(docs.total_rows))

connect()
vouchDbRef.current.info().then((info) => console.log(info))
vouchDbRef.current.allDocs().then((docs) => console.log(docs.total_rows))
