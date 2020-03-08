import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserByDisplayName } from '../../businessLogic/users'
import { createLogger } from '../../utils/logger'
import { getAllItems } from '../../businessLogic/items'
const logger = createLogger('getPublicItemsByDisplayName')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const displayName = event.pathParameters.displayName

  logger.info('incoming display name', displayName)
  // 'none' is the default displayName
  if(displayName === 'none') return {
    statusCode: 403,
    body: JSON.stringify({
      error: 'invalid display name'
    })
  }

  try {
    const user = await getUserByDisplayName(displayName)
    logger.info('user obtained', user)

    // not sure if this logic should be in business logic
    if(user.isProfilePublic) {
      const userCategories = user.categories || [];
      logger.info('userCategories', userCategories)
      const userPublicCategoryNames = userCategories
        // TODO add a sort for category
        .filter(category => category.public === true)
        .sort((a, b) => {
          return a.order - b.order;
        })
        .map(category => category.name);
      // fetches all items and return only the categories that are public
      logger.info('userPublicCategoryNames', userPublicCategoryNames)

      const items = await getAllItems(user.userId);

      // @ts-ignore
      items.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
      logger.info('all items obtained here', items);
      const filteredItems = items.filter(item => userPublicCategoryNames.includes(item.category)) || [];
      logger.info('filtered items', filteredItems);

      const result = userPublicCategoryNames.map(categoryName => ({
        category: categoryName,
        items: filteredItems.filter(item => item.category === categoryName)
      }))
      return {
        statusCode: 200,
        body: JSON.stringify(result)
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