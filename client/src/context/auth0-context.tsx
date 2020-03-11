// sourced from auth0 blog, https://auth0.com/blog/modern-full-stack-development-with-nestjs-react-typescript-and-mongodb-part-2/#Creating-an-Auth0-Single-Page-Application

import React, { Component, createContext, useContext } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js';
import { authConfig } from '../config'

interface ContextValueType {
  isAuthenticated?: boolean,
  userInfo?: any,
  isLoading?: boolean,
  idToken: string,
  userId: string,
  handleRedirectCallback?: () => void,
  getIdTokenClaims?: (...p: any) => any,
  loginWithRedirect?: (...p: any) => any,
  getTokenSilently?: (...p: any) => any,
  logout?: (...p: any) => any,
}

// create the context
export const Auth0Context: any = createContext<ContextValueType | null>(null);
export const useAuth0: any = () => useContext(Auth0Context);
interface IState {
  auth0Client: any,
  isLoading: boolean,
  isAuthenticated: boolean,
  userInfo?: any,
  idToken: string,
  userId: string,
}
export class Auth0Provider extends Component<{}, IState> {
  constructor(props: any) {
    super(props)
    this.state = {
      isLoading: true,
      isAuthenticated: false,
      userInfo: null,
      auth0Client: Auth0Client,
      idToken: "",
      userId: "",
    };
  }
  config: Auth0ClientOptions = {
    domain: authConfig.domain,
    client_id: authConfig.clientId,
    redirect_uri: authConfig.callbackUrl
  };
  componentDidMount() {
      this.initializeAuth0();     
  }
  // initialize the auth0 library
  initializeAuth0 = async () => {
    const auth0Client = await createAuth0Client(this.config);
    this.setState({ auth0Client });
    // check to see if they have been redirected after login
    if (window.location.search.includes('code=')) {
        return this.handleRedirectCallback();
    }
    const isAuthenticated = await auth0Client.isAuthenticated();
    const userInfo = isAuthenticated ? await auth0Client.getUser() : null;
    const token = isAuthenticated ? await this.state.auth0Client.getTokenSilently() : null;
    const idTokenClaims = isAuthenticated ? await this.state.auth0Client.getIdTokenClaims() : null;
    const idToken = isAuthenticated && idTokenClaims ? idTokenClaims.__raw : null;
    const userId = userInfo ? userInfo.sub : null;
    this.setState({ isLoading: false, isAuthenticated, userInfo, idToken, userId });
  };

  handleRedirectCallback = async () => {
    this.setState({ isLoading: true });
    await this.state.auth0Client.handleRedirectCallback();
    const userInfo = await this.state.auth0Client.getUser();
    const token = await this.state.auth0Client.getTokenSilently();
    const idTokenClaims = await this.state.auth0Client.getIdTokenClaims();
    const idToken = idTokenClaims.__raw;
    const userId = userInfo ? userInfo.sub : null;

    this.setState({ userInfo, isAuthenticated: true, isLoading: false , idToken, userId});
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  render() {
    const { auth0Client, isLoading, isAuthenticated, userInfo, idToken, userId } = this.state;
    const { children } = this.props;
    const configObject = {
        idToken,
        userId,
        isLoading,
        isAuthenticated,
        userInfo,
        loginWithRedirect: (...p: any) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p: any) => auth0Client.getTokenSilently(...p),
        getIdTokenClaims: (...p: any) => auth0Client.getIdTokenClaims({
          ...p,
          returnTo: this.config.callbackUrl,
        }),
        logout: (...p: any) => auth0Client.logout({
          ...p,
          returnTo: this.config.callbackUrl,
        })
    };
    return <Auth0Context.Provider value={configObject}>{children}</Auth0Context.Provider>;
  }
}

export const AuthWrapper = (WrappedComponent: any) => {
  return (props: any) => (
    <Auth0Context.Consumer>
      {(contextProps: any) => (
        <WrappedComponent {...props} {...contextProps} />
      )}
    </Auth0Context.Consumer>
  )
}