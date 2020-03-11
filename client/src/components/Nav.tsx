import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import { AuthWrapper } from '../context/auth0-context';
import { UserWrapper } from '../context/userContext';
import { User } from '../types/User';

export interface NavProps {}

export interface NavProps {
  history: any
  // the following comes from user HoC
  user: User,
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
    const { isAuthenticated, user: { isProfilePublic = false, displayName= ''} = {} } = this.props;

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

            </React.Fragment>
          )
        }
        <Menu.Menu position="right">
          {
            isAuthenticated && isProfilePublic && (
              <Menu.Item name="publicProfile">
                <Link to={`/public/${displayName}`}>Your Public Profile</Link>
              </Menu.Item>
            )
          }
          {
            isAuthenticated && (
              <Menu.Item name="profile">
                <Link to="/profile">Profile</Link>
              </Menu.Item>
            )
          }
          {this.logInLogOutButton()}
        </Menu.Menu>
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
          Log In / Register
        </Menu.Item>
      )
    }
  }
}

export const WrappedNav = UserWrapper(AuthWrapper(Nav));