# Serverless project implementaiton for udacity's cloud developer course

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

If trying to deploy to your own serverless instance, add some characters to the S3 bucket name in the serverless.yml file as they have to be unique.

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

Credentials for running your frontend against this project:

    const apiId = '5j5yvqrxzf'
    export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

    export const authConfig = {
      domain: 'dev-x19x8zbj.auth0.com',
      clientId: 'FFGzLjCTMke8Du9cT431tIL1amS18mUR',
      callbackUrl: 'http://localhost:3000/callback'
    }

JSON webkey url - https://dev-x19x8zbj.auth0.com/.well-known/jwks.json
