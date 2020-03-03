import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { User } from '../models/User'

export class UserAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly usersTable = process.env.USERS_TABLE) {
  }

  async getUser(userId: String): Promise<User> {
    console.log('incoming userId in getUser', userId)
    const result = await this.docClient.query({
      TableName: this.usersTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false
    }).promise()

    console.log('obtained user', result)

    const item = result.Items
    console.log('returning user item', item[0]);
    return item[0] as User
  }

  async createUser(userObj: User): Promise<User> {
    console.info('createUser in dataLayer', userObj);
    await this.docClient.put({
      TableName: this.usersTable,
      Item: userObj
    }).promise()

    return userObj
  }

  async updateUser(
    userObject: User,
    currentUserId: String,
  ): Promise<User> {

    console.info('incoming userObject in updateUser', userObject);
    await this.docClient.update({
      TableName: this.usersTable,
      Key: {
        userId: userObject.userId,
      },
      UpdateExpression: "set isProfilePublic=:isProfilePublic, displayName=:displayName, categories=:categories",
      ExpressionAttributeValues:{
        ":currentUserId": currentUserId,
        ":isProfilePublic": userObject.isProfilePublic,
        ':displayName': userObject.displayName,
        ':categories': userObject.categories
      },
      ConditionExpression: 'userId = :currentUserId',
    }).promise()

    return userObject
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
