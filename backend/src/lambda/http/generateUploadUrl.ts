import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { updateTodo, getTodoById } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUpload')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = todoId
  const userId = getUserId(event)
  const uploadUrl = getUploadUrl(imageId)
 
  try {
    const oldTodo = await getTodoById(todoId);
    const newTodo = {
      ...oldTodo,
      attachmentUrl: `https://${bucketName}.s3.us-east-1.amazonaws.com/${imageId}`
    };

    await updateTodo(newTodo, userId);

    logger.info('upload url generated:', uploadUrl);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  } catch (e) {
    logger.error('failed to create upload url', e);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: e
      })
    }
  }
})

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}

handler.use(
  cors({
    credentials: true
  })
)