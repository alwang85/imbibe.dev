// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '5j5yvqrxzf'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-x19x8zbj.auth0.com',            // Auth0 domain
  clientId: 'FFGzLjCTMke8Du9cT431tIL1amS18mUR',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
