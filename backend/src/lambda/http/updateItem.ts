import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import { updateItem, getItemById } from '../../businessLogic/items'
import { getUserId } from '../utils'

const logger = createLogger('generateUpload')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.id
  const updatedItem: UpdateItemRequest = JSON.parse(event.body)
  const currentUserId = getUserId(event);

  try {
    const oldItem = await getItemById(itemId);

    if (!oldItem) {
      return {
        statusCode: 404,
        body: ''
      }    
    }

    const params = {
      ...oldItem,
      description: updatedItem.description,
      title: updatedItem.title,
      category: updatedItem.category,
      url: updatedItem.url,
      subItems: updatedItem.subItems
    }
    const result = await updateItem(params, currentUserId)
    
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
