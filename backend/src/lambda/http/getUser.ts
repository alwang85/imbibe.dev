import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'
import { getUserById } from '../../businessLogic/users'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getUsers')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);

  try {
    const item = await getUserById(userId)

    logger.info('todo fetching success for:', userId);
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        item
      })
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