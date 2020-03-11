import * as React from 'react'
import { Button } from 'semantic-ui-react'
import get from 'lodash/get';

import { AuthWrapper } from '../context/auth0-context';

interface LogInProps {
  isAuthenticated: boolean,
  location: any,
  loginWithRedirect: any
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.loginWithRedirect()
  }

  render() {
    // const origin = get(window, 'location.origin');
    // const previousPath = get(this.props.location, 'state.from.pathname');
    // const redirectObj = {
    //   redirect_uri: `${origin}${previousPath}`,
    // };
    // console.log('redirectObj', redirectObj)
    return (
      <div>
        <h1>Please log in</h1>

        <Button onClick={() => this.onLogin()} size="huge" color="olive">
          Log in
        </Button>
      </div>
    )
  }
}

export const WrappedLogIn = AuthWrapper(LogIn);