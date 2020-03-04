import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserByDisplayName } from '../../businessLogic/users'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getUsers')

// NOT CURRENTLY EXPOSED AS AN API
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const displayName = event.pathParameters.displayName
  if(displayName === 'none') return {
    statusCode: 403,
    body: JSON.stringify({
      error: 'invalid display name'
    })
  }

  try {
    const user = await getUserByDisplayName(displayName)

    if(user.isProfilePublic) {
      // TODO depending on whats needed, filter what is returned in profile

      return {
        statusCode: 200,
        body: JSON.stringify(user)
      }
    } else {
      logger.info('user profile is not public', user)
    }  
  } catch(e) {
    logger.error('failed to get', e);
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: e
      })
    }
  }
  
})

handler.use(
  cors({
    credentials: true
  })
)