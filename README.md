# imbibe.dev
alwang85's Serverless project implementaiton for udacity's cloud developer course capstone project

[www.imbibe.dev](http://www.imbibe.dev) | 
[demo public profile](http://www.imbibe.dev/public/alwang85)


## Serverless Stack
* AWS Lambda + API Gateway for serverless http endpoints
* profile image upload to S3, with SNS Event notification of Lambda function to resize to thumbnail
* Cloudwatch log tracing
* iam roles defined per function in `serverless.yml`
* DynamoDB
  * nested items with a global secondary index
  * user items combined with Auth0 user profile response

## Frontend Stack
* Typescript application- first foray
* Retaining session on refresh- the course template authentication setup did not support SPA, so perhaps this is the only project in the course retaining session on refresh using an Auth0 approved methodology. [link to PR](https://github.com/alwang85/imbibe.dev/pull/13)
* React forms with nested items
* [Context api](https://github.com/alwang85/imbibe.dev/blob/master/client/src/App.tsx#L93-L95) to pass props via [HoC](https://github.com/alwang85/imbibe.dev/blob/master/client/src/components/Nav.tsx#L93)
* [private and public routes](https://github.com/alwang85/imbibe.dev/blob/master/client/src/App.tsx#L96-L123)
* state/layout updates after item crud
* added markdown editing for public profile
* profile form checks with the backend for unique displayName


## General
* serverside authentication to confirm session userId matches the posted path
* Cloudfront pointing to S3 bucket for custom domain name
* public accessable vs. authorization required for both frontend and backend routes/functions
* Generally clean and focused commits and pull requests based on intented functionality [link to PRs](https://github.com/alwang85/imbibe.dev/pulls?q=is%3Apr+is%3Aclosed)
* For new users on first Auth0 login, the app creates a User object on initial load [link to code](https://github.com/alwang85/imbibe.dev/blob/master/client/src/App.tsx#L97-L99)


## Deployment Instructions:

To deploy an application backend, first update `IMAGES_S3-BUCKET` and `THUMBNAILS_S3_BUCKET` to unique names inside of `/backend/serverless.yml`. Then run the following commands:

```
cd backend
npm install
sls deploy -v
```

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
      clientId: '8nOu7Hds4wJveS39MddZCa9hQhhqKFV1',
      callbackUrl: 'http://localhost:3000/callback'
    }

JSON webkey url - https://dev-x19x8zbj.auth0.com/.well-known/jwks.json
