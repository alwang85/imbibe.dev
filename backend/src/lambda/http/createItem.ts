import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateItemRequest } from '../../requests/CreateItemRequest'
import { createItem } from '../../businessLogic/items';
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createItem')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newItem: CreateItemRequest = JSON.parse(event.body)
  const userId = getUserId(event);
  try {
    const createdItem = await createItem(newItem, userId);

    logger.info('new item created', createdItem)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdItem,
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
