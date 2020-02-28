import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteItem, getItemById } from '../../businessLogic/items'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteItem')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const currentUserId = getUserId(event);
  const itemId = event.pathParameters.id

  try {
    const oldItem = await getItemById(itemId);

    if (!oldItem) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }    
    }

    await deleteItem(oldItem, currentUserId);

    logger.info('todo deleted:', itemId);
    
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
