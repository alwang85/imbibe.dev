import React, { Component } from 'react'
import { Link, Route, Router, Switch, Redirect } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import Nav from './components/Nav';
import { NotFound } from './components/NotFound'
import { WrappedItems } from './components/Items'
import { LogIn } from './components/LogIn'
import { Profile } from './components/Profile'
import { WrappedPublicItems } from './components/PublicItems'
import UserContext from './context/userContext'
import LayoutContext from './context/layoutContext'
import { User, emptyUser } from './types/User';
import { Item } from './types/Item'
import GetOrCreateUser from './components/GetOrCreateUser';

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
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
    console.log('user in setUser', user)
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
                    <Nav auth={this.props.auth} history={this.props.history} />
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
          auth={this.props.auth}
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
        <GetOrCreateUser
          auth={this.props.auth}
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
                  <WrappedItems {...props} auth={this.props.auth} setLayout={this.setLayout}/>
                </React.Fragment>
              )
            }}
          />
          <Route path="/login" exact><LogIn auth={this.props.auth}/></Route>

          { this.getPublicRoute() }
          
          <PrivateRoute path="/dashboard" auth={this.props.auth}>
            <WrappedItems auth={this.props.auth} setLayout={this.setLayout}/>
          </PrivateRoute>
          <PrivateRoute path="/profile" auth={this.props.auth}>
            <Profile auth={this.props.auth} setUser={this.setUser} />
          </PrivateRoute>
          <Route component={NotFound} />
        </Switch>
      </UserContext.Provider>
    )

    return this.props.auth.isAuthenticated() ? authSwitch : unAuthSwitch
  }
}

// @ts-ignore
function PrivateRoute({ children, auth, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuthenticated() ? (
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
