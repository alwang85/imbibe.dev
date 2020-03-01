import { Category } from './Category';

export interface UpdateUserRequest {
  userId: string,
  isProfilePublic: boolean,
  displayName?: string,
  categories?: Category[]
}
