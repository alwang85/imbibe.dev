import * as React from 'react'
import { Button } from 'semantic-ui-react'

import { AuthWrapper } from '../context/auth0-context';

interface LogInProps {
  loginWithRedirect: any
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.loginWithRedirect()
  }

  render() {
    return (
      <div>
        <h1>Please log in</h1>

        <Button onClick={this.onLogin} size="huge" color="olive">
          Log in
        </Button>
      </div>
    )
  }
}

export const WrappedLogIn = AuthWrapper(LogIn);