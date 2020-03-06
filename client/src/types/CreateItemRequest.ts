import { SubItem } from './SubItem';

export interface CreateItemRequest {
  title: string,
  description?: string,
  category?: string,
  url?: string
  anchorText?: string
  subItems?: SubItem[]
}
