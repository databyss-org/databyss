import React from 'react'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { checkToken } from './actions'
import Header from './header'
import Body from './body'
import Login from './body/Login'
import Register from './body/Register'

if (localStorage.token) {
  const token = localStorage.getItem('token')
  checkToken(token)
}

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Router>
          <Header />
          <div>
            <div>
              <Route exact path="/" component={Body} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
            </div>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
