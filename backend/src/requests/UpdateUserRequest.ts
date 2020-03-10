import { Category } from '../models/Category';

export interface UpdateUserRequest {
  userId: string,
  isProfilePublic: boolean,
  displayName?: string,
  categories?: Category[],
  profileImageUrl?: string | null,
}
