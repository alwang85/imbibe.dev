import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { Item } from '../models/Item'

export class ItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly itemIdIndex = process.env.ITEMS_ITEMID_INDEX,
    private readonly itemUseridIndex = process.env.ITEMS_USERID_INDEX,
    private readonly itemsTable = process.env.ITEMS_TABLE) {
  }

  async getAllItems(userId: String): Promise<Item[]> {
    console.log('Getting all groups')

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
    console.log('deleting item', item)
    const deleteditem = await this.docClient.delete({
      TableName: this.itemsTable,
        Key: {
          id: item.id,
          modifiedAt: item.modifiedAt,
        },
        ConditionExpression:"userId = :currentUserId",
        ExpressionAttributeValues: {
          ":currentUserId": currentUserId
        }
    }).promise();

    console.log('deleted item', deleteditem)
    return item;
  }

  async updateItem(
    item: Item,
    currentUserId: String,
  ): Promise<Item> {

    await this.docClient.update({
      TableName: this.itemsTable,
      Key: {
        id: item.id,
        userId: item.userId,
      },
      UpdateExpression: "set title=:title, category=:category, description=:description, modifiedAt=:modifiedAt, subItems=:subItems, url=:url",
      ExpressionAttributeValues:{
        ":title": item.title,
        ":category": item.category,
        ":description": item.description,
        ":modifiedAt": item.modifiedAt,
        ':userId' : currentUserId,
        ':url': item.url,
        ':subItems': item.subItems
      },
      ConditionExpression: 'userId = :userId',
    }).promise()

    return item
  }

  async createItem(item: Item): Promise<Item> {
    await this.docClient.put({
      TableName: this.itemsTable,
      Item: item
    }).promise()

    return item
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
