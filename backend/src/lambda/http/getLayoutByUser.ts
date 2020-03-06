import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserById } from '../../businessLogic/users'
import { createLogger } from '../../utils/logger'
import { getAllItems } from '../../businessLogic/items'
import { getUserId } from '../utils'
const logger = createLogger('getLayoutByUser')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userIdFromPath = decodeURI(event.pathParameters.userId)
  const currentId = getUserId(event);

  if(userIdFromPath !== currentId) {
    logger.info('mismatch in userIds', {
      userIdFromPath,
      currentId
    })
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'not authorized'
      })
    }
  } 

  try {
    const user = await getUserById(userIdFromPath)
    logger.info('user obtained', user)

    // not sure if this logic should be in business logic
    const userCategories = user.categories || [];
    logger.info('userCategories', userCategories)
    const userCategoryNames = userCategories
      .sort((a, b) => {
        return a.order - b.order;
      })
      .map(category => category.name);
    // fetches all items and return only the categories that are public
    logger.info('userCategoryNames', userCategoryNames)

    const items = await getAllItems(user.userId);
    logger.info('all items obtained here', items);

    const result = userCategoryNames.map(categoryName => ({
      category: categoryName,
      items: items.filter(item => item.category === categoryName)
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result)
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