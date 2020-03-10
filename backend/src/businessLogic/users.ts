import { User } from '../models/User'
import { UserAccess } from '../dataLayer/userAccess'
import { CreateUserRequest } from '../requests/CreateUserRequest'

const userAccess = new UserAccess()

export async function getUserById(
  userId: string,
): Promise<User> {
  return userAccess.getUser(userId)
}

export async function getUserByDisplayName(
  displayName: string,
): Promise<User> {
  return userAccess.getUserByDisplayName(displayName)
}

export async function createUser(
  createUserRequest: CreateUserRequest,
): Promise<User> {

  // if(!currentUserId) throw new Error('not authenticated')
  console.log('incoming createUserRequest', createUserRequest);

  return await userAccess.createUser({
    userId: createUserRequest.userId,
    isProfilePublic: false,
    displayName: "none",
    categories: [{
      name: 'unsorted',
      public: false,
      order: 100,
    }],
    profileImageUrl: null,
    description: null,
  })
}

export async function updateUser(
  userObj: User,
  currentUserId: String,
): Promise<User> {
  return userAccess.updateUser(userObj, currentUserId)
}
