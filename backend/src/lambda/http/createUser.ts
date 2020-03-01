import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateUserRequest } from '../../requests/CreateUserRequest'
import { createUser } from '../../businessLogic/users';
import { createLogger } from '../../utils/logger'

const logger = createLogger('createUser')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newUser: CreateUserRequest = JSON.parse(event.body)
  try {
    const createdUser = await createUser(newUser);

    logger.info('new user created', createdUser)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdUser,
      })
    }
  } catch(e) {
    logger.error('failed create', e);
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
