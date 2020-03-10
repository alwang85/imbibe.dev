import React, { Component } from 'react'

import { AuthWrapper } from '../context/auth0-context';
import { getUser, createUser } from '../api/users-api'
import { User } from '../types/User'

export interface GetOrCreateUserProps {
  isInitialAuthenticatedLoad: boolean
  // the below comes from AuthWrapper HoC
  setUser: (user: User) => void
  isAuthenticated?: boolean,
  idToken: string,
  userId: string,
}

export interface GetOrCreateUserState {
}

export default class GetOrCreateUser extends Component<GetOrCreateUserProps, GetOrCreateUserState> {
  constructor(props: GetOrCreateUserProps) {
    super(props)
  }

  async componentWillMount() {
    if (this.props.isAuthenticated) {
      console.log('app was authenticated')
      const { idToken, userId } = this.props;
      
      try {
        const currentUser = await getUser(idToken, userId);
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

export const WrappedGetOrCreateUser = AuthWrapper(GetOrCreateUser);