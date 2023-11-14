import React from 'react'
import ReactDOM from 'react-dom'
import {
  NavigationProvider,
  BrowserRouter,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { App } from './app/App'

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

console.log('👋 This message is being logged')

eapi.db.info().then((info) => console.log(info))
eapi.db.allDocs().then((docs) => console.log(docs.total_rows))
// ipcRenderer.invoke('db-info').then((info) => console.log(info))
// ipcRenderer.invoke('db-allDocs').then((docs) => console.log(docs))
