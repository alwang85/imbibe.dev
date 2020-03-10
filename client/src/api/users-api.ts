import { apiEndpoint } from '../config'
import { User } from '../types/User';
import { CreateUserRequest } from '../types/CreateUserRequest';
import Axios from 'axios'
import { UpdateUserRequest } from '../types/UpdateUserRequest';

export async function getUser(idToken: string, userId: string): Promise<User> {
  const response = await Axios.get(`${apiEndpoint}/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data
}

export async function createUser(
  idToken: string,
  newUser: CreateUserRequest
): Promise<User> {
  const response = await Axios.post(`${apiEndpoint}/users`,  JSON.stringify(newUser), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log('Created User:', response.data)
  return response.data
}

export async function patchUser(
  idToken: string,
  userId: string,
  updatedUser: UpdateUserRequest
): Promise<User> {
  const response = await Axios.patch(`${apiEndpoint}/users/${userId}`, JSON.stringify(updatedUser), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data
}

export async function getDisplayNameAvailability(
  idToken: string,
  displayName: string,
): Promise<{ displayNameAvailable: boolean}> {
  const response = await Axios.get(`${apiEndpoint}/users/public/${displayName}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data;
}

export async function getUploadUrl(
  idToken: string,
  userId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/users/${userId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
