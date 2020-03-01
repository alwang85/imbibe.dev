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
    const result = await this.docClient.query({
      TableName: this.usersTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false
    }).promise()

    const item = result.Items
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
        userId: currentUserId,
      },
      UpdateExpression: "set title=:title, category=:category, description=:description, modifiedAt=:modifiedAt, subItems=:subItems, #uurl=:url",
      ExpressionAttributeValues:{
        ":userId": userObject.userId,
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
