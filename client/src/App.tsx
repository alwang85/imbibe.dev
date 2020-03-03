import React, { Component } from 'react'
import { Link, Route, Router, Switch, Redirect } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import Nav from './components/Nav';
import { NotFound } from './components/NotFound'
import { Items } from './components/Items'
import { LogIn } from './components/LogIn'
import { Profile } from './components/Profile'
import UserContext from './context/userContext'
import { User, emptyUser } from './types/User';
import GetOrCreateUser from './components/GetOrCreateUser';

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  user: User,
  setUser: (user: User) => void,
  isInitialAuthenticatedLoad: boolean,
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.setUser = this.setUser.bind(this)

    this.state = {
      user: emptyUser as User,
      setUser: this.setUser,
      isInitialAuthenticatedLoad: true,
    };
  }

  setUser = (user: User) => {
    console.log('user in setUser', user)
    if(this.state.isInitialAuthenticatedLoad) {
      this.setState({
        user: {
          ...user,
        } as User,
        isInitialAuthenticatedLoad: false
      });
    }
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
                    {this.generateCurrentPage()}
                  </React.Fragment>
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateCurrentPage() {
    const unAuthSwitch = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <NotFound />
          }}
        />
        <Route component={NotFound} />
      </Switch>
    );

    const authSwitch = (
      <UserContext.Provider value={this.state} >
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
              return (
                <React.Fragment>
                  <Items {...props} auth={this.props.auth} />
                </React.Fragment>
              )
            }}
          />
          <Route path="/login" exact><LogIn auth={this.props.auth}/></Route>

          {/* <Route path="/public/:nickname">
            <PublicProfileComponent />
          </Route> */}
          <PrivateRoute path="/dashboard" auth={this.props.auth}>
            <Items auth={this.props.auth} />
          </PrivateRoute>
          <PrivateRoute path="/profile" auth={this.props.auth}>
            <Profile auth={this.props.auth} />
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
