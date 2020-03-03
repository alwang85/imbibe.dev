import React from 'react';
import { User } from '../types/User';

const UserContext = React.createContext({
  user: {},
  setUser: (user: User) => {}
});

export default UserContext;

export const UserWrapper = (WrappedComponent: any) => {
  return (props: any) => (
    <UserContext.Consumer>
      {(contextProps) => (
        <WrappedComponent {...props} {...contextProps} />
      )}
    </UserContext.Consumer>
  )
}