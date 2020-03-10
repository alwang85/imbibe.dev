import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { updateUser, getUserById } from '../../businessLogic/users'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUpload')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userIdFromPath = decodeURI(event.pathParameters.userId)
  const imageId = userIdFromPath + Math.round(Math.random() * 100000);
  const userId = getUserId(event)
  const uploadUrl = getUploadUrl(imageId)
 
  try {
    const oldUser = await getUserById(userIdFromPath);
    const newUser = {
      ...oldUser,
      profileImageUrl: `https://${bucketName}.s3.us-east-1.amazonaws.com/${imageId}`
    };

    await updateUser(newUser, userId);

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