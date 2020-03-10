import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserByDisplayName } from '../../businessLogic/users'
const logger = createLogger('getPublicItemsByDisplayName')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const displayNameFromPath = decodeURI(event.pathParameters.displayName)

  try {
    const user = await getUserByDisplayName(displayNameFromPath)
    logger.info('user obtained', user)

    // not sure if this logic should be in business logic
    if(user.isProfilePublic) {

      const profile = {
        description: user.description,
        profileImageUrl: user.profileImageUrl,
      };

      return {
        statusCode: 200,
        body: JSON.stringify(profile)
      }
    } else {
      logger.info('user profile is not public', user)
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'user profile is not public'
        })
      }
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