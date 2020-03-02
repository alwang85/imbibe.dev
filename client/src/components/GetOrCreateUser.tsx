import React, { Component } from 'react'

import Auth from '../auth/Auth'

import { getUser, createUser } from '../api/users-api'

export interface GetOrCreateUserProps {
  auth: Auth
}

export interface GetOrCreateUserState {}

export default class GetOrCreateUser extends Component<GetOrCreateUserProps, GetOrCreateUserState> {
  constructor(props: GetOrCreateUserProps) {
    super(props)
  }

  async componentWillMount() {
    console.log('app mounting')
    if (this.props.auth.isAuthenticated()) {
      console.log('app was authenticated')
      const idToken = this.props.auth.getIdToken();
      const userId = this.props.auth.getUserId();
      try {
        const currentUser = await getUser(idToken, userId);
        if (!currentUser) {
          await createUser(idToken, { userId })
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
