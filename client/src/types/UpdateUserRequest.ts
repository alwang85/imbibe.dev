import { Category } from './Category';

export interface UpdateUserRequest {
  userId: string,
  isProfilePublic: boolean,
  displayName?: string | null,
  categories?: Category[],
  profileImageUrl?: string | null,
  description?: string | null,
}
