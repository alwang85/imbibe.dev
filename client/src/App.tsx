import React, { Component } from 'react'
import { Link, Route, Router, Switch, Redirect } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import { WrappedNav } from './components/Nav';
import { NotFound } from './components/NotFound'
import { WrappedItems } from './components/Items'
import { WrappedLogIn } from './components/LogIn'
import { WrappedProfile } from './components/Profile'
import { WrappedPublicItems } from './components/PublicItems'
import UserContext from './context/userContext'
import LayoutContext from './context/layoutContext'
import { User, emptyUser } from './types/User';
import { Item } from './types/Item'
import { WrappedGetOrCreateUser } from './components/GetOrCreateUser';

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
    // console.log('user in setUser', user)
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
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  <React.Fragment>
                    <WrappedNav history={this.props.history} />
                    <LayoutContext.Provider value={this.state.layoutState}>
                      {this.generateCurrentPage()}
                    </LayoutContext.Provider>
                  </React.Fragment>
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  getPublicRoute = () => (
    <Route
      path="/public/:displayName"
      children={({ match }) => (
        <WrappedPublicItems 
          history={this.props.history}
          match={match}
        />
      )}
    />
  )

  generateCurrentPage() {
    const unAuthSwitch = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            // TODO update to a neighberhood friendly welcome
            return <NotFound />
          }}
        />
        { this.getPublicRoute() }
        <Route component={NotFound} />
      </Switch>
    );

    const authSwitch = (
      <UserContext.Provider value={this.state.userState} >
        <WrappedGetOrCreateUser
          setUser={this.setUser}
          isInitialAuthenticatedLoad={this.state.isInitialAuthenticatedLoad}
        />
        <Switch>
          <Route
            path="/"
            exact
            render={props => {
              // TODO figure out a behavior
              return (
                <React.Fragment>
                  <WrappedItems {...props} setLayout={this.setLayout}/>
                </React.Fragment>
              )
            }}
          />
          <Route path="/login" exact><WrappedLogIn /></Route>

          { this.getPublicRoute() }
          
          <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/dashboard">
            <WrappedItems setLayout={this.setLayout}/>
          </PrivateRoute>
          <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/profile">
            <WrappedProfile />
          </PrivateRoute>
          <Route component={NotFound} />
        </Switch>
      </UserContext.Provider>
    )
    // isAuthenticated is the first call in auth0-context.tsx, idToken is the response of the second call
    return this.props.isAuthenticated && this.props.idToken ? authSwitch : unAuthSwitch
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
