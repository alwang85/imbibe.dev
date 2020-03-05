import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'
import { AuthWrapper } from '../context/auth0-context';

export interface NavProps {}

export interface NavProps {
  history: any
  // sadly HOC's can't read the types by default, unlike hooks? Or so I recall 
  userInfo: any,
  loginWithRedirect: any,
  logout: any,
  isAuthenticated: any,
}

export interface NavState {}

export default class Nav extends Component<NavProps, NavState> {
  constructor(props: NavProps) {
    super(props)
  }

  render() {
    return (
      <div>
        {this.generateMenu()}
      </div>
    )
  }

  generateMenu() {
    const { isAuthenticated } = this.props;
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        { 
          isAuthenticated && (
            <React.Fragment>
              <Menu.Item name="dashboard">
                <Link to="/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item name="profile" position="right">
                <Link to="/profile">Profile</Link>
              </Menu.Item>
            </React.Fragment>
          )
        }
        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.userInfo) {
      return (
        <Menu.Item name="logout" onClick={this.props.logout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.props.loginWithRedirect}>
          Log In
        </Menu.Item>
      )
    }
  }
}

export const WrappedNav = AuthWrapper(Nav);