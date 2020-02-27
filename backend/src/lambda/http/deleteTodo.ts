import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteTodo, getTodoById } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const currentUserId = getUserId(event);
  const todoId = event.pathParameters.todoId

  try {
    const oldTodo = await getTodoById(todoId);

    if (!oldTodo) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }    
    }

    await deleteTodo(oldTodo, currentUserId);

    logger.info('todo deleted:', todoId);
    
    return {
      statusCode: 204,
      body: 'success'
    }
  } catch(e) {
    logger.error('error deleting!', e)
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
