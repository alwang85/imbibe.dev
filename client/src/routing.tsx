import React from 'react'
import { Router, Route } from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import { Auth0Provider, AuthWrapper } from './context/auth0-context';
import App from './App';
const history = createHistory()

const WrappedApp = AuthWrapper(App)

export const makeAuthRouting = () => {
  return (
    <Auth0Provider>
      <Router history={history}>
        <div>
          <Route
            render={props => {
              return (
                <WrappedApp {...props} />
              )
            }}
          />
        </div>
      </Router>
    </Auth0Provider>
  )
}
