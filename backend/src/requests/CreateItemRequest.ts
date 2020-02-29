import { SubItem } from '../models/SubItem';

export interface CreateItemRequest {
  title: string,
  description?: string,
  category?: string,
  url?: string
  subItems?: SubItem[]
}
