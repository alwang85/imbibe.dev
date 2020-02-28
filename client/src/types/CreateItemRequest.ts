import { subItem } from './SubItem';

export interface CreateItemRequest {
  title: string,
  description?: string,
  category?: string,
  url?: string
  subItems?: subItem[]
}
