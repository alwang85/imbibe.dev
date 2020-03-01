import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { UpdateUserRequest } from '../../requests/UpdateUserRequest'
import { updateUser, getUserById } from '../../businessLogic/users'
import { getUserId } from '../utils'

const logger = createLogger('updateUser')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.id
  const updatedUser: UpdateUserRequest = JSON.parse(event.body)
  const currentUserId = getUserId(event);

  try {
    const oldUser = await getUserById(itemId);
    logger.info('old item in updateUser', oldUser);

    if (!oldUser) {
      return {
        statusCode: 404,
        body: ''
      }    
    }

    const params = {
      ...oldUser,
      isProfilePublic: updatedUser.isProfilePublic,
      displayName: updatedUser.displayName,
      categories: updatedUser.categories
    }

    logger.info('params in updateUser', params);
    const result = await updateUser(params, currentUserId)
    
    logger.info('item updated', itemId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: result,
      })
    }
  } catch(e) {
    logger.error('failed update', e);
    return {
      statusCode: 500,
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
