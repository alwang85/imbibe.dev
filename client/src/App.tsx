import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'

import Nav from './components/Nav';
import { NotFound } from './components/NotFound'
import { Items } from './components/Items'
import GetOrCreateUser from './components/GetOrCreateUser';

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
  }

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
            return <Items {...props} auth={this.props.auth} />
          }}
        />
        <Route component={NotFound} />
      </Switch>
    );

    const authSwitch = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return (
              <React.Fragment>
                <GetOrCreateUser {...props} auth={this.props.auth}/>
                <Items {...props} auth={this.props.auth} />
              </React.Fragment>
            )
          }}
        />
        <Route component={NotFound} />
      </Switch>
    )

    return this.props.auth.isAuthenticated() ? authSwitch : unAuthSwitch
  }
}
