import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Item } from '../models/Item'
import { createLogger } from '../utils/logger'

const logger = createLogger('itemAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class ItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly itemIdIndex = process.env.ITEMS_ITEMID_INDEX,
    private readonly itemUseridIndex = process.env.ITEMS_USERID_INDEX,
    private readonly itemsTable = process.env.ITEMS_TABLE) {
  }

  async getAllItems(userId: String): Promise<Item[]> {
    logger.info('Getting all groups')

    const result = await this.docClient.query({
      TableName: this.itemsTable,
      IndexName: this.itemUseridIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as Item[]
  }

  async getItem(id: String): Promise<Item> {
    const result = await this.docClient.query({
      TableName: this.itemsTable,
      IndexName: this.itemIdIndex,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
      ScanIndexForward: false
    }).promise()

    const item = result.Items
    return item[0] as Item
  }

  async deleteItem(
    item: Item,
    currentUserId: String,
  ): Promise<Item> {
    logger.info('deleting item', item)
    const deleteditem = await this.docClient.delete({
      TableName: this.itemsTable,
        Key: {
          id: item.id,
          createdAt: item.createdAt,
        },
        ConditionExpression:"userId = :currentUserId",
        ExpressionAttributeValues: {
          ":currentUserId": currentUserId
        }
    }).promise();

    logger.info('deleted item', deleteditem)
    return item;
  }

  async updateItem(
    item: Item,
    currentUserId: String,
  ): Promise<Item> {

    console.info('updateItem in dataLayer', item);
    await this.docClient.update({
      TableName: this.itemsTable,
      Key: {
        id: item.id,
        createdAt: item.createdAt,
      },
      UpdateExpression: "set title=:title, category=:category, description=:description, modifiedAt=:modifiedAt, subItems=:subItems, #uurl=:url, anchorText=:anchorText",
      ExpressionAttributeValues:{
        ":title": item.title,
        ":category": item.category,
        ":description": item.description,
        ":modifiedAt": item.modifiedAt,
        ':userId' : currentUserId,
        ':url': item.url,
        ':anchorText': item.anchorText,
        ':subItems': item.subItems
      },
      ExpressionAttributeNames: {
        '#uurl': 'url' // caused hidden errors due to reserved word
      },
      ConditionExpression: 'userId = :userId',
    }).promise()

    return item
  }

  async createItem(item: Item): Promise<Item> {
    console.info('createItem in dataLayer', item);
    await this.docClient.put({
      TableName: this.itemsTable,
      Item: item
    }).promise()

    return item
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
