import React, { Component } from 'react'
import { Link, Route, Router, Switch, Redirect } from 'react-router-dom'
import { Grid, Segment, Dimmer, Loader, Image } from 'semantic-ui-react'

import { WrappedNav } from './components/Nav';
import { NotFound } from './components/NotFound'
import Homepage from './components/Homepage'
import { WrappedItems } from './components/Items'
import { WrappedLogIn } from './components/LogIn'
import { WrappedProfile } from './components/Profile'
import { WrappedPublicItems } from './components/PublicItems'
import UserContext from './context/userContext'
import LayoutContext from './context/layoutContext'
import { User, emptyUser } from './types/User';
import { Item } from './types/Item'
import { WrappedGetOrCreateUser } from './components/GetOrCreateUser';
import './App.css';

export interface AppProps {}

export interface AppProps {
  history: any,
  // the below comes from Auth Wrapper in routing.tsx
  isAuthenticated?: boolean
  idToken: string,
}

interface layoutItem {
  items: Item[],
  category: string
}

export interface AppState {
  userState: {
    user: User,
    setUser: (user: User) => void,
  },
  layoutState: {
    layout: layoutItem[],
    setLayout: (layoutArr: layoutItem[]) => void
  },
  isInitialAuthenticatedLoad: boolean,
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.setUser = this.setUser.bind(this)

    this.state = {
      userState: {
        user: emptyUser as User,
        setUser: this.setUser,
      },
      layoutState: {
        layout: [],
        setLayout: this.setLayout
      },
      isInitialAuthenticatedLoad: true,
    };
  }

  setUser = (user: User, forceUpdate?: boolean) => {
    if(this.state.isInitialAuthenticatedLoad || forceUpdate) {
      this.setState({
        userState: {
          ...this.state.userState,
          user,
        },
        isInitialAuthenticatedLoad: false
      });
    }
  };

  setLayout = (layoutArr: layoutItem[]) => {
    console.log('saving layout')
    this.setState({
      layoutState: {
        ...this.state.layoutState,
        layout: layoutArr,
      }
    });
  };

  render() {
    return (
      <div>
        <Segment style={{ padding: '4em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  <UserContext.Provider value={this.state.userState} >
                    <WrappedNav history={this.props.history} />
                    <LayoutContext.Provider value={this.state.layoutState}>
                      <main>
                        { this.props.isAuthenticated && this.props.idToken && (
                          <WrappedGetOrCreateUser
                            setUser={this.setUser}
                            isInitialAuthenticatedLoad={this.state.isInitialAuthenticatedLoad}
                          />
                        )}
                        <Switch>
                          <Route
                            path="/"
                            exact
                            component={Homepage}
                          />
                          <Route
                            path="/public/:displayName"
                            children={({ match }) => (
                              <WrappedPublicItems 
                                history={this.props.history}
                                match={match}
                              />
                            )}
                          />
                          <Route path="/login" exact
                            render={({ location }) => <WrappedLogIn location={location}/>}
                          />
                          <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/dashboard">
                            <WrappedItems setLayout={this.setLayout}/>
                          </PrivateRoute>
                          <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/profile">
                            <WrappedProfile />
                          </PrivateRoute>
                        </Switch>
                      </main>
                    </LayoutContext.Provider>
                  </UserContext.Provider>
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }
}

// @ts-ignore
function PrivateRoute({ children, isAuthenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
