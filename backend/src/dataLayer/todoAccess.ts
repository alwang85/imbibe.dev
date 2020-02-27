import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoIdIndex = process.env.TODOS_TODOID_INDEX,
    private readonly todoUseridIndex = process.env.TODOS_USERID_INDEX,
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(userId: String): Promise<TodoItem[]> {
    console.log('Getting all groups')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoUseridIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(todoId: String): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId,
      },
      ScanIndexForward: false
    }).promise()

    const item = result.Items
    return item[0] as TodoItem
  }

  async deleteTodo(
    todo: TodoItem,
    currentUserId: String,
  ): Promise<TodoItem> {
    console.log('deleting item', todo)
    const deleteditem = await this.docClient.delete({
      TableName: this.todosTable,
        Key: {
          todoId: todo.todoId,
          userId: todo.userId,
        },
        ConditionExpression:"userId = :currentUserId",
        ExpressionAttributeValues: {
          ":currentUserId": currentUserId
        }
    }).promise();

    console.log('deleted item', deleteditem)
    return todo;
  }

  async updateTodo(
    todo: TodoItem,
    currentUserId: String,
  ): Promise<TodoItem> {

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todo.todoId,
        userId: todo.userId,
      },
      UpdateExpression: "set done=:done, attachmentUrl=:attachmentUrl, dueDate=:dueDate, #nname=:name",
      ExpressionAttributeValues:{
        ":done": todo.done,
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ':userId' : currentUserId,
        ':attachmentUrl': todo.attachmentUrl
      },
      ExpressionAttributeNames: {
        '#nname': 'name' // caused hidden errors due to reserved word
      },
      ConditionExpression: 'userId = :userId',
    }).promise()

    return todo
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
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
