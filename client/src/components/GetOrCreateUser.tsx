import React, { Component } from 'react'

import Auth from '../auth/Auth'
import UserContext from '../context/userContext';
import { getUser, createUser } from '../api/users-api'
import { User, emptyUser } from '../types/User'

export interface GetOrCreateUserProps {
  auth: Auth
  isInitialAuthenticatedLoad: boolean
  setUser: (user: User) => void
}

export interface GetOrCreateUserState {
  user: User
}

export default class GetOrCreateUser extends Component<GetOrCreateUserProps, GetOrCreateUserState> {
  constructor(props: GetOrCreateUserProps) {
    super(props)

    this.state = {
      user: emptyUser,
    }
  }

  async componentWillMount() {
    if (this.props.auth.isAuthenticated()) {
      console.log('app was authenticated')
      const idToken = this.props.auth.getIdToken();
      const userId = this.props.auth.getUserId();
      // const userInfo = this.props.auth.getUserInfo();
      try {
        const currentUser = await getUser(idToken, userId);
        console.log('existing user', currentUser);
        if(this.props.isInitialAuthenticatedLoad) {
          if (!currentUser) {
            const newUser = await createUser(idToken, { userId })
            this.props.setUser(newUser)
          } else {
            this.props.setUser(currentUser)
          }
        }
      } catch(err) {
        console.log('error in user creation')
      }

    } else {
      console.log('not authenticated')
    }
  }

  render() {
    return null
  }
}
