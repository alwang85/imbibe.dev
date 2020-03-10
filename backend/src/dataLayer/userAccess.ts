import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { User } from '../models/User'

export class UserAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly usersTable = process.env.USERS_TABLE,
    private readonly usersDisplayNameIndex = process.env.USERS_DISPLAYNAME_INDEX) {
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

  async getUserByDisplayName(displayName: String): Promise<User> {
    console.log('incoming displayName in getUserByDisplayName', displayName)
    const result = await this.docClient.query({
      TableName: this.usersTable,
      IndexName: this.usersDisplayNameIndex,
      KeyConditionExpression: 'displayName = :displayName',
      ExpressionAttributeValues: {
        ':displayName': displayName,
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
      UpdateExpression: "set isProfilePublic=:isProfilePublic, displayName=:displayName, categories=:categories, profileImageUrl=:profileImageUrl, description=:description",
      ExpressionAttributeValues:{
        ":currentUserId": currentUserId,
        ":isProfilePublic": userObject.isProfilePublic,
        ":displayName": userObject.displayName,
        ":categories": userObject.categories,
        ":profileImageUrl": userObject.profileImageUrl,
        ":description": userObject.description,
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
