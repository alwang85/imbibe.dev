import { apiEndpoint } from '../config'
import { User } from '../types/User';
import { CreateUserRequest } from '../types/CreateUserRequest';
import Axios from 'axios'
import { UpdateUserRequest } from '../types/UpdateUserRequest';

export async function getUser(idToken: string, userId: string): Promise<User> {
  console.log('Fetching user', `idToken: ${idToken} userId: ${userId}`)

  const response = await Axios.get(`${apiEndpoint}/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('User:', response.data)
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
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/users/${userId}`, JSON.stringify(updatedUser), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getPublicUser(
  displayName: string,
): Promise<void> {
  await Axios.get(`${apiEndpoint}/users/${displayName}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

