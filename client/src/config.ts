// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'sw99udhcnk'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

const callbackDomain = window && window.location.host === 'localhost:3000' ? 'http://localhost:3000' : 'https://www.imbibe.dev'

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-x19x8zbj.auth0.com',            // Auth0 domain
  clientId: '8nOu7Hds4wJveS39MddZCa9hQhhqKFV1',          // Auth0 client id
  callbackUrl: `${callbackDomain}/callback`
}
