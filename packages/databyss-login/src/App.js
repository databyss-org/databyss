import React from 'react'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Login from '@databyss-org/ui/modules/Login/Login'
import {
  registerWithEmail,
  checkToken,
  setGoogleAuthToken,
  checkCode,
} from './actions'

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Router>
          <div>
            <div style={{ height: '90vh' }}>
              <Route
                exact
                path="/login/"
                render={() => (
                  <Login
                    registerWithEmail={registerWithEmail}
                    checkToken={checkToken}
                    setGoogleAuthToken={setGoogleAuthToken}
                    checkCode={checkCode}
                  />
                )}
              />
            </div>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
