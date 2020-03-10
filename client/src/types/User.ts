import { Category } from './Category';

export interface User {
  userId: string,
  isProfilePublic: boolean,
  displayName?: string | null,
  categories?: Category[],
  profileImageUrl: string | null
}

export const emptyUser = {
  userId: "",
  isProfilePublic: false
}