import { User } from '../models/User'
import { UserAccess } from '../dataLayer/userAccess'
import { CreateUserRequest } from '../requests/CreateUserRequest'

const userAccess = new UserAccess()

export async function getUserById(
  userId: string,
): Promise<User> {
  return userAccess.getUser(userId)
}

export async function createUser(
  createUserRequest: CreateUserRequest,
): Promise<User> {

  // if(!currentUserId) throw new Error('not authenticated')
  console.log('incoming createUserRequest', createUserRequest);

  return await userAccess.createUser({
    userId: createUserRequest.userId,
    isProfilePublic: false,
    displayName: null,
    categories: []
  })
}

export async function updateUser(
  userObj: User,
  currentUserId: String,
): Promise<User> {
  return userAccess.updateUser(userObj, currentUserId)
}
