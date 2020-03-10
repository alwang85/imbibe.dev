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
  const userIdFromPath = decodeURI(event.pathParameters.userId)
  const updatedUser: UpdateUserRequest = JSON.parse(event.body)
  logger.info('event before getUserId', {
    userIdFromPath,
    updatedUser,
    event
  })
  
  try {
    const currentUserId = getUserId(event);
    logger.info('inside updateUser', {
      userIdFromPath,
      updatedUser,
      currentUserId
    })
    const oldUser = await getUserById(userIdFromPath);
    logger.info('old item in updateUser', oldUser);

    if (!oldUser) {
      logger.info('no old user found, returning 404')
      return {
        statusCode: 404,
        body: ''
      }    
    }

    const params = {
      ...oldUser,
      isProfilePublic: updatedUser.isProfilePublic,
      displayName: updatedUser.displayName,
      categories: updatedUser.categories,
      profileImageUrl: updatedUser.profileImageUrl,
      description: updatedUser.description,
    }

    logger.info('params in updateUser', params);
    const result = await updateUser(params, currentUserId)
    
    logger.info('user updated', userIdFromPath);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
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
