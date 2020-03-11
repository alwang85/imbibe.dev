import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { User } from '../models/User'
import { createLogger } from '../utils/logger'

const logger = createLogger('userAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class UserAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly usersTable = process.env.USERS_TABLE,
    private readonly usersDisplayNameIndex = process.env.USERS_DISPLAYNAME_INDEX) {
  }

  async getUser(userId: String): Promise<User> {
    logger.info('incoming userId in getUser', userId)
    const result = await this.docClient.query({
      TableName: this.usersTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false
    }).promise()

    logger.info('obtained user', result)

    const item = result.Items
    logger.info('returning user item', item[0]);
    return item[0] as User
  }

  async getUserByDisplayName(displayName: String): Promise<User> {
    logger.info('incoming displayName in getUserByDisplayName', displayName)
    const result = await this.docClient.query({
      TableName: this.usersTable,
      IndexName: this.usersDisplayNameIndex,
      KeyConditionExpression: 'displayName = :displayName',
      ExpressionAttributeValues: {
        ':displayName': displayName,
      },
      ScanIndexForward: false
    }).promise()

    logger.info('obtained user', result)

    const item = result.Items
    logger.info('returning user item', item[0]);
    return item[0] as User
  }

  async createUser(userObj: User): Promise<User> {
    logger.info('createUser in dataLayer', userObj);
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

    logger.info('incoming userObject in updateUser', userObject);
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
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
